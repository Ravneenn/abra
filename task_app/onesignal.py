import onesignal
from onesignal.api import default_api

# See configuration.py for a list of all supported configuration parameters.
# Some of the OneSignal endpoints require USER_KEY bearer token for authorization as long as others require APP_KEY
# (also knows as REST_API_KEY). We recommend adding both of them in the configuration page so that you will not need
# to figure it yourself.
configuration = onesignal.Configuration(
    app_key = "e334c438-51f4-4b89-8035-acdf3b778f88",
    user_key = "ZTY1NWM0MGQtZjVjOS00MjUyLWFlZjAtNzAxZjc3YTdkNTBk"
)


# Enter a context with an instance of the API client
with onesignal.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = default_api.DefaultApi(api_client)
    