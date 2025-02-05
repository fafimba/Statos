from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from utils.calculadora import calcular_ataques
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Configuración más específica de CORS

def cargar_ejercitos():
    ruta_json = os.path.join(os.path.dirname(__file__), 'data', 'ejercitos.json')
    try:
        with open(ruta_json, 'r', encoding='utf-8') as file:
            ejercitos = json.load(file)
            print(f"✅ Ejercitos cargados exitosamente: {list(ejercitos.keys())}")
            return ejercitos
    except FileNotFoundError:
        print(f"❌ Error: No se encontró el archivo en {ruta_json}")
        return {}
    except json.JSONDecodeError:
        print("❌ Error: El archivo no contiene JSON válido")
        return {}
    except Exception as e:
        print(f"❌ Error inesperado al cargar ejercitos.json: {str(e)}")
        return {}

def calcular_matriz_daño(ejercito_atacante, ejercito_defensor):
    matriz = {}
    for atacante_nombre, atacante in ejercito_atacante['unidades'].items():
        matriz[atacante_nombre] = {}
        for defensor_nombre, defensor in ejercito_defensor['unidades'].items():
            data = {
                'miniaturas': atacante['miniaturas'],
                'ataques_por_miniatura': atacante['ataques_por_miniatura'],
                'hit': atacante['hit'],
                'wound': atacante['wound'],
                'damage': atacante['damage'],
                'perforacion': atacante['perforacion'],
                'tipo_critico': atacante['tipo_critico'],
                'guardia': defensor['guardia'],
                'salvaguardia': defensor['salvaguardia']
            }
            resultado = calcular_ataques(data)
            matriz[atacante_nombre][defensor_nombre] = resultado['damage_final']
    return matriz

@app.route('/api/calcular-ataques', methods=['POST'])
def calcular_ataques_endpoint():
    try:
        data = request.json
        print("Datos recibidos en /api/calcular-ataques:", data)
        
        # Validar que tenemos todos los campos necesarios
        if not all(key in data for key in ['perfiles_ataque', 'miniaturas', 'guardia', 'salvaguardia']):
            print("Error: Faltan campos requeridos en la petición")
            print("Campos recibidos:", list(data.keys()))
            return jsonify({
                'error': 'Faltan campos requeridos',
                'campos_requeridos': ['perfiles_ataque', 'miniaturas', 'guardia', 'salvaguardia'],
                'campos_recibidos': list(data.keys())
            }), 400

        resultado = calcular_ataques(data)
        print("Resultado calculado:", resultado)
        return jsonify(resultado)
    except Exception as e:
        print(f"Error en calcular_ataques_endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/ejercitos', methods=['GET'])
def get_ejercitos():
    ejercitos = cargar_ejercitos()
    if not ejercitos:
        return jsonify({"error": "No se pudieron cargar los ejércitos"}), 500
    return jsonify(ejercitos)

@app.route('/api/matriz-daño', methods=['POST'])
def calcular_matriz_daño():
    try:
        data = request.json
        print("Datos recibidos en /api/matriz-daño:", data)
        
        ejercito_atacante = data.get('ejercito_atacante', {})
        ejercito_defensor = data.get('ejercito_defensor', {})
        
        if not ejercito_atacante or not ejercito_defensor:
            print("Error: No se recibieron los ejércitos correctamente")
            return jsonify({'error': 'Faltan datos de ejércitos'}), 400

        matriz = {}
        for nombre_atacante, unidad_atacante in ejercito_atacante.get('unidades', {}).items():
            matriz[nombre_atacante] = {}
            print(f"\nProcesando unidad atacante: {nombre_atacante}")
            
            for nombre_defensor, unidad_defensora in ejercito_defensor.get('unidades', {}).items():
                print(f"  Contra unidad defensora: {nombre_defensor}")
                
                datos_calculo = {
                    'perfiles_ataque': unidad_atacante.get('perfiles_ataque', []),
                    'miniaturas': unidad_atacante.get('miniaturas', 0),
                    'guardia': unidad_defensora.get('guardia', 0),
                    'salvaguardia': unidad_defensora.get('salvaguardia', 0)
                }
                
                print(f"  Datos para cálculo:", datos_calculo)
                resultado = calcular_ataques(datos_calculo)
                print(f"  Resultado:", resultado)
                
                matriz[nombre_atacante][nombre_defensor] = resultado

        return jsonify(matriz)
    except Exception as e:
        print(f"Error al calcular matriz: {str(e)}")
        return jsonify({'error': str(e)}), 400

def load_armies():
    armies = {}
    # Asegurarnos de que la ruta es correcta
    armies_dir = os.path.join(os.path.dirname(__file__), 'data', 'armies')
    
    try:
        # Verificar si el directorio existe
        if not os.path.exists(armies_dir):
            print(f"Directory not found: {armies_dir}")
            return {}

        print(f"Loading armies from: {armies_dir}")  # Debug log
        
        for filename in os.listdir(armies_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(armies_dir, filename)
                print(f"Loading army file: {filename}")  # Debug log
                
                with open(file_path, 'r', encoding='utf-8') as file:
                    army_data = json.load(file)
                    army_name = army_data['name']
                    armies[army_name] = army_data
                    print(f"Loaded army: {army_name}")  # Debug log
        
        print(f"Total armies loaded: {len(armies)}")  # Debug log
        return armies
    except Exception as e:
        print(f"Error loading army files: {str(e)}")
        return {}

@app.route('/api/armies', methods=['GET'])
def get_armies():
    armies = load_armies()
    if not armies:
        return jsonify({"error": "No armies found"}), 404
    return jsonify(armies)

@app.route('/api/calculate-damage', methods=['POST'])
def calculate_unit_damage():
    try:
        data = request.get_json()
        print("Datos recibidos:", data)  # Debug log
        
        # Adaptamos los datos del nuevo formato en inglés al formato esperado por calcular_ataques
        calculation_data = {
            'miniaturas': data['attacker']['models'],
            'perfiles_ataque': [{
                'nombre': profile.get('name', 'Sin nombre'),
                'ataques': profile.get('attacks', 0),
                'hit': profile.get('hit', 0),
                'wound': profile.get('wound', 0),
                'damage': profile.get('damage', 0),
                'rend': profile.get('rend', 0),
                'tipo_critico': profile.get('crit_type', 'ninguno')
            } for profile in data['attacker']['attack_profiles']],
            'guardia': data['defender'].get('save', 0),
            'salvaguardia': data['defender'].get('ward')  # No convertimos a int aquí
        }
        
        print("Datos transformados:", calculation_data)  # Debug log
        
        result = calcular_ataques(calculation_data)
        print("Resultado:", result)  # Debug log
        return jsonify(result)
    except Exception as e:
        print(f"Error en calculate_unit_damage: {str(e)}")
        print(f"Data recibida: {data}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 