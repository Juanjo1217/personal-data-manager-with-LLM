from rest_framework import serializers
from .models import Usuario
from cloudinary import uploader

class UsuarioSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(write_only=True, required=False)  # Solo para entrada
    
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'foto': {'read_only': True}  # La URL es de solo lectura
        }
    
    def create(self, validated_data):
        # Extraer la imagen si existe
        imagen = validated_data.pop('foto', None)
        
        if imagen:
            try:
                # Subir a Cloudinary y convertir a WebP
                uploaded = uploader.upload(
                    imagen,
                    format='webp',
                    transformation=[
                        {'format': 'webp'},
                        {'quality': 'auto'},
                    ]
                )
                validated_data['foto'] = uploaded['secure_url']
            except Exception as e:
                raise serializers.ValidationError(f"Error subiendo imagen a Cloudinary: {str(e)}")
        
        return super().create(validated_data)
    
    def validate_foto(self, value):
        if value:
            max_size = 2 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError("La imagen no puede pesar más de 2MB")
        return value