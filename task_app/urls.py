from django.urls import path, include
from task_app import views
from task_app.viewSets import *
from task_app.views import RegisterAPI, LoginAPI, UserAPI
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'workss', WorkViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'revises', ReviseViewSet)

urlpatterns = [

    path('', views.home, name='home'),
    path('work_list/', views.work_list, name='work_list'),
    path('work_details/<str:slug>', views.work_details, name='work_details'),
    path('create_work/', views.create_work, name='create_work'),
    path('report_list/', views.report_list, name='report_list'),
    path('report_details/<str:slug>', views.report_details, name='report_details'),
    path('login_user/', views.login_user, name='login_user'),
    path('create/ajax/', views.create_work_ajax, name='create_work_ajax'),
    path('update/ajax/<int:pk>/', views.update_work_ajax, name='update_work_ajax'),
    path('edit/ajax/<int:pk>/', views.edit_work_ajax, name='edit_work_ajax'),
    path('delete/ajax/<int:pk>/', views.delete_work_ajax, name='delete_work_ajax'),
    path('works/read/by-user/ajax/<int:pk>', views.read_works_by_user, name = 'read_works_by_user'),
    path('reports/create/ajax', views.create_report, name = 'create_report'),
    path('reports/read/ajax', views.read_reports_by_user_signed_in, name = 'read_reports_by_user_signed_in'),
    path('reports/read-all/ajax', views.read_reports, name = 'read_all_reports'),
    path('reports/read/ajax/<int:pk>', views.read_report, name = 'read_report'),
    path('reportDetail/read/ajax/<str:slug>', views.read_reportDetail, name = 'read_report_detail'),
    path('reports/update/ajax/<int:pk>', views.update_report, name = 'update_report'),
    path("reports/report-status-update/ajax/<int:pk>", views.update_reportDetail_status, name="update_reportDetail_status"),
    path('reports/work-status-update/ajax/<int:pk>', views.update_report_status, name="update_report_status"),
    path('reports/delete/ajax/<int:pk>', views.delete_report, name = 'delete_report'),
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('user/', UserAPI.as_view(), name='user'),
    path('logout_user/', views.logout_user, name='logout'),
    path('api/', include(router.urls)),
    path('403/', views.error_403_view, name='error_403'),
]

