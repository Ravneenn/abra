# onesignal_helper.py
import onesignal_sdk.client
from django.conf import settings

def send_notification(user_ids, heading, content):
    client = onesignal_sdk.client.Client(
        app_id=settings.ONESIGNAL_APP_ID,
        rest_api_key=settings.ONESIGNAL_API_KEY
    )

    notification_body = {
        'headings': {'en': heading},
        'contents': {'en': content},
        'include_player_ids': user_ids
    }

    response = client.send_notification(notification_body)
    return response
