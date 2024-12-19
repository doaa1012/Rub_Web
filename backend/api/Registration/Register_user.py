import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import Aspnetusers
import uuid  # To generate security and concurrency stamps

# Function to hash password using the ASP.NET API
def hash_password(password):
    api_url = 'http://localhost:5046/api/passwordhash/hash'
    payload = {
        'Password': password
    }
    headers = {
        'Content-Type': 'application/json'
    }
    
    # Send POST request to the ASP.NET API to hash the password
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()  # Raise exception for HTTP errors
    except requests.RequestException as e:
        print(f"Error communicating with ASP.NET API: {e}")
        return None

    # Return the hashed password if successful
    if response.status_code == 200:
        return response.text.strip()  # Strip extra whitespace if necessary
    else:
        return None

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Ensure email and password are provided
            if not email or not password:
                return JsonResponse({'status': 'fail', 'message': 'Email and password are required'}, status=400)

            # Log the email being checked
            print(f"Checking for existing user with email: {email}")

            # Check if the user already exists
            if Aspnetusers.objects.filter(normalizedemail=email.upper()).exists():
                print("User already exists")
                return JsonResponse({'status': 'fail', 'message': 'User already exists'}, status=400)

            # Hash the password using the ASP.NET API
            hashed_password = hash_password(password)
            if not hashed_password:
                return JsonResponse({'status': 'fail', 'message': 'Password hashing failed'}, status=500)

            # Log the hashed password for debugging (optional, be cautious in production)
            print(f"Hashed password: {hashed_password}")

            # Generate UUIDs for securitystamp and concurrencystamp
            security_stamp = str(uuid.uuid4())
            concurrency_stamp = str(uuid.uuid4())

            # Create and save the user in the Django database
            user = Aspnetusers(
                email=email,
                passwordhash=hashed_password,  # Save the hashed password
                normalizedemail=email.upper(),  # Assuming normalized email is the uppercased email
                emailconfirmed=False,  # Set default value for email confirmation
                phonenumber=None,  # Set phone number to None since it's not provided
                phonenumberconfirmed=False,  # Set PhoneNumberConfirmed to False
                securitystamp=security_stamp,  # Required field
                concurrencystamp=concurrency_stamp,  # Required field
                accessfailedcount=0,  # Default value
                lockoutenabled=False,  # Default value
                twofactorenabled=False  # Default value
            )
            user.save()

            return JsonResponse({'status': 'success', 'message': 'User registered successfully'})

        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error parsing input: {e}")
            return JsonResponse({'status': 'fail', 'message': 'Invalid input'}, status=400)
        except Exception as e:
            print(f"Error during registration: {e}")
            return JsonResponse({'status': 'fail', 'message': f"An error occurred: {str(e)}"}, status=500)

