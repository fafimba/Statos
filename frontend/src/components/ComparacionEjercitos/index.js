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
  useTheme,
  Chip,
  ToggleButton
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
import { RiSwordFill } from "react-icons/ri";
import { LuCrosshair } from "react-icons/lu";
import { VidaBar } from '../DanoBar/index';

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

  const [activeTooltip, setActiveTooltip] = useState(null);

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

const UnidadCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, ejercitoAtacante }) => {
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
    <Box sx={{ mb: 3 }}>
      {/* Header de la unidad */}
      <Box
        onClick={() => setExpandido(!expandido)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          background: theme => `linear-gradient(90deg, 
            ${ejercitoAtacante.color}15 0%, 
            rgba(0,0,0,0.2) 100%
          )`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: theme => ejercitoAtacante.color,
            opacity: 0.5,
            borderRadius: '4px 0 0 4px'
          },
          borderRadius: '8px',
          cursor: 'pointer',
          '&:hover': {
            background: theme => `linear-gradient(90deg, 
              ${ejercitoAtacante.color}20 0%, 
              rgba(0,0,0,0.25) 100%
            )`,
            '&::before': {
              opacity: 0.7
            }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2
        }}>
          {/* Columna izquierda: nombre y atributos */}
          <Box sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
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

          {/* Columna derecha: daño y flecha */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            marginLeft: 'auto',  // Forzar a la derecha
            minWidth: 'fit-content'  // Evitar que se comprima
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
      </Box>

      {expandido && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          mt: 1
        }}>
          {/* Stats y tags en una línea */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 0.5,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {/* Tags */}
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5,
              flexWrap: 'wrap',
              flex: 1
            }}>
              {unidad.tags?.map((tag) => (
                <UnitTag key={tag} label={tag} />
              ))}
            </Box>
            {/* Stats defensivos */}
            <Box sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.models}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.wounds}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ShieldIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {unidad.save}+
                </Typography>
              </Box>
              {unidad.ward && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SecurityIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {unidad.ward}+
                  </Typography>
                </Box>
              )}
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
              maxWidth:  window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)', // forzar máximo de 50%
              minWidth: window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)' // Ajuste responsivo del ancho mínimo
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
      )}
    </Box>
  );
});

// Componente para los perfiles de ataque
const PerfilAtaque = ({ perfil, activo, habilidadesPerfil = {}, onToggleHabilidad }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    py: 0.75,
    px: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': {
      borderBottom: 'none'
    }
  }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: 1,
      flex: 1,
      minWidth: 0
    }}>
      {perfil.type === 'melee' ? (
        <RiSwordFill 
          style={{
            fontSize: '1rem',
            color: '#ff9999',
            opacity: 0.7,
            transform: 'scaleX(-1)'  // Flip horizontal
          }}
        />
      ) : (
        <LuCrosshair
          style={{
            fontSize: '1rem',
            color: '#99ccff',
            opacity: 0.7
          }}
        />
      )}
      <Typography sx={{
        color: 'text.primary',
        fontSize: { xs: '0.8rem', sm: '0.85rem' },
        fontWeight: 400,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {perfil.name}
      </Typography>
    </Box>

    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: { xs: 1.5, sm: 2 },
      ml: 1,
      flexShrink: 0
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 }
      }}>
        {/* Stats */}
        <Typography sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          A{perfil.attacks}
        </Typography>
        <Typography sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          H{perfil.hit}+
        </Typography>
        <Typography sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          W{perfil.wound}+
        </Typography>
        <Typography sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          R{perfil.rend === 0 ? '-' : perfil.rend}
        </Typography>
        <Typography sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.75rem', sm: '0.8rem' },
          opacity: 0.8,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          D{perfil.damage}
        </Typography>
      </Box>

      <Switch
        checked={activo}
        onChange={() => onToggleHabilidad(perfil.name, 'active', !activo)}
        onClick={(e) => e.stopPropagation()}
        size="small"
        sx={{
          transform: 'scale(0.7)',
          ml: -0.5,
          '& .MuiSwitch-thumb': {
            backgroundColor: activo ? 'primary.main' : '#404040'
          },
          '& .MuiSwitch-track': {
            backgroundColor: activo ? 'rgba(0, 207, 200, 0.3)' : '#242424',
            opacity: 1
          }
        }}
      />
    </Box>
  </Box>
);

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
      p: 1.5, // Reducir el padding
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '4px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      {/* Header con daño y stats */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        mb: 0.5 // Reducir el espacio con la barra
      }}>
        {/* Daño promedio y texto */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          minWidth: 'fit-content'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: '2rem', // Ajustar tamaño del número
              color: danoFinal >= 10 ? '#ff4d4d' : danoFinal >= 8 ? 'primary.main' : '#99ccff',
              fontWeight: 'bold',
              lineHeight: 1,
              cursor: 'help',
            }}
          >
            {danoFinal.toFixed(2)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.9rem', // Ajustar tamaño del texto
              opacity: 0.7
            }}>
            Average damage vs
          </Typography>
        </Box>

        {/* Stats del enemigo */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25, // Reducir espacio entre nombre y stats
          alignItems: 'flex-end'
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.primary',
              fontWeight: 400,
              fontSize: '1rem' // Ajustar tamaño del nombre
            }}>
            {unidadOponente.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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

      {/* Barra de progreso */}
      <Box sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        mb: 1.5 // Ajustar espacio con las habilidades
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 0
        }}>
          <Box
            component="span"
            sx={{
              color: porcentajeVidaTotal >= 100 ? 'primary.main' : 'secondary.main', 
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'help',
              fontSize: '0.875rem',
              lineHeight: '8px',
              display: 'flex',
              alignItems: 'center',
              height: '8px',
              minWidth: '40px'  // Para que no salte cuando cambia de 99% a 100%
            }}
          >
            {`${porcentajeVidaTotal.toFixed(0)}%`}
          </Box>
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <VidaBar 
              unidadOponente={unidadOponente}
              porcentajeVidaTotal={porcentajeVidaTotal}
            />
          </Box>
        </Box>
      </Box>

      {/* Habilidades */}
      <Box sx={{ 
        display: 'flex',
        gap: 1,
        width: '100%'
      }}>
        {/* Columna habilidades ofensivas */}
        <Box sx={{
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.75, // Ajustar espacio entre habilidades
          flex: 1
        }}>
          {habilidades.ofensivas.map((habilidad) => (
            <AbilityButton
              key={habilidad.id}
              habilidad={habilidad}
              active={habilidadesActivas.ofensivas[habilidad.id]}
              onToggle={handleToggleOfensiva}
              onMouseEnter={() => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
              onMouseLeave={() => window.innerWidth >= 800 && handleMouseLeave()}
              activeTooltip={activeTooltip === habilidad.id}
              onTooltipClose={() => setActiveTooltip(null)}
              color="primary"
              activeBackgroundColor="rgba(0, 207, 200, 0.15)"
              hoverBackgroundColor="rgba(0, 207, 200, 0.25)"
              activeBorderColor="primary.main"
              hoverBorderColor="primary.light"
              activeTextColor="#e6f7ff"
              switchTrackColor="rgba(0, 207, 200, 0.3)"
              tabIndex={-1}
            />
          ))}
        </Box>

        {/* Columna habilidades defensivas */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column', 
          gap: 0.75, // Ajustar espacio entre habilidades
          flex: 1
        }}>
          {habilidades.defensivas.map((habilidad) => (
            <AbilityButton
              key={habilidad.id}
              habilidad={habilidad}
              active={habilidadesActivas.defensivas[habilidad.id]}
              onToggle={handleToggleDefensiva}
              onMouseEnter={() => window.innerWidth >= 800 && handleMouseEnter(habilidad.id)}
              onMouseLeave={() => window.innerWidth >= 800 && handleMouseLeave()}
              activeTooltip={activeTooltip === habilidad.id}
              onTooltipClose={() => setActiveTooltip(null)}
              color="secondary"
              activeBackgroundColor="rgba(255, 77, 130, 0.15)"
              hoverBackgroundColor="rgba(255, 77, 130, 0.25)"
              activeBorderColor="#ff9999"
              hoverBorderColor="#ff9999"
              activeTextColor="#e6f7ff"
              switchTrackColor="rgba(255, 77, 130, 0.3)"
              tabIndex={-1}
            />
          ))}
        </Box>
      </Box>
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



