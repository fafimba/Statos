def calcular_daño(miniaturas, ataques_por_miniatura, hit, wound, damage, perforacion, tipo_critico, guardia, salvaguardia):
    try:
        # Convertir los valores a números
        miniaturas = int(miniaturas)
        ataques_por_miniatura = int(ataques_por_miniatura)
        hit = int(hit)
        wound = int(wound)
        damage = int(damage)
        perforacion = int(perforacion)
        guardia = int(guardia)
        salvaguardia = int(salvaguardia)

        # Cálculo de probabilidades base
        prob_hit = (7 - hit) / 6
        prob_wound = (7 - wound) / 6
        
        # Ajuste de salvación basado en perforación
        salvacion_efectiva = min(guardia + perforacion, salvaguardia if salvaguardia > 0 else 7)
        prob_save = (7 - salvacion_efectiva) / 6 if salvacion_efectiva <= 6 else 0
        
        # Modificadores por tipo de crítico
        if tipo_critico == "mortal":
            prob_hit = prob_hit + (1/6)  # Crítico causa herida mortal
        elif tipo_critico == "dos_hits":
            prob_hit = prob_hit + (1/6)  # Crítico causa hit adicional
        elif tipo_critico == "auto_wound":
            prob_hit = prob_hit * (1 - 1/6) + 1/6  # Crítico causa herida automática
        
        # Cálculo de daño promedio
        ataques_totales = miniaturas * ataques_por_miniatura
        prob_total = prob_hit * prob_wound * (1 - prob_save)
        daño_promedio = ataques_totales * prob_total * damage
        
        return {
            "daño_promedio": float(daño_promedio),
            "prob_hit": float(prob_hit),
            "prob_wound": float(prob_wound),
            "prob_save": float(prob_save)
        }
    except Exception as e:
        print(f"Error en calcular_daño: {str(e)}")
        raise ValueError(f"Error al calcular el daño: {str(e)}") 