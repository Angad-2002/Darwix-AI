from django.urls import path
from . import views

urlpatterns = [
    path('transcribe/', views.transcribe_audio, name='transcribe_audio'),
    path('suggest-titles/', views.suggest_titles, name='suggest_titles'),
] 