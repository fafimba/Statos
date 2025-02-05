import json
import os
from flask import jsonify
from app import app

def load_armies():
    armies = {}
    armies_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'armies')
    
    try:
        for filename in os.listdir(armies_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(armies_dir, filename)
                with open(file_path, 'r', encoding='utf-8') as file:
                    army_data = json.load(file)
                    army_name = army_data['name']
                    armies[army_name] = army_data
        return armies
    except Exception as e:
        print(f"Error loading army files: {str(e)}")
        return {}

@app.route('/api/ejercitos', methods=['GET'])
def get_armies():
    armies = load_armies()
    return jsonify(armies) 