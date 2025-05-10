from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario
from cloudinary import uploader

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(write_only=True, required=False)
    contraseña = serializers.CharField(write_only=True, required=False)  # Ahora es opcional
    
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'foto': {'read_only': True},
            'contraseña': {'write_only': True},
            'correo': {'read_only': True},  # Normalmente no se permite cambiar el correo
            'numero_documento': {'read_only': True}  # Tampoco el número de documento
        }
    
    def create(self, validated_data):
        # Hashear la contraseña antes de crear el usuario
        validated_data['contraseña'] = make_password(validated_data.get('contraseña'))
        
        # Procesar imagen
        imagen = validated_data.pop('foto', None)
        if imagen:
            validated_data['foto'] = self._subir_imagen(imagen)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Procesar contraseña si se proporciona
        if 'contraseña' in validated_data:
            instance.contraseña = make_password(validated_data['contraseña'])
        
        # Procesar imagen si se proporciona
        if 'foto' in validated_data:
            imagen = validated_data.pop('foto')
            instance.foto = self._subir_imagen(imagen)
        
        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
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
    
    def validate_contraseña(self, value):
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
    correo = serializers.EmailField(required=True)
    contraseña = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        # Validaciones básicas podrían ir aquí si necesitas algo adicional
        return data