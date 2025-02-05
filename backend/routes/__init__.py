from flask import jsonify, request
from app import app
from ..utils.calculadora import calcular_ataques

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API funcionando correctamente"})

@app.route('/api/calcular-ataques', methods=['POST'])
def calcular_ataques_route():
    try:
        data = request.json
        resultado = calcular_ataques(data)
        return jsonify(resultado)
    except Exception as e:
        print(f"Error en el servidor: {str(e)}")
        return jsonify({"error": "Error en el servidor"}), 500 