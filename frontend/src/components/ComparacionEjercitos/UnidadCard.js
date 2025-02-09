import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  Switch,
  Collapse
} from '@mui/material';
import { usePerfilesAtaque } from '../../hooks/usePerfilesAtaque';
import { calculateAttacks } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';
import PerfilAtaque from './PerfilAtaque';
import { default as DanoBar } from './DanoBar';
import { DragHandle } from '@mui/icons-material';


const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, esAtacante, provided }) => {
  // Usar el hook de perfiles de ataque
  const {
    perfilesActivos,
    setPerfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
    habilidadesUnidad,
    setHabilidadesUnidad
  } = usePerfilesAtaque(unidad);

  // Estado para habilidades toggleables de unidad
  const [habilidadUnidadActiva, setHabilidadUnidadActiva] = useState(false);
  const [expandido, setExpandido] = useState(true);

  // Manejadores para habilidades ofensivas y defensivas
  const handleToggleHabilidadOfensiva = useCallback((unidadId, habilidadId) => {
    setHabilidadesUnidad(prev => ({
      ...prev,
      ofensivas: {
        ...prev.ofensivas,
        [unidadId]: {
          ...prev.ofensivas[unidadId],
          [habilidadId]: !prev.ofensivas[unidadId]?.[habilidadId]
        }
      }
    }));
  }, [setHabilidadesUnidad]);

  const handleToggleHabilidadDefensiva = useCallback((unidadId, habilidadId) => {
    setHabilidadesUnidad(prev => ({
      ...prev,
      defensivas: {
        ...prev.defensivas,
        [unidadId]: {
          ...prev.defensivas[unidadId],
          [habilidadId]: !prev.defensivas[unidadId]?.[habilidadId]
        }
      }
    }));
  }, [setHabilidadesUnidad]);

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

  // Calcular el daño medio
  const danoMedio = useMemo(() => {
    if (!danosContraUnidades?.length) return 0;
    const total = danosContraUnidades.reduce((sum, dato) => sum + dato.damage_final, 0);
    return (total / danosContraUnidades.length).toFixed(1);
  }, [danosContraUnidades]);

  if (!unidad) return null;

  return (
    <Card sx={{
      backgroundColor: '#2a3040',
      border: '1px solid #3a4156',
      borderRadius: '0.5rem',
      mb: 2,
      width: '100%',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ 
        p: '0 !important',
      }}>
        {/* Cabecera clickeable */}
        <Box 
          onClick={() => setExpandido(!expandido)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.05)',
            }
          }}
        >
          <Typography variant="h5" sx={{ 
            color: '#fff',
            fontWeight: 500,
            fontSize: '1.3rem'
          }}>
            {nombreUnidad}
          </Typography>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            {!expandido && (
              <Typography sx={{ 
                color: '#ff6b6b',
                fontSize: '1.5rem',
                fontWeight: 600,
                opacity: 0.9,
                minWidth: '60px',
                textAlign: 'right'
              }}>
                {danoMedio}
              </Typography>
            )}
            <Box sx={{ 
              color: '#90caf9',
              opacity: 0.7,
              transition: 'transform 0.3s ease',
              transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </Box>
          </Box>
        </Box>

        {/* Contenido expandible con animación */}
        <Collapse in={expandido}>
          <Box sx={{ p: 2, pt: 1 }}>
            {/* Stats y tags en una línea */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              px: 0.5
            }}>
              {/* Stats defensivos */}
              <Box sx={{
                display: 'flex',
                gap: 2
              }}>
                <StatBox 
                  label="Size" 
                  value={unidad.models} 
                  color="#90caf9"
                />
                <StatBox 
                  label="Wounds" 
                  value={unidad.wounds} 
                  color="#ff6b6b"
                />
                <StatBox 
                  label="Save" 
                  value={`${unidad.save}+`} 
                  color="#ffd700"
                />
                <StatBox 
                  label="Ward" 
                  value={unidad.ward ? `${unidad.ward}+` : '-'} 
                  color="#9370db"
                />
              </Box>

              {/* Tags */}
              <Typography 
                variant="caption" 
                sx={{ 
                  backgroundColor: 'rgba(144, 202, 249, 0.1)',
                  color: '#90caf9',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.5px'
                }}
              >
                {unidad.tags?.[0] || 'INFANTRY'}
              </Typography>
            </Box>

            {/* Perfiles de ataque */}
            <Box sx={{ mb: 2 }}>
              {unidad.attack_profiles?.map(perfil => (
                <PerfilAtaque
                  key={perfil.name}
                  perfil={perfil}
                  activo={perfilesActivos[perfil.name]}
                  habilidadesPerfil={habilidadesPerfiles[perfil.name]}
                  onToggleHabilidad={modificarPerfil}
                />
              ))}
            </Box>

            {/* Daños contra unidades */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              width: '100%',
              overflowX: 'auto',
              pb: 1,
              '& > *': {
                flex: 1,
                minWidth: '140px',
              }
            }}>
              {danosContraUnidades.map((datos, index) => (
                <DanoBar
                  key={datos.nombreUnidad}
                  {...datos}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
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

// Componente auxiliar para los stats
const StatBox = ({ label, value, color }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }}>
    <Typography variant="caption" sx={{ 
      color: color,
      opacity: 0.7,
      fontWeight: 500,
      fontSize: '0.75rem'
    }}>
      {label}
    </Typography>
    <Typography sx={{ 
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    }}>
      {value}
    </Typography>
  </Box>
);

export default UnidadCard; 