import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Grid,
  Tooltip,
  Fade,
  Card,
  CardContent,
  LinearProgress,
  Collapse,
  IconButton,
  Switch,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import '../styles/ComparacionEjercitos.css';
import { calculateAttacks } from '../utils/calculator';
import { armies } from '../data/armies';

import CalculateIcon from '@mui/icons-material/Calculate';

// Actualizar la importación
const weapon_abilities = require('../data/weapon_abilities.json');

// Estilos personalizados
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2D3748' : '#f5f5f5',
  },
}));

// DanoBar y PerfilAtaque definidos primero
const DanoBar = React.memo(({ nombreOponente, dano, unidadOponente, maxDanoEjercito, perfilesActivos }) => {
  const danoFinal = typeof dano === 'number' ? dano : (dano?.damage_final || 0);
  const vidaTotal = unidadOponente?.wounds * unidadOponente?.models || 1;
  const porcentajeVidaTotal = Math.min((danoFinal / vidaTotal) * 100, 100);
  const porcentajeDanoRelativo = (danoFinal / maxDanoEjercito) * 100;

  // Simplificar la lógica de habilidad afectando
  const habilidadAfectando = useMemo(() => {
    if (!unidadOponente.ability?.effect?.type === 'modifier' || 
        !unidadOponente.ability?.effect?.condition) {
      return false;
    }

    const { condition } = unidadOponente.ability.effect;
    
    return Object.entries(perfilesActivos).some(([nombrePerfil, activo]) => {
      if (!activo) return false;
      
      const perfil = dano?.perfiles_ataque?.find(p => p.name === nombrePerfil);
      if (!perfil) return false;

      return condition.type === 'enemy_weapon' && 
             perfil[condition.property] === condition.value;
    });
  }, [unidadOponente.ability, perfilesActivos, dano?.perfiles_ataque]);

  return (
    <Card variant="outlined" sx={{ 
      mt: 1, 
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transition: 'none'
    }}>
      <CardContent sx={{ 
        p: 1, 
        '&:last-child': { pb: 1 },
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: porcentajeDanoRelativo === 100 ? '#ffd700' : '#90caf9',
            minWidth: '60px',
            fontWeight: 'bold'
          }}
        >
          {danoFinal.toFixed(1)}
        </Typography>

        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem'
              }}
            >
              damage potential vs
            </Typography>
            <Typography variant="body1" sx={{ color: '#fff' }}>
              {nombreOponente}
            </Typography>
          </Box>

          {habilidadAfectando && (
            <Tooltip 
              title={
                <div>
                  <div>{unidadOponente.ability.name}</div>
                  <div>{unidadOponente.ability.description}</div>
                </div>
              }
              arrow
            >
              <Box sx={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#ffd700',
                    fontSize: '0.75rem'
                  }}
                >
                  {unidadOponente.ability.name}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: '200px'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 0.5,
              textAlign: 'right'
            }}
          >
            kills {porcentajeVidaTotal.toFixed(0)}% of unit ({unidadOponente.models}×{unidadOponente.wounds} wounds)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={porcentajeVidaTotal}
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#ffd700',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

