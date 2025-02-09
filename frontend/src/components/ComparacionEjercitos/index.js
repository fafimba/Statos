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
import { useHabilidades } from '../../hooks/useHabilidades';
import { usePerfilesAtaque } from '../../hooks/usePerfilesAtaque';


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
    return Object.entries(ejercito?.units || {})
      .sort(([nombreA], [nombreB]) => nombreA.localeCompare(nombreB));
  }, [selectedEjercitoAtacante]);

  const unidadesDefensorasOrdenadas = useMemo(() => {
    const ejercito = armies[selectedEjercitoDefensor];
    return Object.entries(ejercito?.units || {})
      .sort(([nombreA], [nombreB]) => nombreA.localeCompare(nombreB));
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
    }}>
      {/* Control de vista */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: 2 
      }}>
        <Typography variant="body2" sx={{ color: '#90caf9' }}>
          {vistaUnaColumna ? 'Vista atacante' : 'Vista comparativa'}
        </Typography>
        <Switch
          checked={vistaUnaColumna}
          onChange={(e) => setVistaUnaColumna(e.target.checked)}
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: vistaUnaColumna ? '#90caf9' : '#666'
            }
          }}
        />
      </Box>

      {/* Selectores de ejércitos */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth size="small" sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: '#3a4156'
            }
          }}>
            <InputLabel sx={{ color: '#90caf9' }}>Attacking Army</InputLabel>
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
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderColor: '#3a4156'
            }
          }}>
            <InputLabel sx={{ color: '#90caf9' }}>Defending Army</InputLabel>
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
                color: '#90caf9',
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
              backgroundColor: activo ? '#90caf9' : '#666'
            }
          }}
        />
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ 
            color: '#fff',
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
                      backgroundColor: '#90caf9',
                      borderRadius: '2px',
                      transform: 'rotate(45deg)'
                    }} />
                  ) : (
                    <Typography sx={{ color: '#666' }}>-</Typography>
                  )}
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: statsModificados[stat] !== statsBase[stat] ? '#ffd700' : '#90caf9',
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
            color: '#fff',
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
              color: '#90caf9',
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
          backgroundColor: 'rgba(144, 202, 249, 0.1)'
        }}>
          {/* Barra de progreso única */}
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: `${porcentajeVidaTotal}%`,
              backgroundColor: '#90caf9',
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
                    ? 'rgba(144, 238, 144, 0.2)' 
                    : 'rgba(144, 238, 144, 0.05)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id]
                    ? 'rgba(144, 238, 144, 0.5)' 
                    : 'rgba(144, 238, 144, 0.1)',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(144, 238, 144, 0.3)',
                    borderColor: 'rgba(144, 238, 144, 0.6)'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.ofensivas[habilidad.id] 
                    ? '#90ee90' 
                    : '#aaa',
                  fontSize: '0.75rem'
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
                    ? 'rgba(255, 99, 71, 0.2)' 
                    : 'rgba(255, 99, 71, 0.05)',
                  borderRadius: '4px',
                  px: 1,
                  py: 0.5,
                  cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id]
                    ? 'rgba(255, 99, 71, 0.5)' 
                    : 'rgba(255, 99, 71, 0.1)',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(255, 99, 71, 0.3)',
                    borderColor: 'rgba(255, 99, 71, 0.6)'
                  } : {}
                }}
              >
                <Typography variant="caption" sx={{ 
                  color: habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidad.id] 
                    ? '#ff6347' 
                    : '#aaa',
                  fontSize: '0.75rem'
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

export default ComparacionEjercitos; 