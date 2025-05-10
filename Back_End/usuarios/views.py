from rest_framework import generics, status
from django.contrib.auth import authenticate
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
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Autenticar usando el sistema de Django
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'correcto': True,
                'mensaje': 'Autenticación exitosa',
                'token': token.key,
                'usuario': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
        else:
            return Response({
                'correcto': False,
                'mensaje': 'Credenciales incorrectas'
            }, status=status.HTTP_401_UNAUTHORIZED)

class ActualizarUsuarioView(generics.UpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user  # Asume que el usuario está autenticado
    
    def perform_update(self, serializer):
        # Eliminar imagen anterior si es necesario
        if 'foto' in serializer.validated_data and self.get_object().foto:
            try:
                public_id = self.get_object().foto.split('/')[-1].split('.')[0]
                uploader.destroy(public_id)
            except Exception:
                pass
        
        # Guardar los cambios (esto llamará al save() del modelo)
        serializer.save()