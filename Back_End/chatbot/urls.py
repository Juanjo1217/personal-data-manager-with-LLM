from django.urls import path
from .views import pregunta_chatbot

urlpatterns = [
    path('pregunta/', pregunta_chatbot, name='pregunta_chatbot'),
]