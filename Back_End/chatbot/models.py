from django.db import models
from usuarios.models import Usuario

class Conversacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    pregunta = models.TextField()
    respuesta = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversación de {self.usuario.username} - {self.fecha_creacion}"