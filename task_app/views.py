from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import user_passes_test
from rest_framework import generics, permissions
from rest_framework.response import Response
from knox.models import AuthToken
from django.contrib.auth import authenticate, login, logout
from task_app.forms import *
from task_app.models import *
from .serializers import *


# Create your views here.
def superuser_required(view_func):
    decorated_view_func = user_passes_test(lambda u: u.is_superuser, login_url='/403/')(view_func)
    return decorated_view_func




def home(request):
    context = {
        'works': Work.objects.all(),
        'staffs': CustomUser.objects.all(),
        'status': WorkStatus.objects.all(),
    }
    return render(request, '_static/home.html', context)

def work_list(request):
    context = {
        'works': Work.objects.all(),
        'staffs': CustomUser.objects.all(),
        'status': WorkStatus.objects.all(),
    }
    return render(request, 'dynamic/workList.html', context)

def work_details(request, slug):
    context = {
        'work': Work.objects.get(slug=slug),
        'works': Work.objects.all(),
        'staffs': CustomUser.objects.all(),
        'reports': WorkReport.objects.all()
    }
    return render(request, 'dynamic/workDetails/workDetails.html', context)

def report_list(request):
    return render(request, 'dynamic/reportList/reportList.html', )

def report_details(request, slug):
    return render(request, "dynamic/reportDetails/reportDetails.html",)

def login_user(request):
    if request.method == 'POST':
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request,user)
            messages.success(request, 'Giriş Başarılı')
            return redirect('home')
        else:
            messages.success(request, 'Hata Olustu')
            return redirect('login_user')

    else:
        return render(request, 'authenticate/login.html', {})

def create_work(request):
    if request.method == 'POST':
        form = WorkForm(request.POST, request.FILES)
        if form.is_valid():
            work = form.save(commit=False)
            work.appointer = request.user
            work.save()
            form.save_m2m()
            return redirect('home')
    else:
        form = WorkForm()
    
    context = {
        'staffs': CustomUser.objects.all(),
        'works': Work.objects.all(),
        'form': form
    }
    return render(request, '_static/create_work.html', context)

@csrf_exempt
def update_work_ajax(request, pk):
    if request.method == 'POST':
        work = get_object_or_404(Work, pk=pk)
        form = WorkUpdateFormUser(request.POST, instance=work)
        
        # Alınan verileri kontrol edin
        print(request.POST)

        if form.is_valid():
            form.save()
            return JsonResponse({'success': True, 'message': 'Görev başarıyla güncellendi!'})
        else:
            return JsonResponse({'success': False, 'errors': form.errors.as_json()})
    return JsonResponse({'success': False, 'message': 'Geçersiz istek yöntemi'})

@csrf_exempt
def edit_work_ajax(request, pk):
    if request.method == 'POST':
        work = get_object_or_404(Work, pk=pk)
        form = WorkForm(request.POST, instance=work)
        
        # Alınan verileri kontrol edin
        print(request.POST)

        if form.is_valid():
            form.save()
            return JsonResponse({'success': True, 'message': 'Görev başarıyla güncellendi!'})
        else:
            return JsonResponse({'success': False, 'errors': form.errors.as_json()})
    return JsonResponse({'success': False, 'message': 'Geçersiz istek yöntemi'})

@require_POST
def delete_work_ajax(request, pk):
    work = get_object_or_404(Work, pk=pk)
    work.delete()
    return JsonResponse({'status': 'success'})

def create_work_ajax(request):
    form = WorkForm(request.POST, request.FILES)
    if form.is_valid():
        work = form.save(commit=False)
        work.appointer = request.user  # Appointer'ı oturum açmış kullanıcı yapıyoruz
        work.save()
        form.save_m2m()
        
        # Appointed kullanıcıları ekleyelim
        appointed_ids = request.POST.getlist('appointed')
        for user_id in appointed_ids:
            user = CustomUser.objects.get(id=user_id)
            work.appointed.add(user)
            
        work.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Work created successfully!',
            'errors': []
        })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Invalid request method.',
            'errors': ['Only POST method is allowed.']
        })

def read_works_by_user(request, pk):
    if request.method == "GET":
        try:
            if request.is_ajax():
                # Kullanıcının atandığı işleri filtreler
                works = Work.objects.filter(appointed=request.user)
                # Çıktıları serialize eder
                serializer = WorkSerializer(works, many=True)   
                return JsonResponse({'works': serializer.data}, safe=False)
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

def create_report(request):
    if request.method == "POST":

        try:
            form = ReportForm(request.POST, request.FILES)
            if form.is_valid():
                report = form.save(commit= False)
                report.writer = request.user
                report.save()
                return JsonResponse({
                'success': True,
                'reportId': report.id,
                'message': 'Rapor Olusturuldu!',
                'errors': []
            })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Geçersiz form ile post isteği',
                    'errors': form.errors.as_json()
                })
        except Exception as e:
            # Hata mesajını loglayın ve/veya döndürün
            print("Internal Server Error: ", str(e))
            return JsonResponse({
                'success': False,
                'message': 'Sunucu hatası oluştu.',
                'errors': [str(e)]
            })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Geçersiz İstek.',
            'errors': ['Yalnızca POST isteği kabul edilir']
        })

def read_reports_by_user_signed_in(request):
    if request.method == "GET":
        try:
            if request.is_ajax():   
                reports = WorkReport.objects.filter(writer=request.user).order_by('-id')
                rendered_html = render(request, 'partials/reportList/reportListItem.html', {'reports': reports}).content.decode('utf-8')
                return JsonResponse({'html': rendered_html, "userLoggedIn": request.user.id})
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

