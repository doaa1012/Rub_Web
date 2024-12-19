import numpy as np
import pandas as pd
import xarray as xr
from pathlib import Path
from tqdm import tqdm
from nptdms import TdmsFile
from datatree import DataTree
import matplotlib.pyplot as plt

def load_tdms(path: str | Path, ph: float, d_cap: float, offset_pot: float = 0, st_pot: float = 0.21) -> DataTree | None:
    """
    Loads a TDMS file from a given path, processes it into a DataTree structure, and computes the current density.

    :param path: string or Path object to the TDMS file
    :param ph: pH of the electrolyte
    :param d_cap: diameter of the capillary in nm, used to obtain the current density
    :param offset_pot: potential difference of the used reference electrode to the standard reference electrode in V
    :param st_pot: standard potential of the (standard) reference electrode in V, for Ag|AgCl|3M KCl it is 0.21 V, default value
    :return: DataTree with the experiment data structured for further analysis
    """

    # Load the TDMS file and convert the data into a DataFrame
    tdms_file = TdmsFile(path)
    data = tdms_file['Data'].as_dataframe()

    # Add a column for the cumulated time
    data['t(s)'] = data['dt(s)'].cumsum()

    # Return None if invalid data (negative line numbers or missing retraction tip)
    if (data['Line Number'] < 0).any().any() or 3 not in data['FeedbackType '].values:
        return None

    # Convert line numbers to integers
    data['Line Number'] = data['Line Number'].astype(int)

    # Group the data by line numbers and compute the average feedback type (FT)
    feed_types = data.groupby('Line Number')['FeedbackType '].mean()

    # Determine valid measurements: retraction (FT 3), approach (FT 2), and in-between movement points are excluded
    is_meas = ~ ((feed_types == 3) | (feed_types == 3).shift(periods=1, fill_value=False) | (feed_types == 2))

    # Handle case where no valid first approach is found (FT 1)
    if feed_types[feed_types == 1].empty:
        return None

    # Find the index of the first approach and set all measurements before that as False
    apr1_idx = feed_types[feed_types == 1].index[-1]
    is_meas[:apr1_idx] = False

    # Determine measurement areas and associate them with line numbers
    apr = (feed_types == 1).shift(periods=1, fill_value=False) | (feed_types == 2)
    meas1 = apr.shift(periods=1, fill_value=False)
    meas_area = meas1.astype(int).cumsum()
    meas_area[~is_meas] = 0

    # Assign measurement area numbers back to the DataFrame
    data['MeasNumber'] = meas_area[data['Line Number']].reset_index(drop=True)

    # Compute the sweep number by resetting cumulative sum after every NaN value (not measuring)
    meas_nan = is_meas.astype(int).replace(0, np.nan)
    meas_cum = meas_nan.cumsum().ffill().fillna(0)
    meas_restart = meas_cum.mask(is_meas, np.nan).ffill()
    n_sweeps = (meas_cum - meas_restart).astype(int)
    data['SweepNumber'] = n_sweeps[data['Line Number']].reset_index(drop=True)

    # Remove data points where the line number jumps by more than one
    data = data[data['Line Number'].diff() <= 1]

    # Filter out non-measurement points and keep only relevant columns
    keep_cols = ['MeasNumber', 'SweepNumber', 'X (um)', 'Y (um)', 'V1 (V)', 'Current1 (A)', 't(s)']
    d_filt = data[data['MeasNumber'] != 0][keep_cols].reset_index(drop=True)

    # Convert the potential to the reference electrode using the Nernst equation
    d_filt['Potential'] = d_filt['V1 (V)'] + offset_pot + st_pot + 0.059 * ph

    # Calculate the area of the capillary in cm^2
    cap_area = np.pi * (d_cap * 1e-7 / 2) ** 2

    # Convert the current to a current density in A/cm^2
    d_filt['CurrDens'] = d_filt['Current1 (A)'] / cap_area

    # Convert the DataFrame into xarray.Dataset for DataTree structure
    ds = xr.Dataset(
        {
            'Potential': (['time'], d_filt['Potential']),
            'CurrentDensity': (['time'], d_filt['CurrDens']),
            'X_um': (['time'], d_filt['X (um)']),
            'Y_um': (['time'], d_filt['Y (um)']),
            'SweepNumber': (['time'], d_filt['SweepNumber']),
            'MeasNumber': (['time'], d_filt['MeasNumber']),
        },
        coords={
            'time': d_filt['t(s)']
        }
    )

    # Create the DataTree from the xarray.Dataset
    tree = DataTree(ds)

    # Add metadata
    tree.attrs['filename'] = Path(path).name
    tree.attrs['pH'] = ph
    tree.attrs['capillary_diameter'] = d_cap
    tree.attrs['offset_potential'] = offset_pot
    tree.attrs['standard_potential'] = st_pot

    return tree

