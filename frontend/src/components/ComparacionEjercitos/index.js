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
  Tooltip,
  FormControlLabel
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
      maxWidth: '1800px',
      margin: '0 auto',
      p: { xs: 2, md: 4 },
      backgroundColor: 'background.default',
    }}>
      {/* Selectores de ejército */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        mb: 4,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel 
            id="attacking-army-label"
            sx={{ 
              color: 'text.secondary',
              '&.Mui-focused': {
                color: 'primary.main'
              }
            }}
          >
            Attacking Army
          </InputLabel>
          <Select
            labelId="attacking-army-label"
            value={selectedEjercitoAtacante}
            onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
            label="Attacking Army"
          >
            {Object.keys(armies).map((armyName) => (
              <MenuItem 
                key={armyName} 
                value={armyName}
                sx={{
                  '&:hover': {
                    backgroundColor: '#2a2a2a'
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#333333',
                    '&:hover': {
                      backgroundColor: '#383838'
                    }
                  }
                }}
              >
                {armyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel 
            id="defending-army-label"
            sx={{ 
              color: 'text.secondary',
              '&.Mui-focused': {
                color: 'primary.main'
              }
            }}
          >
            Defending Army
          </InputLabel>
          <Select
            labelId="defending-army-label"
            value={selectedEjercitoDefensor}
            onChange={(e) => setSelectedEjercitoDefensor(e.target.value)}
            label="Defending Army"
          >
            {Object.keys(armies).map((armyName) => (
              <MenuItem 
                key={armyName} 
                value={armyName}
                sx={{
                  '&:hover': {
                    backgroundColor: '#2a2a2a'
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#333333',
                    '&:hover': {
                      backgroundColor: '#383838'
                    }
                  }
                }}
              >
                {armyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Lista de unidades en dos columnas */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
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
      </Grid>
    </Box>
  );
}


const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente }) => {
  // Usar el hook de perfiles de ataque
  const {
    perfilesActivos,
    habilidadesPerfiles,
    modificarPerfil,
  } = usePerfilesAtaque(unidad);

  // Estado para habilidades toggleables de unidad
  const [expandido, setExpandido] = useState(false);

  const danoBarData = useMemo(() => {
    if (!ejercitoOponente?.units) return [];

    // Crear un array de objetos con unidadAtacante, unidadOponente y perfiles activos
    return Object.entries(ejercitoOponente.units).map(([nombreUnidad, unidadOponente]) => ({
      unidadAtacante: unidad,
      unidadOponente: unidadOponente,
      perfilesActivos: perfilesActivos
    }));
    
  }, [ejercitoOponente?.units, unidad, perfilesActivos]);

  // Estado para almacenar los daños calculados por cada DanoBar
  const [danosPorUnidad, setDanosPorUnidad] = useState({});

  // Callback para actualizar el daño de una unidad específica
  const actualizarDano = useCallback((nombreUnidad, dano) => {
    setDanosPorUnidad(prev => {
      // Solo actualizar si el valor es diferente
      if (prev[nombreUnidad] === dano) return prev;
      return {
        ...prev,
        [nombreUnidad]: dano
      };
    });
  }, []); // Sin dependencias porque solo usa setState


  // Calcular el daño medio cuando cambien los daños
  const danoMedio = useMemo(() => {
    const danos = Object.values(danosPorUnidad);
    if (danos.length === 0) return 0;
    return (danos.reduce((sum, dano) => sum + dano, 0) / danos.length).toFixed(1);
  }, [danosPorUnidad]);

  if (!unidad) return null;

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(-160deg, rgba(0, 207, 200, 0.02) 0%, rgba(16, 32, 31, 0.05) 100%)',
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
          <Box sx={{ 
            width: '100%',
            overflow: 'hidden'
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {nombreUnidad}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ml: 'auto' // Empuja el contenido a la derecha
          }}>
            {!expandido && (
              <Tooltip
                title="Average damage dealt by this unit against all units in the opposing army"
                arrow
                placement="left"
                enterDelay={1000}
                leaveDelay={0}
              >
                <Typography sx={{ 
                  color: 'secondary.main',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  opacity: 0.9,
                  minWidth: '60px',
                  textAlign: 'right',
                  cursor: 'help'
                }}>
                  {danoMedio}
                </Typography>
              </Tooltip>
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
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2,
              px: 0.5
            }}>
              {/* Stats defensivos */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' }
              }}>
                <StatBox 
                  label="Size" 
                  value={unidad.models} 
                  color="text.primary"
                />
                <StatBox 
                  label="Wounds" 
                  value={unidad.wounds} 
                  color="text.primary"  
                />
                <StatBox 
                  label="Save" 
                  value={`${unidad.save}+`} 
                  color="text.primary"
                />
                <StatBox 
                  label="Ward" 
                  value={unidad.ward ? `${unidad.ward}+` : '-'} 
                  color="text.primary"
                />
              </Box>

              {/* Tags */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexWrap: 'wrap',
                width: { xs: '100%', sm: 'auto' }
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
              {danoBarData.map((datos, index) => (
                <DanoBar
                  key={index}
                  unidadAtacante={datos.unidadAtacante}
                  unidadOponente={datos.unidadOponente}
                  perfilesActivos={datos.perfilesActivos}
                  onDanoCalculado={(dano) => actualizarDano(datos.unidadOponente.name, dano)}
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
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 1 },
        justifyContent: 'space-between',
        opacity: activo ? 1 : 0.5,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: activo ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
          borderColor: 'rgba(255,255,255,0.1)'
        }
      }}
    >
      {/* Nombre, Tipo y Toggle */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        minWidth: { xs: '100%', sm: '40px' },
        flex: '0 0 auto',
      }}>
        <Switch
          checked={activo}
          onChange={handleToggle}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: activo ? 'primary.main' : 'grey.600'
            }
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            noWrap 
            sx={{ 
              color: 'text.primary',
              maxWidth: { xs: '100%', sm: '150px' },
            }}
          >
            {perfil.name}
          </Typography>
          <Tooltip title={perfil.type === 'melee' ? 'Melee Attack' : 'Range Attack'}>
            <Typography
              variant="caption"
              sx={{
                color: perfil.type === 'melee' ? '#ff9999' : '#99ccff',
                backgroundColor: 'rgba(0,0,0,0.2)',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {perfil.type}
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats alineados */}
      <Box sx={{ 
        display: 'flex',
        gap: 0.5,
        ml: { xs: 0, sm: 'auto' },
        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
        flexWrap: 'wrap',
        paddingLeft: { xs: '40px', sm: 0 },
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
  unidadAtacante,
  unidadOponente,
  perfilesActivos,  
  onDanoCalculado
}) => {

  // Estado para controlar la visibilidad de cada tooltip individualmente
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  const nombreUnidad = unidadOponente.name;

  // Preparar arrays de habilidades, filtrando por categoría
  const habilidadesAtacante = [].concat(unidadAtacante.abilities)
    .filter(Boolean)
    .filter(hab => hab.category === 'offensive');
    
  console.log("habilidadesOponente", unidadOponente);
  const habilidadesOponente = [].concat(unidadOponente.abilities)
    .filter(Boolean)
    .filter(hab => hab.category === 'defensive');


    const perfilesModificados = unidadAtacante.attack_profiles
    .filter(perfil => perfilesActivos[perfil.name])
    .map(perfil => ({
      ...perfil
    }));

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
                case 'target_tag':
                  return unidadOponente.tags?.includes(value);
                case 'profile_name':
                  return perfilesModificados.some(perfil => perfil.name === value);
                case 'opponent_size':
                  const [operador, numero] = value.match(/([<>]=?|=)(\d+)/).slice(1);
                  switch(operador) {
                    case '>=':
                      return unidadOponente.models >= parseInt(numero);
                    case '<=':
                      return unidadOponente.models <= parseInt(numero); 
                    case '>':
                      return unidadOponente.models > parseInt(numero);
                    case '<':
                      return unidadOponente.models < parseInt(numero);
                    case '=':
                      return unidadOponente.models === parseInt(numero);
                    default:
                      return true;
                  }
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
        (perfil.abilities || [])
          .filter(habilidadId => {

            const habilidadInfo = weapon_abilities[habilidadId];
            
          // Si no hay efecto, no se muestra
          if(habilidadInfo?.effect == null)
          return false;

            return Object.entries(habilidadInfo?.effect?.conditions || {}).every(([key, value]) => {
            
              switch(key) {
                case 'attack_type':
                  return perfilesModificados.some(perfil => perfil.type === value);
                case 'target_tag':
                  return unidadOponente.tags?.includes(value);
                case undefined:
                default:
                  return true;
              }
            });

          })
          .map(habilidadId => {
            const habilidadInfo = weapon_abilities[habilidadId];
            return {
              id: `${perfil.name}_${habilidadId}`,
              weapon_id: habilidadId,
              name: habilidadInfo?.name || habilidadId,
              description: perfil.name + ": " + habilidadInfo?.description || '',
              type: habilidadInfo?.type || 'fixed',
              effect: habilidadInfo?.effect,
              profile: perfil.name
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
              case 'target_tag':
                return value ? unidadAtacante.tags?.includes(value) : true;
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

    if (unidadOponente.abilities || unidadOponente.ability) 
      {
        const habilidadesDefensivas = [].concat(unidadOponente.abilities || unidadOponente.ability).filter(Boolean);
        habilidadesDefensivas.forEach(habilidad => {
          const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
          
          // Comprobar si las condiciones se cumplen (si hay)
          const condicionesCumplidas = !habilidad.effect?.conditions || 
            Object.entries(habilidad.effect.conditions).some(([key, value]) => {
              switch(key) {
                case 'attack_type':
                  return perfilesModificados.some(perfil => perfil.type === value);
                case 'target_tag':
                  return unidadAtacante.tags?.includes(value);
                default:
                  return true;
              }
            });

          // Solo aplicar si cumple las condiciones y es fixed o está activa
          const debeAplicarse = condicionesCumplidas && 
            (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
          
          if (debeAplicarse && habilidad.effect) {
            const { type, target, value, affects } = habilidad.effect;
            
            if (type === 'modifier') 
              {
              if (target === 'save') 
                {
                  console.log('Aplicando modificador defensivo a save:', {
                    target,
                    valorModificador: value,
                    nuevoValor: saveModificado
                  });
                  saveModificado = saveModificado - parseInt(value);
                } else if (target === 'ward') 
                {
                if (!wardModificado || parseInt(value) < wardModificado) 
                  {
                    wardModificado = parseInt(value);
                  }
              } 
            }
          }
        });
      }
    // Primero definimos perfilesModificadosDefensa
    let perfilesModificadosDefensa = perfilesModificados.map(perfil => {
      let perfilModificado = { ...perfil };
      
      // Manejar array de habilidades defensivas
      if (unidadOponente.abilities || unidadOponente.ability) 
        {
        const habilidadesDefensivas = [].concat(unidadOponente.abilities || unidadOponente.ability).filter(Boolean);
        
        habilidadesDefensivas.forEach(habilidad => {
          const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
          
          // Comprobar si las condiciones se cumplen (si hay)
          const condicionesCumplidas = !habilidad.effect?.conditions || 
            Object.entries(habilidad.effect.conditions).some(([key, value]) => {
              switch(key) {
                case 'attack_type':
                  return perfilesModificados.some(perfil => perfil.type === value);
                case 'target_tag':
                  return unidadAtacante.tags?.includes(value);
                default:
                  return true;
              }
            });

          // Solo aplicar si cumple las condiciones y es fixed o está activa
          const debeAplicarse = condicionesCumplidas && 
            (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
          
          if (debeAplicarse && habilidad.effect) {
            const { type, target, value, affects } = habilidad.effect;
            
            if (type === 'modifier') 
              {
           if (affects === 'enemy_atributes') 
                {
                    const condicionesCumplidas = Object.entries(habilidad.effect.conditions).every(([key, value]) => {
                      console.log("Evaluando condición:", {
                        key,
                        valorEsperado: value,
                        valorActual: key === 'attack_type' ? perfilModificado.type : 
                                     key === 'target_tag' ? unidadAtacante.tags : 
                                     perfilModificado[key]
                      });
                      
                      switch(key) {
                        case 'attack_type':
                          return perfilModificado.type === value;
                        case 'target_tag':
                          return unidadAtacante.tags?.includes(value);
                        default:
                          return perfilModificado[key] === value;
                      }
                    });

                    if(condicionesCumplidas) {
                      perfilModificado[target] = parseInt(perfilModificado[target]) + parseInt(value);
                      console.log('Aplicando modificador de habilidad defensiva:', {
                        perfil: perfilModificado.name,
                        target,
                        valorAnterior: perfil[target],
                        nuevoValor: perfilModificado[target]
                      });
                    }

                }
            }
          }
        });
      }
      
      return perfilModificado;
    });

    // Luego lo usamos para las habilidades ofensivas
    const perfilesConHabilidades = perfilesModificadosDefensa.map(perfil => {
      let perfilModificado = { ...perfil };
      
      // Aplicar habilidades de armas
      perfilModificado.abilities?.forEach(habilidadId => {
        console.log("habilidadId de armas",habilidadId);

        const habilidadInfo = weapon_abilities[habilidadId];
        
        console.log('Procesando habilidad de arma:', {
          habilidadId,
          habilidadInfo,
          estaActiva: habilidadesActivas.ofensivas[perfil.name + "_" + habilidadId]
        });

        // Solo aplicar si es fixed o está activa en habilidadesActivas
        console.log("habilidadesActivas",habilidadesActivas);

        if (habilidadInfo?.type === 'fixed' || 
            (habilidadInfo?.type === 'toggleable' && habilidadesActivas.ofensivas[perfil.name + "_" + habilidadId])) {
          
          // Verificar si hay condiciones y si se cumplen
          const condicionesCumplidas = !habilidadInfo?.effect?.conditions || 
            Object.entries(habilidadInfo?.effect?.conditions || {}).every(([key, value]) => {
              switch(key) {
                case 'target_tag':
                  return unidadOponente?.tags?.includes(value);
                case 'attack_type':
                  return perfilModificado?.type === value;
                case 'profile_name':
                  return perfilModificado?.name === value;
               case  undefined:
                default:
                  return true;
              }
            });

          if (condicionesCumplidas) {
            console.log("habilidadId", habilidadId);
            perfilModificado.abilities = perfilModificado.abilities || [];
            console.log("perfilModificado.abilities", perfilModificado.abilities);
            // Añadir la habilidad al array
            if (!perfilModificado.abilities.includes(habilidadId)) {
              perfilModificado.abilities = [...perfilModificado.abilities, habilidadId];
              console.log("habilidadId añadida", habilidadId);
            }

            // Aplicar el efecto del modificador si es de tipo 'modifier'
            if (habilidadInfo.effect?.type === 'modifier') {
              const { target, value } = habilidadInfo.effect;
              console.log(`Aplicando modificador ${value} a ${target}`, {
                valorAnterior: perfilModificado[target],
                modificador: value
              });
              
              perfilModificado[target] = parseInt(perfilModificado[target]) + parseInt(value);
            }
          }
        } else {
          // Si la habilidad no está activa, asegurarnos de que no esté en el array
          perfilModificado.abilities = (perfilModificado.abilities || [])
            .filter(id => id !== habilidadId);
        }
      });

      // Manejar array de habilidades ofensivas
      if (unidadAtacante.abilities || unidadAtacante.ability) {
        const habilidades = [].concat(unidadAtacante.abilities || unidadAtacante.ability).filter(Boolean);
        
        habilidades.forEach(habilidad => {

          const habilidadId = `${unidadAtacante.name}_${habilidad.name}`;
          const weapon_id = habilidad.weapon_id;
          const activa = habilidadesActivas.ofensivas[habilidadId] || habilidadesActivas.ofensivas[weapon_id];
          
          if (activa) {
            const { type, target, value, conditions } = habilidad.effect;
            
            let aplicarHabilidad = true;

            console.log("efecto de la habilidad en aplicarHabilidad", habilidad.effect);
            console.log("conditions", conditions);
            if (conditions) {
              Object.entries(conditions).forEach(([key, value]) => {
                switch(key) {
                  case 'profile_name':
                    console.log("is profile_name");
                    console.log("value", value);
                    if (value !== perfil.name) {
                      console.log("no es el perfil", value, perfil.name);
                      aplicarHabilidad = false;
                    }
                    break;
                  case 'attack_type': 
                    if (value !== perfil.type) {
                      aplicarHabilidad = false;
                    }
                    break;
                  case 'opponent_size':
                    const [operador, numero] = value.match(/([<>]=?|=)(\d+)/).slice(1);
                    switch(operador) {
                      case '>=':
                        if (!(unidadOponente.models >= parseInt(numero))) {
                          aplicarHabilidad = false;
                        }
                        break;
                      case '<=':
                        if (!(unidadOponente.models <= parseInt(numero))) {
                          aplicarHabilidad = false;
                        }
                        break;
                      case '>':
                        if (!(unidadOponente.models > parseInt(numero))) {
                          aplicarHabilidad = false;
                        }
                        break;
                      case '<':
                        if (!(unidadOponente.models < parseInt(numero))) {
                          aplicarHabilidad = false;
                        }
                        break;
                      case '=':
                        if (unidadOponente.models !== parseInt(numero)) {
                          aplicarHabilidad = false;
                        }
                        break;
                    }
                      break;
                }
              });
            }

            if (aplicarHabilidad) {
              switch(type) {
                case 'modifier':
                  if (target === 'abilities') {
                    perfilModificado.abilities = perfilModificado.abilities || [];
                    if (!perfilModificado.abilities.includes(value)) {
                      perfilModificado.abilities = [...perfilModificado.abilities, value];
                    }
                  } else {
                    perfilModificado[target] = parseInt(perfilModificado[target]) + 
                      ((['hit', 'wound'].includes(target)) ? -parseInt(value) : parseInt(value));
                  }
                  break;

                case 'dice_override':
                  // Para dice_override, asegurarnos de que el valor es numérico
                  perfilModificado[target] = parseInt(value);
                  
                  // Debug para ver los valores
                  console.log('Aplicando dice_override:', {
                    perfil: perfil.name,
                    target,
                    originalValue: perfil[target],
                    newValue: perfilModificado[target]
                  });
                  break;

                case 'critical':
                  console.log("es critical");
                  perfilModificado.abilities = perfilModificado.abilities || [];
                  if (!perfilModificado.abilities.includes(value)) {
                    console.log("añadiendo critical:", habilidad.effect);
                    perfilModificado.abilities = [...perfilModificado.abilities,  habilidad];
                  }
                  break;
              }
            }
          }
        });
      }
      
      return perfilModificado;
    });

    console.log("perfilesConHabilidades antes de calcular", perfilesConHabilidades);
    return calculateAttacks({
      perfiles_ataque: perfilesConHabilidades.map(perfil => ({
        ...perfil,
        _models_override: perfil.models || unidadAtacante.models
      })),
      miniaturas: unidadAtacante.models,
      guardia: saveModificado,
      salvaguardia: wardModificado
    });
  }, [perfilesModificados, habilidadesActivas, unidadAtacante, unidadOponente]);

  const prevDanoRef = useRef();

  // Notificar al padre cuando se calcule el daño y evitar actualizaciones innecesarias
  useEffect(() => {
    if (danoCalculado?.damage_final !== prevDanoRef.current) {
      prevDanoRef.current = danoCalculado?.damage_final;
      onDanoCalculado?.(danoCalculado?.damage_final);
    }
  }, [danoCalculado?.damage_final, onDanoCalculado]);


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
    }, 1000);
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
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.primary',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {nombreUnidad}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
          width: '100%', // Asegura que el contenedor ocupe todo el ancho
        }}>
          <Tooltip
            title={`Average damage dealt to ${nombreUnidad}`}
            arrow
            placement="top"
            enterDelay={1000}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'secondary.main',
                fontWeight: 'bold',
                lineHeight: 1,
                cursor: 'help'
              }}
            >
              {danoFinal.toFixed(1)}
            </Typography>
          </Tooltip>
          <Tooltip
            title={`Percentage of total wounds dealt (${unidadOponente.models} models × ${unidadOponente.wounds} wounds = ${vidaTotal} total wounds)`}
            arrow
            placement="top"
            enterDelay={1000}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'secondary.main',
                fontWeight: 500,
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
                cursor: 'help'
              }}
            >
              {`${porcentajeVidaTotal.toFixed(0)}%`}
            </Typography>
          </Tooltip>
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
          backgroundColor: 'secondary.dark',
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
              backgroundColor: 'secondary.main',
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
                      ml: 0.5,
                      '& .MuiSwitch-thumb': {
                        backgroundColor: habilidadesActivas.ofensivas[habilidad.id] ? 'primary.main' : '#404040',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: habilidadesActivas.ofensivas[habilidad.id] ? 'rgba(0, 207, 200, 0.3)' : '#242424',
                        opacity: 1
                      }
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
                    ? '#ff9999'
                    : 'divider',
                  '&:hover': habilidad.type === 'toggleable' ? {
                    backgroundColor: 'rgba(255, 77, 130, 0.25)',
                    borderColor: '#ff9999'
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
                      ml: 0.5,
                      '& .MuiSwitch-thumb': {
                        backgroundColor: habilidadesActivas.defensivas[habilidad.id] ? '#ff9999' : '#404040',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: habilidadesActivas.defensivas[habilidad.id] ? 'rgba(255, 77, 130, 0.3)' : '#242424',
                        opacity: 1
                      }
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
        profile: unidadAtacante.ability.profile,
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
        profile: unidadDefensora.ability.profile,
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
      color: 'primary.blue',
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