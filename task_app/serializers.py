from rest_framework import serializers
from django.contrib.auth import get_user_model

from task_app.models import *


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['email'],
            password=validated_data['password'],
            username =validated_data['username'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name')

class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model= Work
        fields = "__all__"

    def create(self, validated_data):
        # ManyToManyField'i işlemden sonra ayırmak için
        appointed_data = validated_data.pop('appointed', [])
        instance = Work.objects.create(**validated_data)
        instance.appointed.set(appointed_data)
        return instance
    
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkReport
        fields = "__all__"

class ReviseSerializer(serializers.ModelSerializer):
    class Meta:
        model= WorkRevise
        fields = "__all__"