from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario
from cloudinary import uploader
from rest_framework.authtoken.models import Token

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'segundo_nombre', 'fecha_nacimiento', 'genero', 'celular',
            'numero_documento', 'tipo_documento', 'foto'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        # Procesar la imagen si existe
        foto = validated_data.pop('foto', None)
        if foto:
            uploaded = uploader.upload(
                foto,
                format='webp',
                transformation=[{'format': 'webp'}, {'quality': 'auto'}]
            )
            validated_data['foto'] = uploaded['secure_url']
        
        # Crear el usuario
        user = Usuario.objects.create_user(**validated_data)
        
        # Crear token
        Token.objects.create(user=user)
        return user
    
    def update(self, instance, validated_data):
        # Procesar contraseña si se proporciona
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        
        # Procesar imagen si se proporciona
        if 'foto' in validated_data:
            imagen = validated_data.pop('foto')
            validated_data['foto'] = self._subir_imagen(imagen)
        
        # Actualizar campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Guardar el usuario (esto activará el save() del modelo)
        instance.save()
        return instance
    
    def _subir_imagen(self, imagen):
        try:
            uploaded = uploader.upload(
                imagen,
                format='webp',
                transformation=[{'format': 'webp'}, {'quality': 'auto'}]
            )
            return uploaded['secure_url']
        except Exception as e:
            raise serializers.ValidationError(f"Error subiendo imagen: {str(e)}")
    
    # Cambiar de validate_contraseña a validate_password
    def validate_password(self, value):
        if value and len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        return value
    
    def validate_foto(self, value):
        if value:
            max_size = 2 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError("La imagen no puede pesar más de 2MB")
        return value


class AutenticarUsuarioSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)  # Cambiado de correo a username
    password = serializers.CharField(required=True, write_only=True)  # Cambiado de contraseña a password
    
    def validate(self, data):
        return data