def read_reports_by_work(request, workId):
    if request.method == "GET":
        try:
            if request.is_ajax():   
                reports = WorkReport.objects.filter(relatedWork=Work.objects.get(id=workId)).order_by('-id')
                rendered_html = render(request, 'partials/reportList/reportListItem.html', {'reports': reports}).content.decode('utf-8')
                return JsonResponse({'html': rendered_html, "userLoggedIn": request.user.id})
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

def read_reports(request):
    if request.method == "GET":
        try:
            if request.is_ajax():
                status = WorkStatus.objects.all   
                reports = WorkReport.objects.all().order_by('-id')
                rendered_html = render(request, 'partials/reportList/reportListItem.html', {'reports': reports, 'status': status}).content.decode('utf-8')
                return JsonResponse({'html': rendered_html, "userLoggedIn": request.user.id})
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)
 
def read_report(request, pk):
    if request.method == "GET":
        try:
            if request.is_ajax():
                status = WorkStatus.objects.all
                report = WorkReport.objects.get(id=pk)
                rendered_html = render(request, 'partials/reportList/reportItem.html', {'report': report, 'status': status}).content.decode('utf-8')
                return JsonResponse({'html': rendered_html})
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

def read_reportDetail(request, slug):
    if request.method == "GET":
        try:
            if request.is_ajax():
                report = WorkReport.objects.get(slug=slug)
                reports = WorkReport.objects.all()
                status = {'onaylandi':WorkStatus.objects.get(name = "Onaylandı"),
                        'revize':WorkStatus.objects.get(name = "Revize"),
                        'onay_bekliyor': WorkStatus.objects.get(name = "Onay Bekliyor")}
                context = {'report':report, 'reports':reports, 'status':status}
                rendered = render(request, "partials/reportDetail/reportDetail.html", context).content.decode('utf-8')
                return JsonResponse({
                    "rendered":rendered,
                    "success" : True,
                    "message": "Rapor sayfası başarıyla alındı."
                    })
        except Exception as e:
            print(f"Bir hata oluştu: {str(e)}")
            return JsonResponse({
                    "success" : False,
                    "message": "Rapor sayfası alınamadı.",
                    })
        print("hata buradan geliyor")
        return JsonResponse({'Hata': 'Internal Server Error'}, status=500)

def update_reportDetail_status(request, pk):
    report = WorkReport.objects.get(id=pk)
    relatedWork = Work.objects.get(id=report.relatedWork.id)
    onaylandi = WorkStatus.objects.get(name="Onaylandı")
    revize = WorkStatus.objects.get(name="Revize")
    onay_bekliyor = WorkStatus.objects.get(name="Onay Bekliyor")
    if request.method == "POST":
        data = request.POST
        status = data.get('status')
        if int(status) == onaylandi.id:
            report.status= onaylandi
            relatedWork.status = onaylandi
            report.save()
            relatedWork.save()
            return JsonResponse({'istek': "onay"})
        elif int(status) == revize.id:
            report.status= revize
            relatedWork.status = revize
            report.save()
            relatedWork.save()
            return JsonResponse({'istek': "revize"})
        elif int(status) == onay_bekliyor.id:
            report.status= onay_bekliyor
            relatedWork.status = onay_bekliyor
            report.save()
            relatedWork.save()
            return JsonResponse({'istek': "onay_bekliyor"})
        else:
            return JsonResponse({'istek': "bilinmiyor"})

def update_report(request, pk):
    if request.method == "POST":
        report = get_object_or_404(WorkReport, id = pk)
        form = ReportForm(request.POST, instance=report)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True,
                'message': 'Görev başarıyla güncellendi!',
                'errors': []
                })
        else:
            return JsonResponse({'success': False, 'errors': form.errors.as_json()})
    else:
        return JsonResponse({
                'success': False,
                'message': 'Geçersiz İstek.',
                'errors': ['Yalnızca POST isteği kabul edilir']
            })

def update_report_status(request, pk):
    if request.method == "POST":
        report = get_object_or_404(WorkReport, id=pk)
        status_id = request.POST.get("status", None)
        if status_id:
            try:
                status = WorkStatus.objects.get(id=status_id)
                report.status = status
                report.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Görev başarıyla güncellendi!',
                    'errors': []
                })
            except WorkStatus.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Geçersiz Status ID',
                    'errors': ['Verilen ID ile eşleşen bir status bulunamadı.']
                })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Status bilgisi gönderilmedi.',
                'errors': ['Status bilgisi zorunludur']
            })
    else:
        return JsonResponse({
            'success': False,
            'message': 'Geçersiz İstek.',
            'errors': ['Yalnızca POST isteği kabul edilir']
        })

def delete_report(request, pk):
    if request.method == 'POST':
        try:
            report = get_object_or_404(WorkReport, id=pk)
            report.delete()
            return JsonResponse({'status': 'success'})
        except WorkReport.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Object does not exist.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=400)



class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": AuthToken.objects.create(user)[1]
        })

class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(email=serializer.validated_data['email'], password=serializer.validated_data['password'])
        if user is not None:
            login(request, user)
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "token": AuthToken.objects.create(user)[1]
            })
        return Response({"error": "Invalid credentials"}, status=400)

class UserAPI(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    

def logout_user(request):
    logout(request)
    return redirect('home')









def error_403_view(request, exception=None):
    return render(request, '_static/errors/403.html', status=403)