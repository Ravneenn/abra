from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import CustomUser

@receiver(post_save, sender=CustomUser)
def assign_group_based_on_role(sender, instance, created, **kwargs):
    if created:
        # Kullanıcının rolüne göre grup ataması yapın
        if instance.role:
            group_name = instance.role.indexName  # Rol adını grubun adı olarak kullanıyoruz
            group, created = Group.objects.get_or_create(name=group_name)
            instance.groups.add(group)