from rest_framework import viewsets
from .models import *
from .serializers import *

class WorkViewSet(viewsets.ModelViewSet):
    queryset = Work.objects.all()
    serializer_class = WorkSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = WorkReport.objects.all()
    serializer_class = ReportSerializer

class ReviseViewSet(viewsets.ModelViewSet):
    queryset= WorkRevise.objects.all()
    serializer_class = ReviseSerializer