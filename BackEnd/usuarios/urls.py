from django.urls import path
from .views import CrearUsuarioView, AutenticarUsuarioView, ActualizarUsuarioView

urlpatterns = [
    path('usuarios/crear/', CrearUsuarioView.as_view(), name='crear-usuario'),
    path('usuarios/autenticar/', AutenticarUsuarioView.as_view(), name='autenticar-usuario'),
    path('usuarios/actualizar/', ActualizarUsuarioView.as_view(), name='actualizar-usuario'),
]