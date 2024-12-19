from django.http import JsonResponse, Http404
import logging
from .utils.utils import load_lsvs  # Adjust the import path based on your project
from django.views.decorators.csrf import csrf_exempt
from .models import Objectinfo  # Ensure the correct model import
import json
import os
import zipfile
import tempfile  # For handling temporary file extraction
import shutil  # To handle file/folder movement after extraction
import uuid 
logger = logging.getLogger(__name__)

BASE_FILE_PATH = r'C:\Users\doaam\Downloads\PhD\backup\RUB_INF_CRC1625'
EXTRACTION_SAVE_PATH = r'C:\Users\doaam\Downloads\PhD\extracted'

def extract_zip_twice(zip_path):
    """ Extract the zip file twice if necessary and save the folder containing .tdms files to a permanent location. """
    if zipfile.is_zipfile(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            with tempfile.TemporaryDirectory() as temp_dir:
                zip_ref.extractall(temp_dir)

                # Filter out __MACOSX and find any valid folders
                extracted_dirs = [os.path.join(temp_dir, d) for d in os.listdir(temp_dir) 
                                  if os.path.isdir(os.path.join(temp_dir, d)) and d != "__MACOSX"]

                if len(extracted_dirs) == 1:
                    second_level_dir = extracted_dirs[0]
                    subdirs = [os.path.join(second_level_dir, d) for d in os.listdir(second_level_dir) 
                               if os.path.isdir(os.path.join(second_level_dir, d)) and d != "__MACOSX"]

                    if subdirs:
                        final_extract_dir = subdirs[0]
                        save_path = os.path.join(EXTRACTION_SAVE_PATH, os.path.basename(final_extract_dir))

                        # If the path already exists, append a unique identifier to the folder name
                        if os.path.exists(save_path):
                            save_path = f"{save_path}_{uuid.uuid4().hex}"

                        shutil.move(final_extract_dir, save_path)
                        return save_path

                if extracted_dirs:
                    final_extract_dir = extracted_dirs[0]
                    save_path = os.path.join(EXTRACTION_SAVE_PATH, os.path.basename(final_extract_dir))

                    # If the path already exists, append a unique identifier to the folder name
                    if os.path.exists(save_path):
                        save_path = f"{save_path}_{uuid.uuid4().hex}"

                    shutil.move(final_extract_dir, save_path)
                    return save_path

    return None


@csrf_exempt  
def load_lsvs_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            object_id = data.get('object_id')
            if not object_id:
                return JsonResponse({'success': False, 'error': 'Object ID is required'}, status=400)

            # Fetch the object from the database using the object_id
            try:
                obj = Objectinfo.objects.get(objectid=object_id)
            except Objectinfo.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Object not found'}, status=404)

            # Get the path from the object
            relative_path = obj.objectfilepath
            if not relative_path:
                return JsonResponse({'success': False, 'error': 'File path not found for this object'}, status=404)

            # Construct the full file path
            lsvs_path = os.path.join(BASE_FILE_PATH, relative_path.strip('/'))
            if not os.path.exists(lsvs_path):
                return JsonResponse({'success': False, 'error': 'LSV file not found'}, status=404)

            # Extract the zip file twice to get to the inner folder containing .tdms files
            extracted_dir = extract_zip_twice(lsvs_path)
            if not extracted_dir:
                return JsonResponse({'success': False, 'error': 'Error during extraction or no .tdms folder found'}, status=500)

            # Debugging: print the folder where .tdms files are located
            print(f"Folder with .tdms files: {extracted_dir}")

            # Get additional parameters from the request
            st_pot = float(data.get('st_pot', 0.21))
            offset_pot = float(data.get('offset_pot', 0))
            ph = float(data.get('ph', 1))
            d_cap = float(data.get('d_cap', 1150))
            sweep = int(data.get('sweep', 7))
            lsvs_path = r'C:\Users\doaam\Downloads\PhD\SECCM_new\0010403_Ag-Au-Cu-Pd-Pt_LSVs_SECCM_HER_pH_1.0_tip_1150nm_meas_3\0010403_Ag-Au-Cu-Pd-Pt_LSVs_SECCM_HER_pH_1.0_tip_1150nm_meas_3'
            
            # Send the folder path to the load_lsvs function instead of individual .tdms files
            lsvs = load_lsvs(lsvs_path, sweep, ph, d_cap, offset_pot, st_pot)

            if not lsvs or len(lsvs) == 0:
                # If no valid LSV data was processed, return a failure message
                return JsonResponse({'success': False, 'error': 'No valid LSV data was processed, experiment may have failed.'}, status=500)

            # Convert DataFrames in the dictionary to a JSON-serializable format
            lsvs_json_serializable = {int(key): value.to_dict(orient='list') for key, value in lsvs.items()}

            return JsonResponse({'success': True, 'data': lsvs_json_serializable}, safe=False)

        except Exception as e:
            logger.error(f"Error loading LSVs: {str(e)}")
            return JsonResponse({'success': False, 'error': f"An error occurred: {str(e)}"}, status=500)
    
    # Handle GET request to avoid ValueError
    elif request.method == 'GET':
        return JsonResponse({'success': False, 'error': 'GET method not allowed. Use POST.'}, status=405)

    else:
        return JsonResponse({'success': False, 'error': 'Invalid method.'}, status=405)
