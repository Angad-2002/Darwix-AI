from django.urls import path
from . import views

urlpatterns = [
    path('transcribe/', views.transcribe, name='transcribe'),
    path('suggest-titles/', views.suggest_titles, name='suggest_titles'),
    path('health/', views.health_check, name='health_check'),
] 