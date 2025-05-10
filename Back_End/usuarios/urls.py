from django.urls import path
from .views import CrearUsuarioView

urlpatterns = [
    path('usuarios/crear/', CrearUsuarioView.as_view(), name='crear-usuario'),
]