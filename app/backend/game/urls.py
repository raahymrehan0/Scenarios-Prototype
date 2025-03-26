from django.urls import path
from . import views

urlpatterns = [
    path('real_or_fake_question/', views.real_or_fake_question),
    path('real_or_fake_answer/', views.real_or_fake_answer),
    path('headline_get_question/', views.headline_get_question),
    path('headline_submit_answer/', views.headline_submit_answer),

]