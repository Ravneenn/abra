# Generated by Django 3.2.25 on 2024-07-23 21:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_app', '0003_workstatus_indexname'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workstatus',
            name='indexName',
            field=models.CharField(max_length=50),
        ),
    ]