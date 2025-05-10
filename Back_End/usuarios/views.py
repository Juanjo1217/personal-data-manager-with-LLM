from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from .models import Usuario
from .serializers import UsuarioSerializer, AutenticarUsuarioSerializer
from cloudinary import uploader
from rest_framework.authtoken.models import Token


class CrearUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Obtener el token
        token = Token.objects.get(user=user)
        
        # Preparar respuesta
        response_data = serializer.data
        response_data['token'] = token.key
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

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
            # Obtener o crear el token para el usuario
            token, created = Token.objects.get_or_create(user=usuario)
            return Response({
                'correcto': True,
                'mensaje': 'Autenticación exitosa',
                'token': token.key,  # Devuelve el token
                'usuario': {
                    'id': usuario.id,
                    'primer_nombre': usuario.primer_nombre,
                    'correo': usuario.correo
                    # Añade otros campos que quieras devolver
                }
            })
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