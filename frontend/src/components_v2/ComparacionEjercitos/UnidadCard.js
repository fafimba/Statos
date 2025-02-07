import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  Switch,
} from '@mui/material';
import { usePerfilesAtaque } from '../../hooks_v2/usePerfilesAtaque';
import { calculateAttacks } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';
import PerfilAtaque from './PerfilAtaque';
import DanoBar from './DanoBar';

const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, esAtacante }) => {
  // Usar el hook de perfiles de ataque
  const {
    perfilesActivos,
    setPerfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
    habilidadesUnidad
  } = usePerfilesAtaque(unidad);

  // Estado para habilidades toggleables de unidad
  const [habilidadUnidadActiva, setHabilidadUnidadActiva] = useState(false);

  // Calcular daños contra unidades
  const danosContraUnidades = useMemo(() => {
    if (!ejercitoOponente?.units) return [];

    const resultados = Object.entries(ejercitoOponente.units).map(([nombreUnidadObjetivo, unidadObjetivo]) => {
      if (!unidad?.attack_profiles) return { nombreUnidad: nombreUnidadObjetivo, dano: 0 };

      // Debug de la unidad objetivo
      console.log('Unidad objetivo:', {
        nombre: nombreUnidadObjetivo,
        modelos: unidadObjetivo.models,
        unidadCompleta: unidadObjetivo
      });

      // Evaluar condiciones de habilidad de unidad primero
      let condicionHabilidadCumplida = false;
      if (unidad.ability?.effect?.type === 'conditional_ability' &&
          (unidad.ability.type === 'fixed' || 
           (unidad.ability.type === 'toggleable' && habilidadUnidadActiva))) {
        const efecto = unidad.ability.effect;
        
        if (efecto.condition.type === 'enemy_unit') {
          const valorObjetivo = parseInt(unidadObjetivo[efecto.condition.property]);
          const valorCondicion = parseInt(efecto.condition.value);
          
          console.log('Evaluación de condición:', {
            unidadAtacante: nombreUnidad,
            unidadObjetivo: nombreUnidadObjetivo,
            propiedad: efecto.condition.property,
            valorObjetivo,
            valorCondicion,
            operador: efecto.condition.operator
          });

          switch (efecto.condition.operator) {
            case '>=':
              condicionHabilidadCumplida = valorObjetivo >= valorCondicion;
              break;
            case '<=':
              condicionHabilidadCumplida = valorObjetivo <= valorCondicion;
              break;
            case '>':
              condicionHabilidadCumplida = valorObjetivo > valorCondicion;
              break;
            case '<':
              condicionHabilidadCumplida = valorObjetivo < valorCondicion;
              break;
            case '===':
            case '==':
            case '=':
              condicionHabilidadCumplida = valorObjetivo === valorCondicion;
              break;
            default:
              console.warn(`Operador no soportado: ${efecto.condition.operator}`);
          }
          
          console.log('Resultado de condición:', condicionHabilidadCumplida);
        }
      }

      const perfilesModificados = unidad.attack_profiles
        .filter(perfil => perfilesActivos[perfil.name])
        .map(perfil => {
          let perfilModificado = { ...perfil };
          let habilidadesAdicionales = [...(perfil.abilities || [])];
          
          // Aplicar modificadores de la habilidad de unidad
          if (unidad.ability?.effect?.type === 'modifier' && habilidadUnidadActiva) {
            const { target, value } = unidad.ability.effect;
            if (target === 'hit' || target === 'wound') {
              // Restamos el valor para mejorar el roll necesario
              perfilModificado[target] = parseInt(perfilModificado[target]) - parseInt(value);
            } else {
              // Para otros stats como damage o attacks, seguimos sumando
              perfilModificado[target] = parseInt(perfilModificado[target]) + parseInt(value);
            }
          }

          // Aplicar habilidades toggleables de arma si están activas
          if (habilidadesPerfiles[perfil.name]) {
            Object.entries(habilidadesPerfiles[perfil.name]).forEach(([habilidad, activa]) => {
              if (activa) {
                const habilidadConfig = weapon_abilities[habilidad];
                if (habilidadConfig?.type === 'toggleable') {
                  console.log(`Aplicando habilidad ${habilidad} a ${perfil.name}:`, habilidadConfig);
                  
                  // Modificar el perfil según la habilidad
                  if (habilidadConfig.effect.type === 'modifier') {
                    const targetProperty = habilidadConfig.effect.target;
                    const valorModificador = habilidadConfig.effect.value;
                    
                    console.log(`Modificando ${targetProperty} de ${perfilModificado[targetProperty]} a ${perfilModificado[targetProperty] + valorModificador}`);
                    
                    perfilModificado[targetProperty] = perfilModificado[targetProperty] + valorModificador;
                    
                    // También añadimos la habilidad al array para referencia
                    habilidadesAdicionales.push(habilidad);
                  }
                }
              }
            });
          }

          // Añadir habilidad condicional solo si la condición se cumple
          if (unidad.ability?.effect?.type === 'conditional_ability' &&
              (unidad.ability.type === 'fixed' || 
               (unidad.ability.type === 'toggleable' && habilidadUnidadActiva))) {
            
            const efecto = unidad.ability.effect;
            const condicion = efecto.condition;
            
            // Verificar la condición específica para Brutal Blows
            if (condicion.type === 'enemy_unit' && 
                condicion.property === 'models' && 
                unidadObjetivo.models >= condicion.value) {
              
              // Verificar si afecta a todos los perfiles o uno específico
              if (efecto.affects === 'all_profiles' || efecto.affects === perfil.name) {
                console.log(`Añadiendo habilidad ${efecto.ability} a ${perfil.name}`);
                habilidadesAdicionales.push(efecto.ability);
              }
            }
          }

          perfilModificado.abilities = habilidadesAdicionales;
          
          console.log('Perfil después de modificaciones:', {
            nombre: perfil.name,
            damage: perfilModificado.damage,
            habilidades: perfilModificado.abilities
          });

          return perfilModificado;
        });

      console.log('Perfiles modificados para cálculo:', perfilesModificados);

      const resultado = calculateAttacks({
        perfiles_ataque: perfilesModificados,
        miniaturas: unidad.models,
        guardia: unidadObjetivo.save,
        salvaguardia: unidadObjetivo.ward,
        _save_override: null
      });

      return {
        nombreUnidad: nombreUnidadObjetivo,
        unidadAtacante: unidad,
        unidadOponente: unidadObjetivo,
        perfilesModificados,
        habilidadUnidadActiva,
        habilidadesPerfiles,
        damage_final: resultado.damage_final,
        desglose_perfiles: resultado.desglose_perfiles
      };
    });

    // Calcular el daño máximo entre todas las unidades
    const maxDano = Math.max(...resultados.map(r => r.damage_final));

    // Añadir el maxDano a cada resultado
    return resultados.map(r => ({
      ...r,
      maxDanoEjercito: maxDano
    }));
  }, [unidad, ejercitoOponente, perfilesActivos, habilidadesPerfiles, habilidadUnidadActiva]);

  if (!unidad) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {nombreUnidad}
        </Typography>

        {/* Habilidad de la unidad */}
        {unidad.ability && (
          <Box 
            sx={{ 
              mb: 2,
              p: 1,
              borderRadius: 1,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Tooltip 
              title={unidad.ability.description}
              arrow
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#ffd700',
                  cursor: 'help',
                  flex: 1
                }}
              >
                {unidad.ability.name}
              </Typography>
            </Tooltip>
            {unidad.ability.type === 'toggleable' && (
              <Switch
                size="small"
                checked={habilidadUnidadActiva}
                onChange={() => setHabilidadUnidadActiva(prev => !prev)}
                sx={{
                  '& .MuiSwitch-track': {
                    backgroundColor: 'rgba(255, 215, 0, 0.3)'
                  },
                  '& .MuiSwitch-thumb': {
                    backgroundColor: habilidadUnidadActiva ? '#ffd700' : '#666'
                  }
                }}
              />
            )}
          </Box>
        )}

        {/* Perfiles de ataque */}
        {unidad.attack_profiles?.map(perfil => (
          <PerfilAtaque
            key={perfil.name}
            perfil={perfil}
            activo={perfilesActivos[perfil.name]}
            onToggle={(nombre) => setPerfilesActivos(prev => ({
              ...prev,
              [nombre]: !prev[nombre]
            }))}
            habilidadesPerfil={habilidadesPerfiles[perfil.name]}
            habilidadUnidad={unidad.ability}
            habilidadUnidadActiva={habilidadUnidadActiva}
            onToggleHabilidad={modificarPerfil}
          />
        ))}

        {/* Daños contra unidades */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Daño esperado contra:
          </Typography>
          {danosContraUnidades.map((datos) => (
            <DanoBar
              key={datos.nombreUnidad}
              {...datos}
              damage_final={datos.damage_final}
              desglose_perfiles={datos.desglose_perfiles}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

// Función auxiliar para calcular el valor medio de un dado
const calcularValorDado = (dado) => {
  if (typeof dado === 'number') return dado;
  if (typeof dado === 'string') {
    const match = dado.toUpperCase().match(/D(\d+)/);
    if (match) {
      const caras = parseInt(match[1]);
      return (caras + 1) / 2;
    }
  }
  return 0;
};

export default UnidadCard; 