import React, { useState, useEffect } from 'react';
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
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import '../styles/ComparacionEjercitos.css';
import UnidadTooltip from './UnidadTooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GiSwordman } from 'react-icons/gi';  // Para infantería
import { GiHorseHead } from 'react-icons/gi';  // Para caballería
import { GiCannon } from 'react-icons/gi';    // Para artillería
import { GiDragonHead } from 'react-icons/gi';    // Para monstruos
import { GiFootprint, GiSwordsPower, GiAxeSword } from 'react-icons/gi';
import { GiMountedKnight, GiWarhorse } from 'react-icons/gi';
import { GiCatapult, GiTrebuchet, GiSiegeRam } from 'react-icons/gi';
import { GiWyvern, GiHydra, GiMonsterGrasp } from 'react-icons/gi';

// Estilos personalizados
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2D3748' : '#f5f5f5',
  },
}));

function ComparacionEjercitos({ ejercitos }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dañosSimulados, setDañosSimulados] = useState({});
  const [expandedUnits, setExpandedUnits] = useState({});
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState('');
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState('');

  useEffect(() => {
    if (ejercitos && Object.keys(ejercitos).length > 0) {
      const firstArmy = Object.keys(ejercitos)[0];
      setSelectedEjercitoAtacante(firstArmy);
      setSelectedEjercitoDefensor(firstArmy);
      setIsLoading(false);
    }
  }, [ejercitos]);

  const calcularDaño = async (unidadAtacante, unidadDefensora) => {
    if (!unidadAtacante || !unidadDefensora) {
      return { damage_final: 0, desglose_perfiles: [] };
    }

    try {
      const response = await fetch('http://localhost:5001/api/calculate-damage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attacker: {
            models: unidadAtacante.models,
            attack_profiles: unidadAtacante.attack_profiles
          },
          defender: {
            save: unidadDefensora.save,
            ward: unidadDefensora.ward
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al calcular daño:', error);
      return { damage_final: 0, desglose_perfiles: [] };
    }
  };

  const handleMouseEnter = (e, unidad, daños) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setTooltipInfo({
      unidad: unidad,
      daños: daños
    });
  };

  const handleMouseLeave = () => {
    setTooltipInfo(null);
  };

  const calcularPorcentajeDaño = (daño, unidadDefensora) => {
    if (!unidadDefensora || !unidadDefensora.puntos_vida || !unidadDefensora.miniaturas) {
      return 0;
    }
    const vidaTotal = unidadDefensora.puntos_vida * unidadDefensora.miniaturas;
    return (daño / vidaTotal) * 100;
  };

  const toggleUnitExpansion = (unitName) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitName]: !prev[unitName]
    }));
  };

  const renderDaño = (daño) => {
    if (!daño) return '-';
    
    if (typeof daño === 'object' && daño.damage_final !== undefined) {
      return daño.damage_final.toFixed(1);
    }
    
    if (typeof daño === 'number') {
      return daño.toFixed(1);
    }
    
    return '-';
  };

  const calcularDañoMedioTotal = async (unidad, ejercitoOponente) => {
    if (!unidad || !ejercitoOponente) return 0;
    
    let dañoTotal = 0;
    let cantidadOponentes = 0;
    
    // Simulamos el daño contra cada unidad oponente
    for (const unidadOponente of Object.values(ejercitoOponente.units)) {
      const resultado = await calcularDaño(
        {
          models: unidad.models,
          attack_profiles: unidad.attack_profiles
        },
        {
          save: unidadOponente.save,
          ward: unidadOponente.ward
        }
      );
      
      dañoTotal += resultado.damage_final;
      cantidadOponentes++;
    }
    
    return cantidadOponentes > 0 ? dañoTotal / cantidadOponentes : 0;
  };

  const ordenarUnidadesPorDaño = async (unidades, ejercitoOponente) => {
    const unidadesConDaño = await Promise.all(
      Object.entries(unidades).map(async ([nombre, unidad]) => {
        const dañoMedio = await calcularDañoMedioTotal(unidad, ejercitoOponente);
        return { nombre, unidad, dañoMedio };
      })
    );

    return unidadesConDaño
      .sort((a, b) => b.dañoMedio - a.dañoMedio)
      .map(({ nombre, unidad }) => [nombre, unidad]);
  };

  // Estado para almacenar las unidades ordenadas
  const [unidadesAtacantesOrdenadas, setUnidadesAtacantesOrdenadas] = useState([]);
  const [unidadesDefensorasOrdenadas, setUnidadesDefensorasOrdenadas] = useState([]);

  // Efecto para ordenar las unidades cuando cambian los ejércitos
  useEffect(() => {
    const actualizarOrden = async () => {
      if (selectedEjercitoAtacante && selectedEjercitoDefensor) {
        const atacantesOrdenados = await ordenarUnidadesPorDaño(
          ejercitos[selectedEjercitoAtacante].units,
          ejercitos[selectedEjercitoDefensor]
        );
        const defensoresOrdenados = await ordenarUnidadesPorDaño(
          ejercitos[selectedEjercitoDefensor].units,
          ejercitos[selectedEjercitoAtacante]
        );
        
        setUnidadesAtacantesOrdenadas(atacantesOrdenados);
        setUnidadesDefensorasOrdenadas(defensoresOrdenados);
      }
    };

    actualizarOrden();
  }, [selectedEjercitoAtacante, selectedEjercitoDefensor]);

  const UnidadCard = ({ nombreUnidad, unidad, ejercitoOponente, esAtacante }) => {
    const [perfilesActivos, setPerfilesActivos] = useState(
      Object.fromEntries(unidad.attack_profiles.map(p => [p.name, true]))
    );
    const [dañosContraUnidades, setDañosContraUnidades] = useState({});

    const calcularDaños = async (nuevosPerfilesActivos) => {
      try {
        const perfilesActuales = unidad.attack_profiles.filter(
          perfil => nuevosPerfilesActivos[perfil.name]
        );

        const daños = {};
        for (const [nombreOponente, unidadOponente] of Object.entries(ejercitoOponente.units)) {
          const resultado = await calcularDaño(
            {
              models: unidad.models,
              attack_profiles: perfilesActuales
            },
            {
              save: unidadOponente.save,
              ward: unidadOponente.ward
            }
          );
          daños[nombreOponente] = resultado;
        }
        
        setDañosContraUnidades(daños);
      } catch (error) {
        console.error('Error al calcular daño:', error);
      }
    };

    // Calcular daños iniciales
    useEffect(() => {
      calcularDaños(perfilesActivos);
    }, []);

    const togglePerfil = async (nombrePerfil) => {
      const nuevosPerfiles = {
        ...perfilesActivos,
        [nombrePerfil]: !perfilesActivos[nombrePerfil]
      };
      setPerfilesActivos(nuevosPerfiles);
      await calcularDaños(nuevosPerfiles);
    };

    return (
      <Card sx={{ mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ 
            color: '#ffd700',
            mb: 2 
          }}>
            {nombreUnidad}
          </Typography>

          {/* Stats básicos */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 2 }}>
            <Box sx={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Size</Typography>
              <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.models}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Wounds</Typography>
              <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.wounds}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Save</Typography>
              <Typography variant="body1" sx={{ color: '#90caf9' }}>{unidad.save}+</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">Ward</Typography>
              <Typography variant="body1" sx={{ color: '#90caf9' }}>
                {unidad.ward ? `${unidad.ward}+` : '-'}
              </Typography>
            </Box>
          </Box>

          {/* Damage against each unit */}
          <Box sx={{ mb: 4 }}>
            {Object.entries(ejercitoOponente?.units || {}).map(([nombreOponente, unidadOponente]) => {
              const daño = dañosContraUnidades[nombreOponente]?.damage_final || 0;
              const vidaTotal = unidadOponente.wounds * unidadOponente.models;
              const porcentaje = (daño / vidaTotal) * 100;

              return (
                <Box key={nombreOponente} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                    <Typography variant="h4" sx={{ color: '#90caf9', minWidth: '100px' }}>
                      {daño.toFixed(1)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
                      vs {nombreOponente}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, porcentaje)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: porcentaje > 75 ? '#ff6b6b' : 
                                porcentaje > 50 ? '#ffd93d' : 
                                porcentaje > 25 ? '#6dd5a7' : '#bdc3c7',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                    {porcentaje.toFixed(0)}% of total wounds
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Attack profiles */}
          <Box sx={{ mt: 3 }}>
            {unidad.attack_profiles.map((perfil) => (
              <Box key={perfil.name} sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                mb: 1,
                p: 1.5,
                opacity: perfilesActivos[perfil.name] ? 1 : 0.5
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ color: '#ffd700', fontSize: '1rem', fontWeight: 500 }}>
                    {perfil.name}
                  </Typography>
                  <Switch
                    size="small"
                    checked={perfilesActivos[perfil.name]}
                    onChange={() => togglePerfil(perfil.name)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ffd700'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#ffd700'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">A</Typography>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>{perfil.attacks}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">HIT</Typography>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>{perfil.hit}+</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">W</Typography>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>{perfil.wound}+</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">R</Typography>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>{perfil.rend}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">D</Typography>
                    <Typography variant="body2" sx={{ color: '#90caf9' }}>{perfil.damage}</Typography>
                  </Box>
                </Box>

                {perfil.crit_type && perfil.crit_type !== 'none' && (
                  <Typography variant="caption" sx={{ color: '#ff9800', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                    CRIT ({perfil.crit_type.toUpperCase()})
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!ejercitos || !selectedEjercitoAtacante || !selectedEjercitoDefensor) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>
          Loading status:
          <ul>
            <li>Armies: {ejercitos ? '✅' : '❌'}</li>
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
        <Grid item xs={12} md={6} sx={{ 
          borderRight: { md: '1px solid rgba(255, 255, 255, 0.1)' },
          bgcolor: 'rgba(255, 215, 0, 0.02)',
          pr: { md: 4 }
        }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Attacking Army</InputLabel>
            <Select
              value={selectedEjercitoAtacante}
              onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
              label="Attacking Army"
            >
              {Object.entries(ejercitos).map(([nombre, ejercito]) => (
                <MenuItem key={nombre} value={nombre}>
                  {ejercito.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Usar las unidades ordenadas del estado */}
          {unidadesAtacantesOrdenadas.map(([nombre, unidad]) => (
            <UnidadCard
              key={nombre}
              nombreUnidad={nombre}
              unidad={unidad}
              ejercitoOponente={ejercitos[selectedEjercitoDefensor]}
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
              {Object.entries(ejercitos).map(([nombre, ejercito]) => (
                <MenuItem key={nombre} value={nombre}>
                  {ejercito.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Usar las unidades ordenadas del estado */}
          {unidadesDefensorasOrdenadas.map(([nombre, unidad]) => (
            <UnidadCard
              key={nombre}
              nombreUnidad={nombre}
              unidad={unidad}
              ejercitoOponente={ejercitos[selectedEjercitoAtacante]}
              esAtacante={false}
            />
          ))}
        </Grid>
      </Grid>
    </Container>
  );
}

export default ComparacionEjercitos; 