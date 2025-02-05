def calcular_probabilidad(objetivo):
    exitos_posibles = 7 - objetivo
    return max(0, exitos_posibles / 6)

def calcular_ataques(data):
    try:
        # Ahora esperamos una lista de perfiles de ataque
        perfiles_ataque = data.get('perfiles_ataque', [])
        miniaturas = int(data.get('miniaturas', 0))
        guardia = int(data.get('guardia', 0))
        # Si no existe salvaguardia, usar 0 como valor por defecto
        salvaguardia = int(data.get('salvaguardia', 0)) if data.get('salvaguardia') is not None else 0
        
        daño_total = 0
        desglose_perfiles = []
        
        for perfil in perfiles_ataque:
            # Cálculo para cada perfil
            ataques = int(perfil.get('ataques', 0))
            hit = int(perfil.get('hit', 0))
            wound = int(perfil.get('wound', 0))
            damage = int(perfil.get('damage', 0))
            perforacion = int(perfil.get('rend', 0))  # Renombramos 'rend' a 'perforacion' internamente
            tipo_critico = perfil.get('tipo_critico', 'ninguno')
            
            # Cálculo total de ataques para este perfil
            total_ataques = miniaturas * ataques
            
            # Probabilidad de hit
            hits_criticos = total_ataques * (1/6)
            prob_hit_normal = max(0, (7 - hit) - 1) / 6
            hits_normales = total_ataques * prob_hit_normal
            
            # Inicializar variables para daño mortal
            damage_mortal = 0
            damage_normal = 0
            
            if tipo_critico == 'mortal':
                damage_mortal = hits_criticos * damage
                if salvaguardia > 0:
                    prob_fallar_salva = 1 - calcular_probabilidad(salvaguardia)
                    damage_mortal = damage_mortal * prob_fallar_salva
                
                wounds_normales = hits_normales * calcular_probabilidad(wound)
                if guardia > 0:
                    guardia_modificada = guardia + perforacion
                    if guardia_modificada > 6:
                        wounds_tras_guardia = wounds_normales
                    else:
                        prob_fallar_guardia = 1 - calcular_probabilidad(guardia_modificada)
                        wounds_tras_guardia = wounds_normales * prob_fallar_guardia
                else:
                    wounds_tras_guardia = wounds_normales
                
                damage_normal = wounds_tras_guardia * damage
                if salvaguardia > 0:
                    damage_normal = damage_normal * prob_fallar_salva
            else:
                if tipo_critico == 'dos_hits':
                    hits_totales = hits_normales + (hits_criticos * 2)
                else:
                    hits_totales = hits_normales + hits_criticos
                
                if tipo_critico == 'auto_wound':
                    wounds_esperados = hits_normales * calcular_probabilidad(wound) + hits_criticos
                else:
                    wounds_esperados = hits_totales * calcular_probabilidad(wound)
                
                if guardia > 0:
                    guardia_modificada = guardia + perforacion
                    if guardia_modificada > 6:
                        wounds_tras_guardia = wounds_esperados
                    else:
                        prob_fallar_guardia = 1 - calcular_probabilidad(guardia_modificada)
                        wounds_tras_guardia = wounds_esperados * prob_fallar_guardia
                else:
                    wounds_tras_guardia = wounds_esperados
                
                damage_final = wounds_tras_guardia * damage
                if salvaguardia > 0:
                    prob_fallar_salva = 1 - calcular_probabilidad(salvaguardia)
                    damage_final = damage_final * prob_fallar_salva
                
                damage_normal = damage_final
            
            daño_perfil = damage_normal + damage_mortal
            daño_total += daño_perfil
            
            # Guardar desglose del perfil
            desglose_perfiles.append({
                'nombre': perfil.get('nombre', 'Sin nombre'),
                'ataques_totales': total_ataques,
                'hits_normales': round(hits_normales, 2),
                'hits_criticos': round(hits_criticos, 2),
                'hits_totales': round(hits_normales + hits_criticos, 2),
                'damage_final': round(daño_perfil, 2),
                'damage_mortal': round(damage_mortal, 2),
                'damage_normal': round(damage_normal, 2)
            })
        
        return {
            'damage_final': round(daño_total, 2),
            'desglose_perfiles': desglose_perfiles
        }
        
    except Exception as e:
        print(f"Error en calcular_ataques: {str(e)}")
        print(f"Data recibida: {data}")  # Añadimos log para debug
        raise 