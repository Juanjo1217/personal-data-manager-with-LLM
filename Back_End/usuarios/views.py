from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from .models import Usuario
from .serializers import UsuarioSerializer, AutenticarUsuarioSerializer
from cloudinary import uploader


class CrearUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class AutenticarUsuarioView(generics.GenericAPIView):
    serializer_class = AutenticarUsuarioSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        correo = serializer.validated_data['correo']
        contraseña = serializer.validated_data['contraseña']
        
        try:
            usuario = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({'correcto': False, 'mensaje': 'Credenciales incorrectas'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        if check_password(contraseña, usuario.contraseña):
            return Response({'correcto': True, 'mensaje': 'Autenticación exitosa'})
        else:
            return Response({'correcto': False, 'mensaje': 'Credenciales incorrectas'}, 
                          status=status.HTTP_401_UNAUTHORIZED)

class ActualizarUsuarioView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user  # Asume que el usuario está autenticado
    
    def perform_update(self, serializer):
        # Eliminar la imagen anterior de Cloudinary si se está actualizando
        if 'foto' in serializer.validated_data and self.get_object().foto:
            try:
                public_id = self.get_object().foto.split('/')[-1].split('.')[0]
                uploader.destroy(public_id)
            except Exception as e:
                pass
        serializer.save()