const PerfilAtaque = React.memo(({ 
  perfil, 
  activo, 
  onToggle,
  unidad,
  habilidadUnidadActiva,
  onHabilidadesChange
}) => {
  // Estado para habilidades toggeables
  const [habilidadesToggleables, setHabilidadesToggleables] = useState(
    Object.fromEntries(
      (perfil.abilities || [])
        .filter(ability => weapon_abilities[ability]?.type === 'toggleable')
        .map(ability => [ability, false])
    )
  );

  // Manejador para el toggle del perfil
  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle(perfil.name);
    }
  }, [onToggle, perfil.name]);

  // Mantener los stats base sin modificadores
  const statsBase = useMemo(() => {
    return { ...perfil };
  }, [perfil]);

  // Calcular stats modificados
  const statsModificados = useMemo(() => {
    let stats = { ...perfil };
    
    // Aplicar modificadores de la habilidad de unidad si está activa
    if (unidad.ability?.effect?.type === 'modifier' && habilidadUnidadActiva) {
      const { target, value } = unidad.ability.effect;
      if (target === 'hit' || target === 'wound') {
        stats[target] = parseInt(perfil[target]) + parseInt(value);
      }
    }

    // Aplicar modificadores de habilidades toggeables activas
    Object.entries(habilidadesToggleables).forEach(([abilityId, isActive]) => {
      if (isActive) {
        const ability = weapon_abilities[abilityId];
        if (ability?.effect?.type === 'modifier') {
          const { target, value } = ability.effect;
          stats[target] = parseInt(stats[target]) + parseInt(value);
        }
      }
    });

    return stats;
  }, [perfil, unidad.ability, habilidadUnidadActiva, habilidadesToggleables]);

  // Función para renderizar un stat con su valor potencialmente modificado
  const renderStat = (label, statName, format = value => value) => {
    const baseValue = statsBase[statName];
    const currentValue = statsModificados[statName];
    const isModified = currentValue !== baseValue;

    return (
      <Box key={label} sx={{ 
        backgroundColor: 'rgba(144, 202, 249, 0.1)',
        borderRadius: 1,
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}:
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: isModified ? '#ffd700' : '#90caf9',
            fontWeight: isModified ? 'bold' : 'normal'
          }}
        >
          {format(currentValue)}
        </Typography>
      </Box>
    );
  };

  // Renderizar habilidades con switches para las toggeables
  const renderAbilities = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {perfil.abilities?.map((ability) => {
        const abilityData = weapon_abilities[ability];
        const isToggleable = abilityData?.type === 'toggleable';

        return (
          <Box key={ability} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={abilityData?.description || ''} arrow>
              <Box sx={{
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#ffd700',
                    fontSize: '0.75rem'
                  }}
                >
                  {abilityData?.name || ability}
                </Typography>
              </Box>
            </Tooltip>
            {isToggleable && (
              <Switch
                size="small"
                checked={habilidadesToggleables[ability] || false}
                onChange={() => setHabilidadesToggleables(prev => ({
                  ...prev,
                  [ability]: !prev[ability]
                }))}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Card variant="outlined" sx={{
      mb: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transition: 'none',
      opacity: activo ? 1 : 0.5
    }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: '#ffd700' }}>
              {perfil.name}
            </Typography>
            <Chip 
              label={perfil.type.toUpperCase()} 
              size="small"
              sx={{ 
                backgroundColor: perfil.type === 'melee' ? '#8B0000' : '#00008B',
                color: '#fff'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small"
              onClick={handleToggle}
              sx={{ color: '#90caf9' }}
            >
              <CalculateIcon />
            </IconButton>
            <Switch
              size="small"
              checked={Boolean(activo)}
              onChange={handleToggle}
            />
          </Box>
        </Box>

        {/* Stats con valores modificados */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          mb: 1,
          flexWrap: 'wrap'
        }}>
          {renderStat('A', 'attacks')}
          {renderStat('H', 'hit', value => `${value}+`)}
          {renderStat('W', 'wound', value => `${value}+`)}
          {renderStat('R', 'rend')}
          {renderStat('D', 'damage')}
        </Box>

        {/* Habilidades del perfil */}
        {renderAbilities()}
      </CardContent>
    </Card>
  );
});

function ComparacionEjercitos() {
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [danosSimulados, setDanosSimulados] = useState({});
  const [expandedUnits, setExpandedUnits] = useState({});
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState('');
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState('');
  const [unidadesAtacantesOrdenadas, setUnidadesAtacantesOrdenadas] = useState([]);
  const [unidadesDefensorasOrdenadas, setUnidadesDefensorasOrdenadas] = useState([]);
  const [habilidadHover, setHabilidadHover] = useState(null);

  useEffect(() => {
    if (armies && Object.keys(armies).length > 0) {
      // Intentar recuperar las selecciones previas del localStorage
      const prevAttacker = localStorage.getItem('selectedAttacker');
      const prevDefender = localStorage.getItem('selectedDefender');
      
      // Si existen las selecciones previas y son válidas, usarlas
      setSelectedEjercitoAtacante(
        prevAttacker && armies[prevAttacker] ? prevAttacker : Object.keys(armies)[0]
      );
      setSelectedEjercitoDefensor(
        prevDefender && armies[prevDefender] ? prevDefender : Object.keys(armies)[0]
      );
      setIsLoading(false);
    }
  }, [armies]);

  // Guardar selecciones cuando cambien
  useEffect(() => {
    if (selectedEjercitoAtacante) {
      localStorage.setItem('selectedAttacker', selectedEjercitoAtacante);
    }
  }, [selectedEjercitoAtacante]);

  useEffect(() => {
    if (selectedEjercitoDefensor) {
      localStorage.setItem('selectedDefender', selectedEjercitoDefensor);
    }
  }, [selectedEjercitoDefensor]);

  const calcularDano = async (unidadAtacante, unidadDefensora) => {
    if (!unidadAtacante || !unidadDefensora) {
      return { damage_final: 0, desglose_perfiles: [] };
    }

    try {
      // Filtrar solo los perfiles activos
      const perfilesActivos = unidadAtacante.attack_profiles.filter(perfil => 
        unidadAtacante.perfilesActivos?.[perfil.name] !== false
      );

      const perfilesModificados = perfilesActivos.map(perfil => {
        let perfilModificado = { ...perfil };
        
        // Aplicar modificadores de la habilidad de unidad si está activa
        if (unidadAtacante.ability?.effect?.type === 'modifier' &&
            unidadAtacante.habilidadUnidadActiva) {
          const { target, value } = unidadAtacante.ability.effect;
          // Aplicar el modificador al atributo correcto (hit o wound)
          if (target === 'hit' || target === 'wound') {
            perfilModificado[target] = parseInt(perfil[target]) + parseInt(value);
          }
        }
        
        // Aplicar modificadores defensivos si existen
        if (unidadDefensora.ability?.effect?.type === 'modifier' &&
            unidadDefensora.ability?.effect?.target === 'save') {
          const { condition, value } = unidadDefensora.ability.effect;
          
          if (condition?.type === 'enemy_weapon' && 
              condition.property === 'type' && 
              perfil[condition.property] === condition.value) {
            // Aplicar el modificador de salvación (un valor positivo mejora la salvación)
            const currentSave = parseInt(unidadDefensora.save);
            const modifier = parseInt(value);
            perfilModificado._save_override = currentSave - modifier; // Resta para mejorar la salvación
          }
        }
        
        return perfilModificado;
      });

      const resultado = calculateAttacks({
        perfiles_ataque: perfilesModificados,
        miniaturas: unidadAtacante.models,
        guardia: unidadDefensora.save,
        salvaguardia: unidadDefensora.ward || 0
      });

      return {
        ...resultado,
        perfiles_ataque: perfilesModificados
      };
    } catch (error) {
      console.error('Error calculando daño:', error);
      return { damage_final: 0, desglose_perfiles: [] };
    }
  };

  // const handleMouseEnter = (e, unidad, danos) => {
  //   const rect = e.target.getBoundingClientRect();
  //   setTooltipPosition({
  //     x: rect.right + 10,
  //     y: rect.top
  //   });
  //   setTooltipInfo({
  //     unidad: unidad,
  //     danos: danos
  //   });
  // };

  // const handleMouseLeave = () => {
  //   setTooltipInfo(null);
  // };

  // const calcularPorcentajeDano = (dano, unidadDefensora) => {
  //   if (!unidadDefensora || !unidadDefensora.wounds || !unidadDefensora.models) {
  //     return 0;
  //   }
  //   const vidaTotal = unidadDefensora.wounds * unidadDefensora.models;
  //   return (dano / vidaTotal) * 100;
  // };

  // const toggleUnitExpansion = (unitName) => {
  //   setExpandedUnits(prev => ({
  //     ...prev,
  //     [unitName]: !prev[unitName]
  //   }));
  // };

  const calcularDanoMedioTotal = async (unidad, ejercitoOponente) => {
    if (!unidad || !ejercitoOponente) return 0;
    
    let danoTotal = 0;
    let cantidadOponentes = 0;
    
    // Filtrar solo los perfiles melee para el cálculo inicial
    const perfilesMelee = unidad.attack_profiles.filter(perfil => perfil.type === 'melee');
    
    for (const unidadOponente of Object.values(ejercitoOponente.units)) {
      const resultado = await calcularDano(
        {
          models: unidad.models,
          attack_profiles: perfilesMelee // Usar solo perfiles melee
        },
        unidadOponente
      );
      danoTotal += resultado.damage_final;
      cantidadOponentes++;
    }
    
    return cantidadOponentes > 0 ? danoTotal / cantidadOponentes : 0;
  };

  const ordenarUnidadesPorDano = async (unidades, ejercitoOponente) => {
    const unidadesConDano = await Promise.all(
      Object.entries(unidades).map(async ([nombre, unidad]) => {
        const danoMedio = await calcularDanoMedioTotal(unidad, ejercitoOponente);
        return { nombre, unidad, danoMedio };
      })
    );

    return unidadesConDano
      .sort((a, b) => b.danoMedio - a.danoMedio)
      .map(({ nombre, unidad }) => [nombre, unidad]);
  };

  useEffect(() => {
    const actualizarOrden = async () => {
      if (selectedEjercitoAtacante && selectedEjercitoDefensor) {
        const atacantesOrdenados = await ordenarUnidadesPorDano(
          armies[selectedEjercitoAtacante].units,
          armies[selectedEjercitoDefensor]
        );
        const defensoresOrdenados = await ordenarUnidadesPorDano(
          armies[selectedEjercitoDefensor].units,
          armies[selectedEjercitoAtacante]
        );
        
        setUnidadesAtacantesOrdenadas(atacantesOrdenados);
        setUnidadesDefensorasOrdenadas(defensoresOrdenados);
      }
    };

    actualizarOrden();
  }, [selectedEjercitoAtacante, selectedEjercitoDefensor]);

  const UnidadCard = ({ nombreUnidad, unidad, ejercitoOponente, esAtacante }) => {
    // Inicializar perfilesActivos con todos los perfiles activos por defecto
    const [perfilesActivos, setPerfilesActivos] = useState(
      Object.fromEntries(
        unidad.attack_profiles.map(perfil => [perfil.name, true])
      )
    );
    const [habilidadUnidadActiva, setHabilidadUnidadActiva] = useState(false);
    const [habilidadesPerfiles, setHabilidadesPerfiles] = useState({});
    const [danosContraUnidades, setDanosContraUnidades] = useState({});

    // Manejador para toggle de perfiles
    const togglePerfil = useCallback((nombrePerfil) => {
      setPerfilesActivos(prev => ({
        ...prev,
        [nombrePerfil]: !prev[nombrePerfil]
      }));
    }, []);

    const calcularDanos = useCallback(async () => {
      try {
        const perfilesModificados = unidad.attack_profiles
          .filter(perfil => perfilesActivos[perfil.name])
          .map(perfil => {
            let perfilModificado = { ...perfil };
            
            // Aplicar modificadores de la habilidad de unidad
            if (unidad.ability?.effect?.type === 'modifier' && habilidadUnidadActiva) {
              const { target, value } = unidad.ability.effect;
              if (target === 'hit' || target === 'wound') {
                perfilModificado[target] = parseInt(perfilModificado[target]) + parseInt(value);
              }
            }

            // Aplicar modificadores de las habilidades toggeables del arma
            const habilidadesPerfil = habilidadesPerfiles[perfil.name] || {};
            Object.entries(habilidadesPerfil).forEach(([abilityId, isActive]) => {
              if (isActive) {
                const ability = weapon_abilities[abilityId];
                if (ability?.effect?.type === 'modifier') {
                  const { target, value } = ability.effect;
                  // Asegurarnos de que el valor actual es un número antes de modificarlo
                  const currentValue = parseInt(perfilModificado[target]) || 0;
                  perfilModificado[target] = currentValue + parseInt(value);
                }
              }
            });

            // Mantener las habilidades originales y añadir información sobre cuáles están activas
            perfilModificado._activeAbilities = habilidadesPerfil;

            return perfilModificado;
          });

        const danos = {};
        for (const [nombreOponente, unidadOponente] of Object.entries(ejercitoOponente.units)) {
          const resultado = await calcularDano(
            {
              ...unidad,
              models: unidad.models,
              attack_profiles: perfilesModificados
            },
            unidadOponente
          );
          
          danos[nombreOponente] = {
            ...resultado,
            perfiles_ataque: perfilesModificados
          };
        }
        
        setDanosContraUnidades(danos);
      } catch (error) {
        console.error('Error al calcular daño:', error);
      }
    }, [unidad, ejercitoOponente, perfilesActivos, habilidadUnidadActiva, habilidadesPerfiles]);

    // Manejador para cambios en habilidades
    const handleHabilidadesChange = useCallback((nombrePerfil, habilidades) => {
      setHabilidadesPerfiles(prev => ({
        ...prev,
        [nombrePerfil]: habilidades
      }));
    }, []);

    // Efecto para recalcular cuando cambian las habilidades
    useEffect(() => {
      calcularDanos();
    }, [calcularDanos, habilidadesPerfiles]);

    // Calcular el daño máximo entre todas las unidades
    const maxDano = Math.max(
      ...Object.values(danosContraUnidades).map(dano => 
        typeof dano === 'number' ? dano : (dano?.damage_final || 0)
      )
    );

    // const handleHoverHabilidad = (isHovering, habilidad) => {
    //   setHabilidadHover(isHovering ? habilidad : null);
    // };

    return (
      <Card sx={{ mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#ffd700', mb: 2 }}>
            {nombreUnidad}
          </Typography>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 1, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="caption" color="text.secondary">Size</Typography>
                <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.models}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 1, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="caption" color="text.secondary">Wounds</Typography>
                <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.wounds}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 1, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="caption" color="text.secondary">Save</Typography>
                <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.save}+</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ 
                p: 1, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}>
                <Typography variant="caption" color="text.secondary">Ward</Typography>
                <Typography variant="body1" sx={{ color: '#90caf9' }}>
                  {unidad.ward ? `${unidad.ward}+` : '-'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Nueva sección para la habilidad de unidad */}
          {unidad.ability && (
            <Box 
              sx={{ 
                mb: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Tooltip title={unidad.ability.description} arrow>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: unidad.ability.type === 'fixed' || habilidadUnidadActiva 
                      ? '#ffd700' 
                      : 'rgba(255, 215, 0, 0.7)'
                  }}
                >
                  {unidad.ability.name}
                </Typography>
              </Tooltip>
              
              {unidad.ability.type === 'toggleable' && (
                <Switch
                  size="small"
                  checked={habilidadUnidadActiva}
                  onChange={() => setHabilidadUnidadActiva(!habilidadUnidadActiva)}
                  sx={{ 
                    '& .MuiSwitch-thumb': {
                      backgroundColor: habilidadUnidadActiva ? '#ffd700' : 'rgba(255, 215, 0, 0.5)'
                    }
                  }}
                />
              )}
            </Box>
          )}

          {/* Perfiles de ataque */}
          <Box sx={{ mt: 2 }}>
            {unidad.attack_profiles.map(perfil => (
              <PerfilAtaque
                key={perfil.name}
                perfil={perfil}
                activo={perfilesActivos[perfil.name]}
                onToggle={togglePerfil}
                unidad={unidad}
                habilidadUnidadActiva={habilidadUnidadActiva}
                onHabilidadesChange={handleHabilidadesChange}
              />
            ))}
          </Box>

          {/* Daños ordenados de mayor a menor */}
          {Object.entries(danosContraUnidades)
            .sort(([, danoA], [, danoB]) => {
              const danoFinalA = typeof danoA === 'number' ? danoA : (danoA?.damage_final || 0);
              const danoFinalB = typeof danoB === 'number' ? danoB : (danoB?.damage_final || 0);
              return danoFinalB - danoFinalA;
            })
            .map(([nombreOponente, dano]) => (
              <DanoBar
                key={nombreOponente}
                nombreOponente={nombreOponente}
                dano={dano}
                unidadOponente={ejercitoOponente.units[nombreOponente]}
                maxDanoEjercito={maxDano}
                perfilesActivos={perfilesActivos}
              />
            ))}
        </CardContent>
      </Card>
    );
  };

  // Memoizar StatBox también
  const StatBox = React.memo(({ label, value }) => (
    <Box sx={{ 
      textAlign: 'center', 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      borderRadius: 1, 
      p: 1 
    }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" sx={{ color: '#90caf9' }}>{value}</Typography>
    </Box>
  ));

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>
          Loading status:
          <ul>
            <li>Armies: {armies ? '✅' : '❌'}</li>
            <li>Attacking Army: {selectedEjercitoAtacante ? '✅' : '❌'}</li>
            <li>Defending Army: {selectedEjercitoDefensor ? '✅' : '❌'}</li>
          </ul>
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Attacking Army Column */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Attacking Army</InputLabel>
            <Select
              value={selectedEjercitoAtacante}
              onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
              label="Attacking Army"
            >
              {Object.entries(armies).map(([nombre, ejercito]) => (
                <MenuItem key={nombre} value={nombre}>
                  {ejercito.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

        {/* Defending Army Column */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Defending Army</InputLabel>
            <Select
              value={selectedEjercitoDefensor}
              onChange={(e) => setSelectedEjercitoDefensor(e.target.value)}
              label="Defending Army"
            >
              {Object.entries(armies).map(([nombre, ejercito]) => (
                <MenuItem key={nombre} value={nombre}>
                  {ejercito.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
    </Container>
  );
}

export default ComparacionEjercitos; 