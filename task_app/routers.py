from rest_framework import routers
from .viewSets import *

router = routers.DefaultRouter()
router.register(r'workss', WorkViewSet)