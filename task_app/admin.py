from django.contrib import admin
from task_app.models import *

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Role)
admin.site.register(WorkStatus)
admin.site.register(Work)
admin.site.register(WorkReport)
admin.site.register(WorkRevise)
