from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests

CHATBOT_URL = "http://chatbot-container:5000/chat"  # Ajusta esta URL

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pregunta_chatbot(request):
    # Validamos que venga el campo "pregunta" en el JSON
    pregunta = request.data.get('pregunta')
    if not pregunta:
        print("No se recibió la pregunta")
        return Response(
            {"error": "El campo 'pregunta' es requerido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Enviamos la pregunta al chatbot
        response = requests.post(
            CHATBOT_URL,
            json={"pregunta": pregunta},
            timeout=10  # 10 segundos de timeout
        )
        
        # Retornamos exactamente lo que responda el chatbot
        return Response(response.json(), status=response.status_code)
        
    except requests.exceptions.Timeout:
        return Response(
            {"error": "El chatbot no respondió a tiempo"},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.RequestException as e:
        return Response(
            {"error": f"Error al conectar con el chatbot: {str(e)}"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )