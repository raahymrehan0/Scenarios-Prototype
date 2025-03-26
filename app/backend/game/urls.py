from django.urls import path
from . import views

urlpatterns = [
    path('real_or_fake_question/', views.real_or_fake_question),
    path('real_or_fake_answer/', views.real_or_fake_answer),
    path('guess_source_question/', views.guess_source_question),
    path('guess_source_answer/', views.guess_source_answer)
]