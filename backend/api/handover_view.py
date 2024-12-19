from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Handover, Aspnetuserclaims
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def handover_view(request):
    if request.method == 'POST':
        try:
            # Parse the JSON payload
            data = json.loads(request.body)
            claim = data.get('claim')  # Get the 'claim' (projectTitle) from the request

            if not claim:
                logger.warning("No 'claim' provided in the request.")
                return JsonResponse({'error': "The 'claim' parameter is required."}, status=400)

            normalized_claim = claim.strip().upper()  # Normalize the claim to uppercase
            logger.info(f"Received normalized claim: {normalized_claim}")

            # Fetch all handovers
            all_handovers = Handover.objects.select_related(
                'sampleobjectid', 'handoverid', 'destinationuserid'
            ).all()

            logger.info(f"Total handovers fetched: {all_handovers.count()}")

            incoming_handovers = []
            outgoing_handovers = []
            current_handovers = []

            # Define a function to check if a claimvalue matches the given claim
            def matches_claim(value, claim):
                return value.upper() == claim  # Compare normalized values

            for handover in all_handovers:
                sample = handover.sampleobjectid  # The related Objectinfo instance
                handover_sender = handover.handoverid.field_createdby  # sender (created_by)
                handover_recipient = handover.destinationuserid        # recipient

                # Retrieve claims for sender and recipient
                sender_claim = Aspnetuserclaims.objects.filter(userid=handover_sender, claimtype='Project').first()
                recipient_claim = Aspnetuserclaims.objects.filter(userid=handover_recipient, claimtype='Project').first()

                logger.info(
                    f"Handover {handover.pk}: "
                    f"Sender Claim: {sender_claim.claimvalue if sender_claim else 'None'}, "
                    f"Recipient Claim: {recipient_claim.claimvalue if recipient_claim else 'None'}"
                )

                sender_matches_claim = sender_claim and matches_claim(sender_claim.claimvalue, normalized_claim)
                recipient_matches_claim = recipient_claim and matches_claim(recipient_claim.claimvalue, normalized_claim)

                logger.info(
                    f"Handover {handover.pk}: "
                    f"Sender matches claim: {sender_matches_claim}, "
                    f"Recipient matches claim: {recipient_matches_claim}"
                )

                # Classify as Incoming if recipient matches the claim
                is_incoming = recipient_matches_claim and not sender_matches_claim
                # Classify as Outgoing if sender matches the claim
                is_outgoing = sender_matches_claim and not recipient_matches_claim
                # Classify as Current if unconfirmed and either sender or recipient matches the claim
                is_current = handover.destinationconfirmed is None and (
                    sender_matches_claim or recipient_matches_claim
                )

                # Prepare handover data
                handover_data = {
                    'sample_id': sample.objectid,
                    'sample_name': sample.objectname,
                    'amount': handover.amount,
                    'sender': handover_sender.username if handover_sender else "Unknown",
                    'sender_email': f"{handover_sender.email} ({sender_claim.claimvalue})" if sender_claim else handover_sender.email if handover_sender else "Unknown",
                    'sent_date': sample.field_created,
                    'sender_comments': sample.objectdescription,
                    'recipient': handover_recipient.username if handover_recipient else "N/A",
                    'recipient_email': f"{handover_recipient.email} ({recipient_claim.claimvalue})" if recipient_claim else handover_recipient.email if handover_recipient else "N/A",
                    'received_date': handover.destinationconfirmed.isoformat() if handover.destinationconfirmed else None,
                    'recipient_comments': handover.destinationcomments,
                }

                # Add to the respective lists based on conditions
                if is_incoming:
                    incoming_handovers.append(handover_data)
                if is_outgoing:
                    outgoing_handovers.append(handover_data)
                if is_current:
                    current_handovers.append(handover_data)

            logger.info(f"Incoming handovers: {len(incoming_handovers)}")
            logger.info(f"Outgoing handovers: {len(outgoing_handovers)}")
            logger.info(f"Current handovers: {len(current_handovers)}")

            return JsonResponse({
                'incoming_handovers': incoming_handovers,
                'outgoing_handovers': outgoing_handovers,
                'current_handovers': current_handovers,
            }, safe=False)

        except Exception as e:
            logger.error("Error in handover_view: %s", e)
            return JsonResponse({'error': 'An internal server error occurred.'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method. Use POST.'}, status=405)