def extract_lsvs(tree: DataTree, sweep: int, rem_hop_areas: int | list[int] = None, pots: list | np.ndarray = None) -> DataTree | None:
    """
    Extracts LSVs of all hopping areas from a given sweep number, interpolates them, and computes the average LSV.
    
    :param tree: DataTree with the data from the experiment
    :param sweep: Sweep number to extract from the voltammogram
    :param rem_hop_areas: List of hopping areas to be removed from the LSVs (optional)
    :param pots: List or numpy array of potentials to interpolate to (optional)
    :return: DataTree with interpolated LSVs and averaged LSV across hopping areas
    """
    # Access the dataset from DataTree
    ds = tree.ds

    # Filter the dataset for the given sweep number
    d_sweep = ds.where(ds.SweepNumber == sweep, drop=True)

    # Remove specific hopping areas if defined
    if rem_hop_areas is not None:
        rem_hop_areas = [rem_hop_areas] if isinstance(rem_hop_areas, int) else rem_hop_areas
        d_sweep = d_sweep.where(~d_sweep.MeasNumber.isin(rem_hop_areas), drop=True)

    # If no potentials list is provided, calculate the mutual minimum and maximum potentials
    if pots is None:
        s_min, s_max = d_sweep.Potential.min().item(), d_sweep.Potential.max().item()

        # Calculate the scan rate by finding the most frequent difference between potentials
        s_rates = []
        for area in np.unique(d_sweep.MeasNumber.values):
            potentials = d_sweep.where(d_sweep.MeasNumber == area, drop=True).Potential.values
            diffs = np.diff(potentials)
            if len(diffs) > 0:
                s_rates.extend(diffs)

        # Find the most frequent scan rate (mode)
        s_rate_mode = -pd.Series(s_rates).mode()

        # If no frequent scan rate is found, return None
        if len(s_rate_mode) == 0:
            return None

        # Use the mode scan rate to define the potential range for interpolation
        s_rate = s_rate_mode.iloc[0]
        pots = np.arange(s_min, s_max, s_rate)

    # Prepare to store the interpolated LSVs
    areas = np.unique(d_sweep.MeasNumber.values)
    interp_data = {}

    # Interpolate the LSVs for each hopping area individually
    for h_area in areas:
        d = d_sweep.where(d_sweep.MeasNumber == h_area, drop=True).sortby('Potential')
        interp_data[h_area] = np.interp(pots, d.Potential.values, d.CurrentDensity.values, left=np.nan, right=np.nan)



    # Create an xarray.Dataset for the interpolated data
    lsv_ds = xr.Dataset(
        data_vars={f'Area_{area}': (['Potential'], interp_data[area]) for area in areas},
        coords={'Potential': pots}
    )

    # Compute the average LSV across all areas
    avg_lsv = np.nanmean(list(interp_data.values()), axis=0)
    lsv_ds['Average'] = ('Potential', avg_lsv)

    # Create a new DataTree for the interpolated LSVs and add it to the existing tree
    lsv_tree = DataTree(lsv_ds)
    lsv_tree.attrs['sweep'] = sweep
    lsv_tree.attrs['removed_hop_areas'] = rem_hop_areas
    lsv_tree.attrs['interpolated_potentials'] = pots

    return lsv_tree

def load_lsvs(path: str | Path, sweep: int, ph: float, d_cap: float, offset_pot: float = 0, st_pot: float = 0.21) -> dict[int, pd.DataFrame]:
    """
    Loads long range SECCM results into a dictionary of DataFrames. Each DataFrame contains one column with the
    potentials converted to the reference electrode and a column with the current densities.

    :param path: path to the folder with the long range SECCM measurement results
    :param sweep: sweep to extract from the cyclic voltammogram of each hopping area
    :param ph: pH of the electrolyte
    :param d_cap: diameter of the capillary in nm, used to obtain the current density
    :param offset_pot: offset potential in V
    :param st_pot: standard potential, by default 0.21 V for the RHE
    :return: dictionary with measurement areas and LSVs
    """
    # Get the directory of the current script
    script_dir = Path(__file__).parent

    # Define the path to the conversion.csv file relative to the script directory
    conversion_path = script_dir / 'conversion.csv'

    # Load the conversion table
    try:
        conv_table = pd.read_csv(conversion_path, index_col=1).squeeze()
    except FileNotFoundError:
        return None

    # Proceed with the rest of your function
    path = Path(path) if isinstance(path, str) else path

    # Ensure the directory contains .tdms files
    paths = [p for p in path.glob('*') if p.suffix == '.tdms']
    if not paths:
        return None
    lsvs = {}

    for path in tqdm(paths):
        try:
            sp = path.stem.split(' ')
            ma, x, y = int(sp[0]), int(sp[2]), int(sp[4])
            ma = int(conv_table.loc[ma])  # Convert ma to native Python int

            # Load the tdms data
            data_tree = load_tdms(path, ph, d_cap, offset_pot, st_pot)
            if data_tree is None:
                continue

            # Extract LSV data
            lsv_tree = extract_lsvs(data_tree, sweep, rem_hop_areas=1)
            if lsv_tree is None:
                continue

            # Convert to DataFrame
            df = lsv_tree.ds.to_dataframe()
            if 'Average' not in df.columns:
                continue

            avg_lsv = df['Average']
            df_avg = avg_lsv.reset_index().rename(columns={'Average': 'Current density [A/cm^2]'})

            lsvs[int(ma)] = df_avg  # Ensure that the dictionary key is a native Python int

        except Exception as e:
            continue

    if not lsvs:
        return None

    lsvs = dict(sorted(lsvs.items()))
    return lsvs



if __name__ == "__main__":
    lsvs_path = r'C:\Users\doaam\Downloads\PhD\SECCM_new\0010403_Ag-Au-Cu-Pd-Pt_LSVs_SECCM_HER_pH_1.0_tip_1150nm_meas_3\0010403_Ag-Au-Cu-Pd-Pt_LSVs_SECCM_HER_pH_1.0_tip_1150nm_meas_3'
    # Define the standard potential
    st_pot = 0.21  # V
    offset_pot = 0  # V
    # Define the pH
    ph = 1
    # Define the capillary diameter
    d_cap = 1150  # nm
    # Define the sweep to keep from the voltammograms
    sweep = 7  # beginns at 1
    lsvs= load_lsvs(lsvs_path, sweep, ph, d_cap, offset_pot, st_pot)