// Componente para las tags
const UnitTag = ({ label }) => (
  <Typography
    component="span"
    sx={{
      fontSize: '0.75rem',
      px: 1,
      py: 0.25,
      borderRadius: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      color: 'text.secondary',
      textTransform: 'lowercase',
      letterSpacing: '0.02em',
      fontWeight: 300,
      opacity: 0.8,
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      }
    }}
  >
    {label}
  </Typography>
);

// Componente para los botones de habilidades
const AbilityButton = ({ habilidad, active, isOffensive, onToggle, color, activeBackgroundColor, hoverBackgroundColor, activeBorderColor, hoverBorderColor, activeTextColor }) => {
  const isMobile = window.matchMedia('(hover: none)').matches;
  const [isClickable, setIsClickable] = useState(true);

  const handleClick = useCallback(() => {
    if (!isClickable || !habilidad.type === 'toggleable') return;
    
    setIsClickable(false);
    // Intentar quitar el focus explícitamente
    document.activeElement?.blur();
    onToggle(habilidad.id);
    setTimeout(() => setIsClickable(true), 300);
  }, [habilidad.id, isClickable, onToggle]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5, 
      width: '100%'
    }}>
      <Chip
        label={habilidad.name}
        onClick={handleClick}
        variant="outlined"
        disabled={!habilidad.type === 'toggleable'}
        tabIndex={-1}
        sx={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: active
            ? activeBackgroundColor
            : 'rgba(255, 255, 255, 0.03)',
          cursor: habilidad.type === 'toggleable' ? 'pointer' : 'default',
          border: '1px solid',
          borderColor: active
            ? activeBorderColor
            : 'divider',
          height: isMobile ? '36px' : '32px',
          WebkitTapHighlightColor: 'transparent',
          '&.MuiChip-root': {
            transition: 'none',
            '&:active': {
              transform: 'scale(0.98)'
            },
            '&.MuiChip-outlined': {
              backgroundColor: active
                ? activeBackgroundColor
                : 'rgba(255, 255, 255, 0.03)'
            }
          },
          '& .MuiChip-label': {
            color: active ? '#e6f7ff' : 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: active ? 500 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingLeft: 1,
            paddingRight: 1
          }
        }}
      />

      {isMobile ? (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            alert(habilidad.description);
          }}
          sx={{
            opacity: 0.7,
            fontSize: '0.75rem',
            color: 'text.secondary',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            p: 0.25,
            '&:hover': {
              opacity: 0.8,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          ?
        </Box>
      ) : (
        <Tooltip
          title={habilidad.description}
          arrow
          placement=  "right"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'rgba(0,0,0,0.9)',
                '& .MuiTooltip-arrow': {
                  color: 'rgba(0,0,0,0.9)',
                },
                maxWidth: '300px',
                p: 1,
                fontSize: '0.75rem'
              }
            }
          }}
        >
          <Box
            sx={{
              opacity: 0.5,
              fontSize: '0.75rem',
              color: 'text.secondary',
              cursor: 'help',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              p: 0.25,
              '&:hover': {
                opacity: 0.8,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            ?
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};



export default ComparacionEjercitos; 