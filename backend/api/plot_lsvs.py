import matplotlib.pyplot as plt
from io import BytesIO
import base64
from django.http import JsonResponse
import numpy as np
import pandas as pd
from django.views.decorators.csrf import csrf_exempt
import json
@csrf_exempt
def plot_lsvs(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        lsvs_data = data.get('lsvs_data', {})
        selected_area = data.get('selected_area', None)

        # Check if the selected_area exists in the LSVs data
        if selected_area not in lsvs_data:
            return JsonResponse({'success': False, 'error': 'Selected area not found'}, status=400)

        df = pd.DataFrame(lsvs_data[selected_area], columns=['Potential', 'Current density [A/cm^2]'])

        # Plot the data
        plt.figure(figsize=(6, 4))
        plt.plot(df['Potential'], df['Current density [A/cm^2]'], label=f'Measurement Area: {selected_area}')
        plt.xlabel('Potential (V)')
        plt.ylabel('Current density [A/cm^2]')
        plt.title(f'LSV for Measurement Area {selected_area}')
        plt.grid(True)
        plt.legend()

        # Save the plot to a bytes buffer
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)

        # Encode the plot as base64
        image_png = buffer.getvalue()
        plot_data = base64.b64encode(image_png).decode('utf-8')
        buffer.close()

        return JsonResponse({'success': True, 'plot_data': plot_data})

