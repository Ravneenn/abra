from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils.text import slugify
from django.contrib.auth import user_logged_in

def default_work_status():
    return WorkStatus.objects.get(name="Yeni Görev")


def deafult_appointer():
    return user_logged_in


class Role(models.Model):
    indexName = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=50, unique=True)
    authorizedOn = models.ManyToManyField('task_app.Role')

    def __str__(self):
        return self.indexName

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password = None, **extra_fields):
        if not email:
            raise ValueError('Email is required')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using= self._db)
        return user

    def create_superuser(self, email, password = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.CharField(max_length=200, unique=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=50, unique=True)
    objects = CustomUserManager()
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    picture = models.ImageField(upload_to='profile_pictures', null=True, blank=True, default='profile_pictures\profile.png')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    slug = models.SlugField(blank=True, unique=True, db_index=True, editable = False, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.first_name + " " + self.last_name  
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.username)
        super().save(args, **kwargs)

class WorkStatus(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(Role, blank=True, on_delete=models.CASCADE , null=True)
    slug = models.SlugField(blank=True, unique=True, db_index=True, editable = False)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(args, **kwargs)

class Work(models.Model):
    name = models.CharField(max_length=200, unique=True)
    deadline = models.DateField()
    appointed = models.ManyToManyField('task_app.CustomUser', related_name='appointed_works')
    appointer = models.ForeignKey('task_app.CustomUser',  on_delete=models.CASCADE, related_name='appointer_works', default=deafult_appointer)
    status = models.ForeignKey("task_app.WorkStatus", on_delete=models.CASCADE, default=default_work_status)
    description = models.TextField()
    relatedWork = models.ForeignKey('task_app.Work',on_delete=models.CASCADE , null=True, blank=True)
    img = models.ImageField(upload_to='workimages', null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True)
    slug = models.SlugField(blank=True, unique=True, db_index=True, editable = False)

    def __str__(self):
        return self.name
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class WorkReport(models.Model):
    name = models.CharField(max_length=200)
    writer = models.ForeignKey('task_app.CustomUser',  on_delete=models.CASCADE, related_name='writer', default=deafult_appointer)
    status = models.ForeignKey("task_app.WorkStatus", on_delete=models.CASCADE, default= default_work_status)
    description = models.TextField()
    relatedWork = models.ForeignKey('task_app.Work',on_delete=models.CASCADE , null=True, blank=True)
    img = models.ImageField(upload_to='workimages', null=True, blank=True)
    slug = models.SlugField(blank=True, unique=True, db_index=True, editable = False)

    def __str__(self):
        return self.name
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class WorkRevise(models.Model):
    name = models.CharField(max_length=200, unique=True)
    appointed = models.ForeignKey('task_app.CustomUser',  on_delete=models.CASCADE, related_name='appointed_revise')
    appointer = models.ForeignKey('task_app.CustomUser',  on_delete=models.CASCADE, related_name='appointer_revise', default=deafult_appointer)
    status = models.ForeignKey("task_app.WorkStatus", on_delete=models.CASCADE, default=default_work_status)
    description = models.TextField()
    relatedReport = models.ForeignKey('task_app.WorkReport',on_delete=models.CASCADE , null=True, blank=True)
    img = models.ImageField(upload_to='workimages', null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)
