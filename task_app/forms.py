from django import forms
from .models import *

class WorkForm(forms.ModelForm):
    class Meta:
        model = Work
        fields = ['name', 'description','relatedWork', 'deadline', 'appointed', 'img']

    relatedWork = forms.ModelChoiceField(
        queryset=Work.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-select form-select-lg'})
    )
    
    appointed = forms.ModelMultipleChoiceField(
        queryset=CustomUser.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-select', 'size': '8'})
    )
        
class WorkUpdateFormUser(forms.ModelForm):
    class Meta:
        model = Work
        fields = ['deadline', 'status']
        widgets = {
            'deadline': forms.DateInput(attrs={'type': 'date'}),
            'status': forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['status'].queryset = WorkStatus.objects.all()


class ReportForm(forms.ModelForm):
    class Meta:
        model = WorkReport
        fields = ["name", "description", "relatedWork", "img",]

    relatedWork = forms.ModelChoiceField(
        queryset=Work.objects.all(),
        required=True,
        widget=forms.Select(attrs={'class': 'form-select form-select-lg'})
    )


class ReviseForm(forms.ModelForm):
    class Meta:
        model = WorkReport
        fields = ["name", "description", "img",]