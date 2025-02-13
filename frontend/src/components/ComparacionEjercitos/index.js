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
  FormControlLabel,
  Stack,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import { armies } from '../../data/armies';
import { calculateAttacks, calcularMortalesConDados, calcularValorDado } from '../../utils/calculator';
import { weapon_abilities } from '../../data/weapon_abilities';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import CoffeeIcon from '@mui/icons-material/Coffee';


function ComparacionEjercitos() {
  const navigate = useNavigate();
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState(() => 
    localStorage.getItem('selectedAttacker') || Object.keys(armies)[0]
  );
  
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState(() =>
    localStorage.getItem('selectedDefender') || Object.keys(armies)[1]
  );

  const [vistaUnaColumna, setVistaUnaColumna] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Configuración personalizada para la animación del menú
  const MENU_PROPS = {
    PaperProps: {
      sx: {
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
        mt: 1, // margin top
        '& .MuiMenuItem-root': {
          transition: 'none',
        }
      }
    },
    TransitionProps: {
      timeout: window.innerWidth >= 800 ? 200 : 0, // Instantáneo en móvil, 200ms en desktop
      easing: window.innerWidth >= 800 ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'linear' // Curva solo en desktop
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Sidebar fijo para desktop */}
      {!isMobile && (
        <Box sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '240px',
          backgroundColor: 'background.paper',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 2
        }}>
          {/* Contenido principal del sidebar */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                onClick={() => navigate('/')}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#00CED1' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">
                PreBattle.net
              </Typography>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Attacking Army</InputLabel>
              <Select
                value={selectedEjercitoAtacante}
                onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
                label="Attacking Army"
                MenuProps={MENU_PROPS}
              >
                {Object.keys(armies).map((armyName) => (
                  <MenuItem key={armyName} value={armyName}>
                    {armyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Defending Army</InputLabel>
              <Select
                value={selectedEjercitoDefensor}
                onChange={(e) => setSelectedEjercitoDefensor(e.target.value)}
                label="Defending Army"
                MenuProps={MENU_PROPS}
              >
                {Object.keys(armies).map((armyName) => (
                  <MenuItem key={armyName} value={armyName}>
                    {armyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Footer del sidebar */}
          <Box sx={{ 
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center' 
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                v0.1.0 Beta
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => window.open('https://www.buymeacoffee.com/fafimba', '_blank')}
                  sx={{ 
                    color: '#FFDD00',
                    '&:hover': { color: '#FFE44D' }
                  }}
                >
                  <CoffeeIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {/* Aquí puedes abrir un diálogo de información */}}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: '#00CED1' }
                  }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Botón de menú para móvil */}
      {isMobile && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          padding: 1,
        }}>
          <IconButton 
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: '#00CED1' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer para móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: '320px',
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
            p: 2,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ color: 'text.secondary' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              PreBattle.net
            </Typography>
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Attacking Army</InputLabel>
            <Select
              labelId="attacking-army-label"
              value={selectedEjercitoAtacante}
              onChange={(e) => setSelectedEjercitoAtacante(e.target.value)}
              label="Attacking Army"
              MenuProps={MENU_PROPS}
            >
              {Object.keys(armies).map((armyName) => (
                <MenuItem 
                  key={armyName} 
                  value={armyName}
                  sx={{
                    '@media (min-width: 800px)': {
                      '&:hover': {
                        backgroundColor: '#2a2a2a'
                      }
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#333333',
                      '@media (min-width: 800px)': {
                        '&:hover': {
                          backgroundColor: '#383838'
                        }
                      }
                    }
                  }}
                >
                  {armyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Defending Army</InputLabel>
            <Select
              labelId="defending-army-label"
              value={selectedEjercitoDefensor}
              onChange={(e) => setSelectedEjercitoDefensor(e.target.value)}
              label="Defending Army"
              MenuProps={MENU_PROPS}
            >
              {Object.keys(armies).map((armyName) => (
                <MenuItem 
                  key={armyName} 
                  value={armyName}
                  sx={{
                    '@media (min-width: 800px)': {
                      '&:hover': {
                        backgroundColor: '#2a2a2a'
                      }
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#333333',
                      '@media (min-width: 800px)': {
                        '&:hover': {
                          backgroundColor: '#383838'
                        }
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

        {/* Footer del drawer */}
        <Box sx={{ 
          pt: 2,
          mt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center' 
          }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              v0.1.0 Beta
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => window.open('https://www.buymeacoffee.com/fafimba', '_blank')}
                sx={{ 
                  color: '#FFDD00',
                  '&:hover': { color: '#FFE44D' }
                }}
              >
                <CoffeeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {/* Aquí puedes abrir un diálogo de información */}}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: '#00CED1' }
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Ajustar el espaciador para el nuevo header más pequeño en móvil */}
      {isMobile && <Box sx={{ height: '56px' }} />}

      {/* Contenido principal */}
      <Box sx={{ 
        maxWidth: '1800px',
        width: '100%',
        margin: '0 auto',
        pl: { xs: 1, sm: '260px' },
        pr: { xs: 1, sm: 4 },
        pt: { xs: 1, sm: 4 },
        pb: 4
      }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={{ xs: 1, md: 4 }}
          alignItems="flex-start"
          sx={{ width: '100%' }}
        >
          <Box sx={{ 
            flex: 1,
            width: '100%',
            maxWidth: { md: 'calc(50% - 16px)' }
          }}>
            {unidadesAtacantesOrdenadas.map(([nombreUnidad, unidad]) => (
              <Box key={nombreUnidad} sx={{ mb: { xs: 1, md: 2 } }}>
                <UnidadCard
                  nombreUnidad={nombreUnidad}
                  unidad={unidad}
                  ejercitoOponente={armies[selectedEjercitoDefensor]}
                  ejercitoAtacante={armies[selectedEjercitoAtacante]}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ 
            flex: 1,
            width: '100%',
            maxWidth: { md: 'calc(50% - 16px)' }
          }}>
            {unidadesDefensorasOrdenadas.map(([nombreUnidad, unidad]) => (
              <Box key={nombreUnidad} sx={{ mb: { xs: 1, md: 2 } }}>
                <UnidadCard
                  nombreUnidad={nombreUnidad}
                  unidad={unidad}
                  ejercitoOponente={armies[selectedEjercitoAtacante]}
                  ejercitoAtacante={armies[selectedEjercitoDefensor]}
                />
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente,ejercitoAtacante }) => {
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
  const actualizarDano = useCallback((nombreUnidadOponente, dano) => {
    if (dano === undefined || dano === null) return;
    
    setDanosPorUnidad(prev => ({
      ...prev,
      [nombreUnidadOponente]: parseFloat(dano)
    }));
  }, []);

  // Calcular el daño medio cuando cambien los daños
  const danoMedio = useMemo(() => {
    const danos = Object.values(danosPorUnidad);
    if (danos.length === 0) return '0.0';
    
    const suma = danos.reduce((sum, dano) => sum + dano, 0);
    return (suma / danos.length).toFixed(1);
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
        mb: 1.5,
        '@media (min-width: 800px)': {
          '&:hover': {
            borderColor: 'primary.main',
            '&:after': {
              opacity: 0.3,
            }
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
            background: `linear-gradient(90deg, ${ejercitoAtacante.color}2A 0%, transparent 100%)`,
            py: 1.5,
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
              variant="h6"
              sx={{ 
                color: 'text.primary',
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              {nombreUnidad}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            ml: 'auto'
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
                  color: danoMedio >= 8 ? '#ff4d4d' : danoMedio >= 5 ? 'primary.main' : 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  opacity: 1,
                  minWidth: '60px',
                  textAlign: 'right',
                  cursor: 'help',
                  textShadow: '0 0 10px rgba(0, 207, 200, 0.4)'
                }}>
                  {danoMedio}
                </Typography>
              </Tooltip>
            )}
            <Box sx={{ 
              color: 'text.secondary',
              opacity: 1,
              fontSize: '0.8rem',
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
              flexWrap: 'wrap',
              gap: 1,
              width: '100%',
              pb: 0,
              '& > *': {
                flex: 1,
                maxWidth:  window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(50% - 4px)', // forzar máximo de 50%
                minWidth: window.innerWidth < 800 ? 'calc(50% - 4px)' : 'calc(30% - 4px)' // Ajuste responsivo del ancho mínimo
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
        '@media (min-width: 800px)': {
          '&:hover': {
            backgroundColor: activo ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
            borderColor: 'rgba(255,255,255,0.1)'
          }
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
    if (!unidad?.abilities) return [];
    return unidad.abilities.filter(Boolean);
  }, [unidad]);

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


  // Convertir perfilesActivos (objeto) a un array de perfiles con comprobación de seguridad
  const perfilesParaCalcular = useMemo(() => {
    if (!unidadAtacante?.attack_profiles) return [];
    
    return unidadAtacante.attack_profiles.filter(perfil => 
      perfilesActivos[perfil.name]
    );
  }, [perfilesActivos, unidadAtacante?.attack_profiles]);

  // Estado para controlar la visibilidad de cada tooltip individualmente
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  // Preparar arrays de habilidades, filtrando por categoría y condiciones
  const habilidadesAtacante = [].concat(unidadAtacante.abilities)
    .filter(Boolean)
    .filter(hab => hab.category === 'offensive')
    .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect.conditions).every(([key, value]) => {
      switch(key) {
        case 'attack_type':
          return perfilesParaCalcular.some(perfil => perfil.type === value);
        case 'target_tag':
          return unidadOponente.tags?.includes(value);
        case 'target_tag_exclude':
          return !unidadOponente.tags?.includes(value);
        case 'profile_name':
          return perfilesParaCalcular.some(perfil => perfil.name === value);
        case 'opponent_size':
          const { opponent_size } = hab.effect.conditions;
          const comparacion = opponent_size.substring(0,2);
          const valor = parseInt(opponent_size.substring(2));
          switch(comparacion) {
            case '>=':
              return unidadOponente.models >= valor;
            case '<=':
              return unidadOponente.models <= valor;
            default:
              return true;
          }
        default:
          return true;
      }
    }))
    .map(hab => ({
      ...hab,
      id: `${unidadAtacante.name}_${hab.name}`
    }));

    // Habilidades ofensivas de perfiles filtradas por condiciones
  const habilidadesPerfiles = [].concat(perfilesParaCalcular)
    .flatMap(perfil => {
      // Obtener las habilidades del arma desde el array de abilities del perfil
      const weaponAbilities = (perfil.abilities || [])
        .filter(Boolean)
        .map(abilityKey => {
          // Buscar la habilidad en weapons_abilities usando la key
          const weaponAbility = weapon_abilities[abilityKey];
          if (weaponAbility) {
            return {
              ...weaponAbility,
              id: `${perfil.name}_${weaponAbility.name}`,
              profile: perfil.name,
              description:  perfil.name + ": " + weaponAbility.description
            };
          }
          return null;
        })
        
        .filter(Boolean)
        .filter(hab => hab.effect != null)
        .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect?.conditions).every(([key, value]) => {
          switch(key) {
            case 'target_tag':
              return unidadOponente.tags?.includes(value);
            default:
              return true;
          }
        }));

      return weaponAbilities;
    });
    // Habilidades defensivas filtradas por condiciones
  const habilidadesOponente = [].concat(unidadOponente.abilities)
    .filter(Boolean)
    .filter(hab => hab.category === 'defensive')
    .filter(hab => !hab.effect?.conditions || Object.entries(hab.effect.conditions).every(([key, value]) => {
      switch(key) {
        case 'attack_type':
          return perfilesParaCalcular.some(perfil => perfil.type === value);
        default:
          return true;
      }
    }))
    .map(hab => ({
      ...hab,
      id: `${unidadOponente.name}_${hab.name}`
    }));

  // Habilidades ofensivas y defensivas
  const habilidades = {
    ofensivas: [
      // Habilidades de unidad ofensivas
      ...habilidadesAtacante,
      ...habilidadesPerfiles
    ],
    // Habilidades defensivas de unidad oponente
    defensivas: [...habilidadesOponente]
  };

  const { habilidadesActivas, toggleHabilidadOfensiva, toggleHabilidadDefensiva } = useHabilidades(unidadAtacante, unidadOponente);

  // Recalcular el daño cuando cambien las habilidades
  const danoCalculado = useMemo(() => {
    let saveModificado = unidadOponente.save;
    let wardModificado = unidadOponente.ward;
    let woundsModificado = unidadOponente.wounds;
    let mortalesExtra = 0;
    
    // Generar una copia de cada perfil, asignando los efectos activados sin sobrescribir las habilidades originales.
    let perfilesModificados = perfilesParaCalcular.map(perfil => ({
      ...perfil
    }));

    // Luego se recorre para modificar los perfiles según las habilidades activadas:
    perfilesModificados = perfilesModificados.map(perfil => {
      const perfilModificado = { ...perfil };
      let activatedEffects = [];
      // Por cada habilidad ofensiva disponible en la unidad (basada en el objeto de habilidades)
      habilidades.ofensivas.filter(h => h.profile).forEach(habilidad => {
        const habilidadId = `${perfil.name}_${habilidad.name}`;
        const activa = habilidadesActivas.ofensivas[habilidadId];

        if (!activa) return;
        
        activatedEffects.push(habilidad.effect);

      });

      // Asignar la propiedad "abilityEffects" en la copia del perfil
      perfilModificado.abilityEffects = activatedEffects;
      return perfilModificado;
    });

    // Aplicar habilidades ofensivas 
    habilidades.ofensivas.filter(h => !h.profile).forEach(habilidad => {
      const habilidadId = `${unidadAtacante.name}_${habilidad.name}`;
      const activa = habilidadesActivas.ofensivas[habilidadId];
      if (habilidad.type === 'fixed' || activa) {

        // Si la habilidad tiene condiciones, y no se cumple, se salta
        if (habilidad.effect?.conditions) {

          switch(habilidad.effect.conditions) {
            case 'opponent_size':
              const { opponent_size } = habilidad.effect.conditions;
              const comparacion = opponent_size.substring(0,2);
              const valor = parseInt(opponent_size.substring(2));
              
            switch(comparacion) {
              case '>=':
                if (unidadOponente.models < valor) return;
                break;
              case '<=':
                if (unidadOponente.models > valor) return;
                break;
              }
              break;  
            default:
              break;
          }
        }

        const { type,target, value } = habilidad.effect;
        if(type === 'extra_mortal') {
          let cantidad = 0;
          if (typeof habilidad.effect.dice_amount === 'string') 
            {
            switch(habilidad.effect.dice_amount) {
              case 'unit_size':
                cantidad = unidadAtacante.models;
                break;
              case 'target_size':
                cantidad = unidadOponente.models;
                break;
              case 'target_wounds':
                cantidad = woundsModificado;
                break;
              default:
                cantidad = parseInt(habilidad.effect.dice_amount);
            }
          }else{
            cantidad = parseInt(habilidad.effect.dice_amount);
          }
          let tipoDado = habilidad.effect.dice_type;
          let dificultad;
          switch(typeof habilidad.effect.difficulty) {
            case 'string':
              if (habilidad.effect.difficulty === 'target_wounds') {
                dificultad = woundsModificado;
              }
              break;
            default:
              dificultad = parseInt(habilidad.effect.difficulty);
          }
          let salvaguardia = wardModificado;

          let damage =1;
          switch(habilidad.effect.damage) {
            case 'slain':
              damage = woundsModificado;
              break;
            default:
               damage = calcularValorDado(habilidad.effect.damage || 1);
          }
        
          mortalesExtra += calcularMortalesConDados({ 
            cantidad, 
            tipoDado, 
            dificultad, 
            salvaguardia: habilidad.effect.models_slain ? 0 : salvaguardia, 
            multiplicador: damage
          });
        } else if(type === 'add_weapon_ability') {
          perfilesModificados = perfilesModificados.map(perfil => {
            const perfilMod = { ...perfil };
            let activatedEffects = perfilMod.abilityEffects || [];

            if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
            
            activatedEffects.push(weapon_abilities[habilidad.effect.ability].effect);
            perfilMod.abilityEffects = activatedEffects;
            return perfilMod;
          });
        } else if(type === 'double_fight') {
          perfilesModificados = [
            ...perfilesModificados,
            ...perfilesModificados.filter(perfil => perfil.type === "melee")
          ];
        } else if (type === 'modifier') {
          perfilesModificados = perfilesModificados.map(perfil => {
            const perfilMod = { ...perfil };
            if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
            if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
      
              // Si es un modificador, se suma o resta el valor dependiendo de si es un modificador de daño o de golpe
              perfilMod[target] = parseInt(perfilMod[target]) + (target === 'hit' || target === 'wound' ? -parseInt(value) : parseInt(value));
            return perfilMod;
          });
        }else if (type === 'dice_override') {
          perfilesModificados = perfilesModificados.map(perfil => {
            const perfilMod = { ...perfil };
            if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
            if(habilidad.effect.conditions?.profile_name && perfilMod.name != habilidad.effect.conditions.profile_name) return perfilMod;
            perfilMod[target] = parseInt(value);
            return perfilMod;
          });
        } else if (type === 'critical') {
          perfilesModificados = perfilesModificados.map(perfil => {
            const perfilMod = {...perfil};

            if(perfilMod.name != habilidad.effect.profile_name) return perfilMod;

            if (!perfilMod.abilities) {
              perfilMod.abilities = [];
            }
            let abilitiesMod = perfilMod.abilities.map(ability => {
             const abilityMod = {...ability,};
             return abilityMod;
            });

            switch(habilidad.effect.action) {
              case 'mortal_wound':
                abilitiesMod.push('mortal_critical');
                break;
              case 'auto_wound':
                abilitiesMod.push('auto_wound_critical');
                break;
              case 'extra_hit':
                abilitiesMod.push('double_hit_critical');
                break;
            }
            perfilMod.abilities = abilitiesMod;
            return perfilMod;
          });
        }
      }
    });

    // Aplicar habilidades defensivas
    habilidades.defensivas.forEach(habilidad => {
          const habilidadId = `${unidadOponente.name}_${habilidad.name}`;
          // Solo aplicar si cumple las condiciones y es fixed o está activa
          const debeAplicarse = (habilidad.type === 'fixed' || habilidadesActivas.defensivas[habilidadId]);
            if (debeAplicarse && habilidad.effect) {
              const { type, target, value, affects } = habilidad.effect;
              if (type === 'modifier') {
                switch (target) {
                  case 'save':
                    saveModificado = saveModificado - parseInt(value);
                    break;
                  case 'ward':
                    if (!wardModificado || parseInt(value) < wardModificado) {
                      wardModificado = parseInt(value);
                    }
                    break;
                  case 'wounds':
                    woundsModificado = woundsModificado + parseInt(value);
                    break;
                  default:
                    break;
                }

                if (affects === 'enemy_attributes' || affects === 'enemy_atributes') 
                  {
                      perfilesModificados = perfilesModificados.map(perfil => {
                        let perfilMod = {...perfil};
                        if(habilidad.effect.conditions?.attack_type && perfilMod.type != habilidad.effect.conditions.attack_type) return perfilMod;
                       
                        if(habilidad.effect.type === 'modifier') {
                          perfilMod[target] = parseInt(perfilMod[target]) + parseInt(value);
                        } else if(habilidad.effect.type === 'ignore_modifier') {
                          perfilMod[target] = 0;
                        }
                        return perfilMod;
                      });
                  }
              }
            }
    });
    console.log("perfilesModificados precalculo", perfilesModificados);
    const resultadoAtaquesPerfiles = calculateAttacks({
      perfiles_ataque: perfilesModificados.map(perfil => ({
        ...perfil,
        models_override: perfil.models || unidadAtacante.models
      })),
      guardia: saveModificado,
      salvaguardia: wardModificado,
      enemy_wounds: woundsModificado,
      enemigo: unidadOponente
    });

    return {
      ...resultadoAtaquesPerfiles,
      mortales: mortalesExtra,
      damage_final: resultadoAtaquesPerfiles.damage_final + mortalesExtra
    };
  }, [habilidades,perfilesParaCalcular, unidadAtacante, unidadOponente]);

  const prevDanoRef = useRef();

  // Notificar al padre cuando se calcule el daño y evitar actualizaciones innecesarias
  useEffect(() => {
    const danoTotal = (danoCalculado?.damage_final || 0);
    if (danoTotal !== prevDanoRef.current) {
      prevDanoRef.current = danoTotal;
      onDanoCalculado?.(danoTotal);
    }
  }, [danoCalculado?.damage_final , onDanoCalculado]);

  // Actualizar los manejadores de eventos
  const handleToggleOfensiva = (habilidadId) => {
    toggleHabilidadOfensiva(habilidadId);
  };

  const handleToggleDefensiva = (habilidadId) => {
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
  const vidaTotal = danoCalculado.enemy_wounds * unidadOponente.models;
  const porcentajeVidaTotal = Math.min((danoFinal / vidaTotal) * 100, 100);

  return (
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      gap: 1,
      p: 1.5, // Añadir padding interno
      backgroundColor: 'rgba(255,255,255,0.03)', // Fondo similar a tags/perfiles
      borderRadius: '4px', // Bordes redondeados
      border: '1px solid rgba(255, 255, 255, 0.05)', // Borde sutil
      boxShadow: `
        0 4px 6px -1px rgba(255, 255, 255, 0.03),
        0 2px 4px -1px rgba(255, 255, 255, 0.02), 
        inset 0 1px 1px rgba(255, 255, 255, 0.02)
      `, // Sombra exterior e interior
      position: 'relative',
      '&:hover': {
        boxShadow: `
          0 6px 8px -1px rgba(255, 255, 255, 0.04),
          0 3px 6px -1px rgba(255, 255, 255, 0.03),
          inset 0 1px 1px rgba(255, 255, 255, 0.03)
        `,
        transform: 'translateY(-1px)', // Efecto de elevación sutil al hover
        transition: 'all 0.2s ease'
      }
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
            {unidadOponente.name}
          </Typography>
          <Box sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {unidadOponente.models}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {unidadOponente.wounds}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShieldIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {unidadOponente.save}+
                </Typography>
              </Box>

              {unidadOponente.ward && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {unidadOponente.ward}+
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
          width: '100%', // Asegura que el contenedor ocupe todo el ancho
        }}>
          <Tooltip
            title={`Average damage dealt to ${unidadOponente.name}`}
            arrow
            placement="top"
            enterDelay={1000}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: danoFinal >= 10 ? '#ff4d4d' : danoFinal >= 8 ? 'primary.main' : 'text.blue',
                fontWeight: 'bold',
                lineHeight: 1,
                cursor: 'help',
                textShadow: danoFinal >= 8 ? '0 0 10px rgba(0, 207, 200, 0.4)' : 'none'
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
                color: porcentajeVidaTotal >= 100 ? 'primary.main' : 'secondary.main',
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

        <Box     sx={{
        position: 'relative',
        width: `${Math.min(100, unidadOponente.models * unidadOponente.wounds * 5.6)}%`,
        height: '8px',
        maskImage: `
          repeating-linear-gradient(
            to right,
            transparent 0px,
            transparent 3px,
            white 0,
            white ${100 / (unidadOponente.models)}%
          )`,
        backgroundRepeat: 'no-repeat',
      }}
        >
                <Box     sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              maskImage: `
                repeating-linear-gradient(
                  to right,
                 transparent 0px,
                  transparent 1.5px,
                  white 0,
                  white ${100 / (unidadOponente.models * unidadOponente.wounds)}%
                )`,
              backgroundRepeat: 'no-repeat',
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'secondary.dark',
                }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: `${porcentajeVidaTotal}%`,
                    height: '100%',
                  backgroundColor: 'primary.main',
                  transition: 'width 0.5s ease'
                  }}
                />
          </Box>
        </Box>

       

     
      </Box>
      {/* </Box> */}

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
                enterDelay={1}
                 open={ activeTooltip === habilidad.id }
                onClose={() => setActiveTooltip(null)}
                disableHoverListener
                placement="top"
                sx={{
                  backgroundColor: 'custom.tooltipBackground',
                }}
              >
   
              <Box 
                onMouseEnter={(e) => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
                onMouseLeave={(e) => window.innerWidth >= 800 && handleMouseLeave()}

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
                  '@media (min-width: 800px)': {
                    '&:hover': habilidad.type === 'toggleable' ? {
                      backgroundColor: 'rgba(0, 207, 200, 0.25)',
                      borderColor: 'primary.light'
                    } : {}
                  }
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
                      ml: 0.1, // Margen izquierdo de 0.5 unidades para el Switch
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
                onMouseEnter={(e) => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
                onMouseLeave={(e) => window.innerWidth >= 800 && handleMouseLeave()}
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
                  '@media (min-width: 800px)': {
                    '&:hover': habilidad.type === 'toggleable' ? {
                      backgroundColor: 'rgba(255, 77, 130, 0.25)',
                      borderColor: '#ff9999'
                    } : {}
                  }
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
    
    // Procesar habilidades de unidad atacante
    if (unidadAtacante?.abilities && Array.isArray(unidadAtacante.abilities)) {
      unidadAtacante.abilities.forEach(ability => {
        if (ability.category === 'offensive') {
          ofensivas.push({
            id: `${unidadAtacante.name}_${ability.name}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            effect: ability.effect,
            profile: ability.profile,
            source: 'unit'
          });
        }
      });
    }
    
    // Procesar habilidades de unidad defensora
    if (unidadDefensora?.abilities && Array.isArray(unidadDefensora.abilities)) {
      unidadDefensora.abilities.forEach(ability => {
        if (ability.category === 'defensive') {
          defensivas.push({
            id: `${unidadDefensora.name}_${ability.name}`,
            name: ability.name,
            description: ability.description,
            type: ability.type,
            effect: ability.effect,
            profile: ability.profile,
            source: 'unit'
          });
        }
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
  <Typography
    component="span"
    sx={{
      fontSize: '0.75rem',
      px: 1.5,
      py: 0.5,
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'text.secondary',
      textTransform: 'lowercase',
      letterSpacing: '0.02em',
      fontWeight: 400,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      }
    }}
  >
    {label}
  </Typography>
);

export default ComparacionEjercitos; 