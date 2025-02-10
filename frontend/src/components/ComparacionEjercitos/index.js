import React, { useState,useRef,useEffect, useCallback, useMemo } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  Collapse,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import { armies } from '../../data/armies';
import { calculateAttacks } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';


function ComparacionEjercitos() {
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState(() => 
    localStorage.getItem('selectedAttacker') || Object.keys(armies)[0]
  );
  
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState(() =>
    localStorage.getItem('selectedDefender') || Object.keys(armies)[1]
  );

  const [vistaUnaColumna, setVistaUnaColumna] = useState(false);

  const unidadesAtacantesOrdenadas = useMemo(() => {
    const ejercito = armies[selectedEjercitoAtacante];
    return Object.entries(ejercito?.units || {});
  }, [selectedEjercitoAtacante]);

  const unidadesDefensorasOrdenadas = useMemo(() => {
    const ejercito = armies[selectedEjercitoDefensor];
    return Object.entries(ejercito?.units || {});
  }, [selectedEjercitoDefensor]);

  useEffect(() => {
    localStorage.setItem('selectedAttacker', selectedEjercitoAtacante);
    localStorage.setItem('selectedDefender', selectedEjercitoDefensor);
  }, [selectedEjercitoAtacante, selectedEjercitoDefensor]);

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: vistaUnaColumna ? '1400px' : '1800px',
      margin: '0 auto',
      p: { xs: 2, md: 4 },
      backgroundColor: 'background.default',
    }}>
      {/* Control de vista */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: 2 
      }}>
        <Typography variant="body2" color="primary">
          {vistaUnaColumna ? 'Vista atacante' : 'Vista comparativa'}
        </Typography>
        <Switch
          checked={vistaUnaColumna}
          onChange={(e) => setVistaUnaColumna(e.target.checked)}
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: vistaUnaColumna ? 'primary.main' : 'grey.600'
            }
          }}
        />
      </Box>

      {/* Selectores de ejércitos */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small" sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'custom.inputBackground',
              borderColor: 'divider'
            }
          }}>
            <InputLabel sx={{ color: 'primary.main' }}>Attacking Army</InputLabel>
            <Select
              value={selectedEjercitoAtacante}
              onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
              label="Attacking Army"
            >
              {Object.keys(armies).map((nombre) => (
                <MenuItem key={nombre} value={nombre}>
                  {nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small" sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'custom.inputBackground',
              borderColor: 'divider'
            }
          }}>
            <InputLabel sx={{ color: 'primary.main' }}>Defending Army</InputLabel>
            <Select
              value={selectedEjercitoDefensor}
              onChange={(e) => setSelectedEjercitoDefensor(e.target.value)}
              label="Defending Army"
            >
              {Object.keys(armies).map((nombre) => (
                <MenuItem key={nombre} value={nombre}>
                  {nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Lista de unidades */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={vistaUnaColumna ? 12 : 6}>
          {unidadesAtacantesOrdenadas.map(([nombre, unidad]) => (
            <UnidadCard
              key={nombre}
              nombreUnidad={nombre}
              unidad={unidad}
              ejercitoOponente={armies[selectedEjercitoDefensor]}
              esAtacante={true}
            />
          ))}
        </Grid>
        {!vistaUnaColumna && (
          <Grid item xs={12} md={6}>
            {unidadesDefensorasOrdenadas.map(([nombre, unidad]) => (
              <UnidadCard
                key={nombre}
                nombreUnidad={nombre}
                unidad={unidad}
                ejercitoOponente={armies[selectedEjercitoAtacante]}
                esAtacante={false}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Box>
  );
}


const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, esAtacante, provided = {} }) => {
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
  const [expandido, setExpandido] = useState(false);

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
    <Card 
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      sx={{ 
        background: 'linear-gradient(160deg, rgba(0, 207, 200, 0.05) 0%, rgba(0, 207, 200, 0.02) 100%)',
        border: '1px solid',
        borderColor: 'rgba(0, 207, 200, 0.15)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        mb: 2,
        '&:hover': {
          borderColor: 'primary.main',
          '&:after': {
            opacity: 0.3,
          }
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #00cfc8 0%, #ff4d82 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '& .MuiCardContent-root': {
          pb: '0 !important',
          p: 0
        }
      }}
    >
      <CardContent>
        <Box 
          onClick={() => setExpandido(!expandido)}
          sx={{
            background: 'linear-gradient(90deg, rgba(0, 207, 200, 0.1) 0%, transparent 100%)',
            py: 2,
            px: 3,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{
              textShadow: '0 2px 8px rgba(0, 207, 200, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {nombreUnidad}
          </Typography>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ml: 'auto' // Empuja el contenido a la derecha
          }}>
            {!expandido && (
              <Typography sx={{ 
                color: 'text.primary',
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
              color: 'text.primary',
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
                  color="primary.main"
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
              <Box sx={{ 
                display: 'flex', 
                gap: 1
              }}>
                {unidad.tags?.map((tag) => (
                  <UnitTag key={tag} label={tag} />
                ))}
              </Box>
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

const PerfilAtaque = React.memo(({ 
  perfil, 
  activo, 
  habilidadesPerfil = {},
  onToggleHabilidad
}) => {
  const statsBase = {
    attacks: perfil.attacks,
    hit: perfil.hit,
    wound: perfil.wound,
    rend: perfil.rend,
    damage: perfil.damage
  };

  const statsModificados = {
    ...statsBase,
    ...habilidadesPerfil
  };

  // Preparar el tooltip de habilidades
  const habilidadesTooltip = perfil.abilities?.map(habilidadId => {
    const habilidad = weapon_abilities[habilidadId];
    return `${habilidad?.name || habilidadId}: ${habilidad?.description || ''}`;
  }).join('\n\n') || '-';

  // Handler para el toggle
  const handleToggle = (e) => {
    // Evitar que el click se propague si viene del switch
    if (e?.stopPropagation) {
      e.stopPropagation();
    }
    onToggleHabilidad(perfil.name, 'active', !activo);
  };

  return (
    <Box 
      onClick={handleToggle}
      sx={{
        mb: 0.5,
        backgroundColor: activo ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.05)',
        p: 0.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        opacity: activo ? 1 : 0.5,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: activo ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.1)'
        }
      }}
    >
      {/* Nombre y Toggle a la izquierda */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        minWidth: '40px',
        flex: '0 0 auto',
      }}>
        <Switch
          checked={activo}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()} // Evitar doble toggle
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: activo ? 'primary.main' : 'grey.600'
            }
          }}
        />
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            color: 'text.primary',
            maxWidth: '150px',
          }}
        >
          {perfil.name}
        </Typography>
      </Box>

      {/* Stats alineados a la derecha */}
      <Box sx={{ 
        display: 'flex',
        gap: 0.5,
        ml: 'auto',
      }}>
        {[...['attacks', 'hit', 'wound', 'rend', 'damage'], 'abilities'].map(stat => (
          <Tooltip 
            key={stat} 
            title={stat === 'abilities' ? habilidadesTooltip : ''}
            arrow
            placement="top"
          >
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              p: 0.5,
              width: '40px',
              height: '35px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {stat === 'abilities' ? 'AB' : stat.charAt(0).toUpperCase()}
              </Typography>
              {stat === 'abilities' ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '16px'
                }}>
                  {perfil.abilities?.length ? (
                    <Box sx={{
                      width: 6,
                      height: 6,
                      backgroundColor: 'primary.main',
                      borderRadius: '2px',
                      transform: 'rotate(45deg)'
                    }} />
                  ) : (
                    <Typography sx={{ color: 'text.secondary' }}>-</Typography>
                  )}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: statsModificados[stat] !== statsBase[stat] ? 'primary.main' : 'text.primary',
                    fontWeight: 'medium',
                    fontSize: '0.85rem'
                  }}
                >
                  {typeof perfil[stat] === 'string' && perfil[stat].toUpperCase().match(/D\d+/) 
                    ? perfil[stat].toUpperCase()
                    : statsModificados[stat]}
                  {(stat === 'hit' || stat === 'wound') ? '+' : ''}
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
});

export const usePerfilesAtaque = (unidad) => {
  // Estado para perfiles activos
  const [perfilesActivos, setPerfilesActivos] = useState(() => {
    if (!unidad?.attack_profiles) return {};
    return unidad.attack_profiles.reduce((acc, perfil) => ({
      ...acc,
      [perfil.name]: true
    }), {});
  });

  // Estado para habilidades de perfiles
  const [habilidadesPerfiles, setHabilidadesPerfiles] = useState(() => {
    if (!unidad?.attack_profiles) return {};
    
    return unidad.attack_profiles.reduce((acc, perfil) => {
      const habilidades = perfil.abilities || [];
      const habilidadesToggleables = habilidades.reduce((habAcc, hab) => {
        const habilidadConfig = weapon_abilities[hab];
        if (habilidadConfig?.type === 'toggleable') {
          return {
            ...habAcc,
            [hab]: false // Inicialmente desactivadas
          };
        }
        return habAcc;
      }, {});

      return {
        ...acc,
        [perfil.name]: habilidadesToggleables
      };
    }, {});
  });

  // Función para modificar una habilidad de perfil
  const modificarPerfil = useCallback((nombrePerfil, tipo, valor) => {
    if (tipo === 'active') {
      setPerfilesActivos(prev => ({
        ...prev,
        [nombrePerfil]: valor
      }));
    } else {
      setHabilidadesPerfiles(prev => ({
        ...prev,
        [nombrePerfil]: {
          ...prev[nombrePerfil],
          [tipo]: valor
        }
      }));
    }
  }, []);

  // Obtener habilidades de unidad
  const habilidadesUnidad = useMemo(() => {
    if (!unidad?.ability) return [];
    return [unidad.ability].filter(Boolean);
  }, [unidad]);

  console.log('Estado actual de perfiles:', {
    perfilesActivos,
    habilidadesPerfiles,
    habilidadesUnidad
  });

  return {
    perfilesActivos,
    setPerfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
    habilidadesUnidad
  };
};

const DanoBar = React.memo(({ 
  nombreUnidad,
  unidadAtacante,
  unidadOponente,
  perfilesModificados,
  maxDanoEjercito,
  damage_final,
  desglose_perfiles
}) => {
  const danoTotal = Number.isFinite(damage_final) ? damage_final : 0;

  // Estado para controlar la visibilidad de cada tooltip individualmente
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  // Preparar arrays de habilidades, filtrando por categoría
  const habilidadesAtacante = [].concat(unidadAtacante.abilities || unidadAtacante.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'offensive');
    
  const habilidadesOponente = [].concat(unidadOponente.abilities || unidadOponente.ability)
    .filter(Boolean)
    .filter(hab => hab.category === 'defensive');

  // Modificar la preparación de habilidades para incluir las habilidades de armas
  const habilidades = {
    ofensivas: [
      // Habilidades de unidad ofensivas
      ...habilidadesAtacante
        .filter(hab => {
          const condicionesCumplidas = !hab.effect?.conditions || 
            Object.entries(hab.effect.conditions).every(([key, value]) => {
              switch(key) {
                case 'attack_type':
                  return perfilesModificados.some(perfil => perfil.type === value);
                default:
                  return true;
              }
            });
          return condicionesCumplidas;
        })
        .map(hab => ({
          id: `${unidadAtacante.name}_${hab.name}`,
          ...hab
        })),
      // Habilidades de armas
      ...perfilesModificados.flatMap(perfil => 
        (perfil.abilities || []).map(habilidadId => {
          const habilidadInfo = weapon_abilities[habilidadId];
          return {
            id: `${perfil.name}_${habilidadId}`,
            name: habilidadInfo?.name || habilidadId,
            description: habilidadInfo?.description || '',
            type: habilidadInfo?.type || 'fixed',
            effect: habilidadInfo?.effect,
            profileName: perfil.name
          };
        })
      )
    ],
    defensivas: habilidadesOponente
      .filter(hab => {
        const condicionesCumplidas = !hab.effect?.conditions || 
          Object.entries(hab.effect.conditions).every(([key, value]) => {
            switch(key) {
              case 'attack_type':
                return perfilesModificados.some(perfil => perfil.type === value);
              default:
                return true;
            }
          });
        return condicionesCumplidas;
      })
      .map(hab => ({
        id: `${unidadOponente.name}_${hab.name}`,
        ...hab
      }))
  };

  const { habilidadesActivas, toggleHabilidadOfensiva, toggleHabilidadDefensiva } = useHabilidades(unidadAtacante, unidadOponente);

  // Recalcular el daño cuando cambien las habilidades
  const danoCalculado = useMemo(() => {
    let saveModificado = unidadOponente.save;
    let wardModificado = unidadOponente.ward;
    let modificadoresAtaqueEnemigo = {};
    
    // Manejar array de habilidades defensivas
    if (unidadOponente.abilities || unidadOponente.ability) {
      const habilidades = [].concat(unidadOponente.abilities || unidadOponente.ability).filter(Boolean);
      
      habilidades.forEach(habilidad => {
        const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
        
        // Comprobar si las condiciones se cumplen (si hay)
        const condicionesCumplidas = !habilidad.effect?.conditions || 
          Object.entries(habilidad.effect.conditions).every(([key, value]) => {
            switch(key) {
              case 'attack_type':
                return perfilesModificados.some(perfil => perfil.type === value);
              default:
                return true;
            }
          });

        // Solo aplicar si cumple las condiciones y es fixed o está activa
        const debeAplicarse = condicionesCumplidas && 
          (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
        
        if (debeAplicarse && habilidad.effect) {
          const { type, target, value, affects } = habilidad.effect;
          
          if (type === 'modifier') {
            if (target === 'save') {
              saveModificado = saveModificado - parseInt(value);
            } else if (target === 'ward') {
              if (!wardModificado || parseInt(value) < wardModificado) {
                wardModificado = parseInt(value);
              }
            } else if (affects === 'enemy_attacks') {
              // Verificar las condiciones del ataque antes de aplicar el modificador
              Object.entries(modificadoresAtaqueEnemigo).forEach(([stat, mod]) => {
                if ((!habilidad.effect?.conditions || !habilidad.effect.conditions.attack_type || 
                    perfilesModificados.some(perfil => perfil.type === habilidad.effect.conditions.attack_type))) {
                  modificadoresAtaqueEnemigo[target] = (modificadoresAtaqueEnemigo[target] || 0) + parseInt(value);
                }
              });
            }
          }
        }
      });
    }

    const perfilesConHabilidades = perfilesModificados.map(perfil => {
      let perfilModificado = { ...perfil };
      
      // Aplicar modificadores de ataques enemigos
      if (Object.keys(modificadoresAtaqueEnemigo).length > 0) {
        Object.entries(modificadoresAtaqueEnemigo).forEach(([stat, mod]) => {
          perfilModificado[stat] = parseInt(perfilModificado[stat]) + mod;
        });
      }

      // Aplicar habilidades de armas
      perfil.abilities?.forEach(habilidadId => {
        const habilidadInfo = weapon_abilities[habilidadId];
        const habilidadCompuestaId = `${perfil.name}_${habilidadId}`;
        
        if (habilidadInfo?.type === 'fixed' || habilidadesActivas.ofensivas[habilidadCompuestaId]) {
          // Aplicar los efectos de la habilidad
          if (habilidadInfo?.effect) {
            const { type, target, value } = habilidadInfo.effect;
            if (type === 'modifier') {
              if (target === 'abilities') {
                perfilModificado.abilities = perfilModificado.abilities || [];
                if (!perfilModificado.abilities.includes(value)) {
                  perfilModificado.abilities = [...perfilModificado.abilities, value];
                }
              } else {
                perfilModificado[target] = parseInt(perfilModificado[target]) + 
                  ((['hit', 'wound'].includes(target)) ? -parseInt(value) : parseInt(value));
              }
            }
          }
        }
      });

      // Manejar array de habilidades ofensivas
      if (unidadAtacante.abilities || unidadAtacante.ability) {
        const habilidades = [].concat(unidadAtacante.abilities || unidadAtacante.ability).filter(Boolean);
        
        habilidades.forEach(habilidad => {
          const habilidadId = `${unidadAtacante.name}_${habilidad.name}`;
          const activa = habilidadesActivas.ofensivas[habilidadId];
          
          if (activa) {
            const { type, target, value, conditions } = habilidad.effect;
            
            const aplicarHabilidad = !conditions || (
              (!conditions.profile_name || conditions.profile_name === perfil.name) &&
              (!conditions.attack_type || conditions.attack_type === perfil.type)
            );

            if (aplicarHabilidad) {
              if (type === 'modifier') {
                if (target === 'abilities') {
                  perfilModificado.abilities = perfilModificado.abilities || [];
                  if (!perfilModificado.abilities.includes(value)) {
                    perfilModificado.abilities = [...perfilModificado.abilities, value];
                  }
                } else {
                  perfilModificado[target] = parseInt(perfilModificado[target]) + 
                    ((['hit', 'wound'].includes(target)) ? -parseInt(value) : parseInt(value));
                }
              } else if (type === 'dice_override') {
                // Para dice_override, asegurarnos de que el valor es numérico
                perfilModificado[target] = parseInt(value);
                
                // Debug para ver los valores
                console.log('Aplicando dice_override:', {
                  perfil: perfil.name,
                  target,
                  originalValue: perfil[target],
                  newValue: perfilModificado[target]
                });
              }
            }
          }
        });
      }
      
      return perfilModificado;
    });

    return calculateAttacks({
      perfiles_ataque: perfilesConHabilidades,
      miniaturas: unidadAtacante.models,
      guardia: saveModificado,
      salvaguardia: wardModificado
    });
  }, [perfilesModificados, habilidadesActivas, unidadAtacante, unidadOponente]);

  // Actualizar los manejadores de eventos
  const handleToggleOfensiva = (habilidadId) => {
    console.log('Toggle habilidad ofensiva:', habilidadId);
    toggleHabilidadOfensiva(habilidadId);
  };

  const handleToggleDefensiva = (habilidadId) => {
    console.log('Toggle habilidad defensiva:', habilidadId);
    toggleHabilidadDefensiva(habilidadId);
  };

  const handleMouseEnter = (habilidadId) => {
    // Limpiar cualquier timeout pendiente
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    // Establecer un timeout para mostrar el tooltip específico
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(habilidadId);
    }, 500);
  };

  const handleMouseLeave = () => {
    // Limpiar el timeout si existe
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    // Ocultar el tooltip
    setActiveTooltip(null);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Usar el daño calculado en lugar del damage_final proporcionado
  const danoFinal = danoCalculado.damage_final;
  const vidaTotal = unidadOponente.wounds * unidadOponente.models;
  const porcentajeVidaTotal = Math.min((danoFinal / vidaTotal) * 100, 100);

  // Debug de los cálculos
  console.log('DanoBar calcula:', {
    danoFinal,
    vidaTotal,
    porcentajeVidaTotal,
    wounds: unidadOponente.wounds,
    models: unidadOponente.models
  });

  return (
    <Box sx={{ 
      flex: 1,
      minWidth: '140px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      {/* Nombre y stats del objetivo */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          {nombreUnidad}
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              lineHeight: 1
            }}
          >
            {danoFinal.toFixed(1)}
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 0.5
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(144, 202, 249, 0.7)',
                fontWeight: 500
              }}
            >
              {`${porcentajeVidaTotal.toFixed(0)}%`}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.7rem'
              }}
            >
              {`(${Math.ceil(danoFinal)}/${vidaTotal}W)`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Contenedor de números y barra */}
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}>
        {/* Barra de progreso */}
        <Box sx={{ 
          height: '12px', // Reducida la altura de la barra
          position: 'relative',
          borderRadius: '2px',
          overflow: 'hidden',
          backgroundColor: 'custom.progressBarBg',
          maskImage: `repeating-linear-gradient(
            to right,
            #000 0%,
            #000 calc(${100 / unidadOponente.models}% - 2px),
            transparent calc(${100 / unidadOponente.models}% - 2px),
            transparent ${100 / unidadOponente.models}%
          )`,
          WebkitMaskImage: `repeating-linear-gradient(
            to right,
            #000 0%,
            #000 calc(${100 / unidadOponente.models}% - 2px),
            transparent calc(${100 / unidadOponente.models}% - 2px),
            transparent ${100 / unidadOponente.models}%
          )`,
        }}>
          {/* Barra de progreso única */}
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: `${porcentajeVidaTotal}%`,
              backgroundColor: 'primary.main',
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>

      {/* Lista de habilidades */}
      {(habilidades.ofensivas.length > 0 || habilidades.defensivas.length > 0) && (
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          {/* Habilidades ofensivas */}
          {habilidades.ofensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id} 
              title={habilidad.description} 
              arrow
              open={activeTooltip === habilidad.id}
              onClose={() => setActiveTooltip(null)}
              disableHoverListener
              placement="top"
              sx={{
                backgroundColor: 'custom.tooltipBackground',
              }}
            >
              <Box 
                onMouseEnter={() => handleMouseEnter(habilidad.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => habilidad.type === 'toggleable' && handleToggleOfensiva(habilidad.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id]
                    ? 'rgba(0, 207, 200, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id]
                    ? 'primary.main'
                    : 'divider',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(0, 207, 200, 0.25)',
                    borderColor: 'primary.light'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id] 
                    ? '#e6f7ff'
                    : 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id] 
                    ? 500 
                    : 400
                }}>
                  {habilidad.name}
                </Typography>
                {habilidad.type === 'toggleable' && (
                  <Switch
                    size="small"
                    checked={habilidadesActivas.ofensivas[habilidad.id] || false}
                    onChange={() => handleToggleOfensiva(habilidad.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      transform: 'scale(0.6)',
                      ml: 0.5
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}

          {/* Habilidades defensivas */}
          {habilidades.defensivas.map((habilidad) => (
            <Tooltip 
              key={habilidad.id} 
              title={habilidad.description} 
              arrow
              open={activeTooltip === habilidad.id}
              onClose={() => setActiveTooltip(null)}
              disableHoverListener
              placement="top"
              sx={{
                backgroundColor: 'custom.tooltipBackground',
              }}
            >
              <Box 
                onMouseEnter={() => handleMouseEnter(habilidad.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => habilidad.type === 'toggleable' && handleToggleDefensiva(habilidad.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id]
                    ? 'rgba(255, 77, 130, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id]
                    ? 'secondary.main'
                    : 'divider',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(255, 77, 130, 0.25)',
                    borderColor: 'secondary.light'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id] 
                    ? '#e6f7ff'
                    : 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id] 
                    ? 500 
                    : 400
                }}>
                  {habilidad.name}
                </Typography>
                {habilidad.type === 'toggleable' && (
                  <Switch
                    size="small"
                    checked={habilidadesActivas.defensivas[habilidad.id] || false}
                    onChange={() => handleToggleDefensiva(habilidad.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      transform: 'scale(0.6)',
                      ml: 0.5
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}
    </Box>
  );
});

export const useHabilidades = (unidadAtacante, unidadDefensora) => {
  // Estado para las habilidades activas
  const [habilidadesActivas, setHabilidadesActivas] = useState({
    ofensivas: {},
    defensivas: {}
  });
  
  // Determinar qué habilidades están disponibles
  const habilidades = useMemo(() => {
    const ofensivas = [];
    const defensivas = [];
    
    // Procesar habilidad de unidad atacante
    if (unidadAtacante?.ability && unidadAtacante.ability.category === 'offensive') {
      ofensivas.push({
        id: `${unidadAtacante.name}_${unidadAtacante.ability.name}`,
        name: unidadAtacante.ability.name,
        description: unidadAtacante.ability.description,
        type: unidadAtacante.ability.type,
        effect: unidadAtacante.ability.effect,
        source: 'unit'
      });
    }
    
    // Procesar habilidad de unidad defensora
    if (unidadDefensora?.ability && unidadDefensora.ability.category === 'defensive') {
      defensivas.push({
        id: `${unidadDefensora.name}_${unidadDefensora.ability.name}`,
        name: unidadDefensora.ability.name,
        description: unidadDefensora.ability.description,
        type: unidadDefensora.ability.type,
        effect: unidadDefensora.ability.effect,
        source: 'unit'
      });
    }
    
    return { ofensivas, defensivas };
  }, [unidadAtacante, unidadDefensora]);

  // Toggle para habilidad ofensiva
  const toggleHabilidadOfensiva = useCallback((habilidadId) => {
    setHabilidadesActivas(prev => ({
      ...prev,
      ofensivas: {
        ...prev.ofensivas,
        [habilidadId]: !prev.ofensivas[habilidadId]
      }
    }));
  }, []);

  // Toggle para habilidad defensiva
  const toggleHabilidadDefensiva = useCallback((habilidadId) => {
    setHabilidadesActivas(prev => ({
      ...prev,
      defensivas: {
        ...prev.defensivas,
        [habilidadId]: !prev.defensivas[habilidadId]
      }
    }));
  }, []);

  // Obtener estado de una habilidad
  const getHabilidadActiva = useCallback((tipo, habilidadId) => {
    return habilidadesActivas[tipo][habilidadId] || false;
  }, [habilidadesActivas]);

  return {
    habilidades,
    habilidadesActivas,
    toggleHabilidadOfensiva,
    toggleHabilidadDefensiva,
    getHabilidadActiva
  };
};

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
      color: color || 'text.primary',
      opacity: 0.7,
      fontWeight: 500,
      fontSize: '0.75rem'
    }}>
      {label}
    </Typography>
    <Typography sx={{ 
      color: 'custom.statValue',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    }}>
      {value}
    </Typography>
  </Box>
);

// Componente para las tags
const UnitTag = ({ label }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.5,
      py: 0.5,
      borderRadius: '2px',
      backgroundColor: 'background.darker',
      border: '1px solid',
      borderColor: 'primary.dark',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      '& .MuiTypography-root': {
        color: 'primary.light',
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'lowercase',
        letterSpacing: '0.5px',
        pb: 0
      }
    }}
  >
    <Typography>
      {label}
    </Typography>
  </Box>
);

export default ComparacionEjercitos; 