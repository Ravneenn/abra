# Generated by Django 3.2.25 on 2024-07-23 21:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0004_alter_workstatus_indexname'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('img', models.ImageField(blank=True, null=True, upload_to='workimages')),
                ('slug', models.SlugField(blank=True, editable=False, unique=True)),
                ('relatedWork', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='task_app.work')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='task_app.workstatus')),
                ('writer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='writer', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]