import React, { useState,useRef,useEffect, useCallback, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch,
  Tooltip,
  Stack,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Chip
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
import { LifeBar } from './LifeBar';
import { AbilityButton } from './AbilityButton';
import { UnitTag } from './UnitTag';  
import AttackProfile  from './AttackProfile';
import useActiveAttackProfiles  from './hooks/useAttackProfiles';
import DamageCalculator  from './DamageCalculator';
import UnitCard  from './UnitCard';

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
            <UnitCard
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
                <UnitCard
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

// const UnitCard = React.memo(({ nombreUnidad, unidad, ejercitoOponente, ejercitoAtacante }) => {
//   // Usar el hook de perfiles de ataque
//   const {
//     perfilesActivos,
//     habilidadesPerfiles,
//     modificarPerfil,
//   } = useActiveAttackProfiles(unidad);

//   // Estado para habilidades toggleables de unidad
//   const [expandido, setExpandido] = useState(false);

//   const combatComparisonData = useMemo(() => {
//     if (!ejercitoOponente?.units) return [];

//     // Crear un array de objetos con unidadAtacante, unidadOponente y perfiles activos
//     return Object.entries(ejercitoOponente.units).map(([nombreUnidad, unidadOponente]) => ({
//       unidadAtacante: unidad,
//       unidadOponente: unidadOponente,
//       perfilesActivos: perfilesActivos
//     }));
    
//   }, [ejercitoOponente?.units, unidad, perfilesActivos]);

//   // Estado para almacenar los daños calculados por cada DanoBar
//   const [danosPorUnidad, setDanosPorUnidad] = useState({});

//   // Callback para actualizar el daño de una unidad específica
//   const actualizarDano = useCallback((nombreUnidadOponente, dano) => {
//     if (dano === undefined || dano === null) return;
    
//     setDanosPorUnidad(prev => ({
//       ...prev,
//       [nombreUnidadOponente]: parseFloat(dano)
//     }));
//   }, []);

//   // Calcular el daño medio cuando cambien los daños
//   const danoMedio = useMemo(() => {
//     const danos = Object.values(danosPorUnidad);
//     if (danos.length === 0) return '0.0';
    
//     const suma = danos.reduce((sum, dano) => sum + dano, 0);
//     return (suma / danos.length).toFixed(1);
//   }, [danosPorUnidad]);

//   if (!unidad) return null;

//   return (
//     <Box sx={{ mb: 3 }}>
//       {/* Header de la unidad */}
//       <Box
//         onClick={() => setExpandido(!expandido)}
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 2,
//           p: 1.5,
//           background: theme => `linear-gradient(90deg, 
//             ${ejercitoAtacante.color}15 0%, 
//             rgba(0,0,0,0.2) 100%
//           )`,
//           position: 'relative',
//           '&::before': {
//             content: '""',
//             position: 'absolute',
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: '3px',
//             backgroundColor: theme => ejercitoAtacante.color,
//             opacity: 0.5,
//             borderRadius: '4px 0 0 4px'
//           },
//           borderRadius: '8px',
//           cursor: 'pointer',
//           '&:hover': {
//             background: theme => `linear-gradient(90deg, 
//               ${ejercitoAtacante.color}20 0%, 
//               rgba(0,0,0,0.25) 100%
//             )`,
//             '&::before': {
//               opacity: 0.7
//             }
//           }
//         }}
//       >
//         <Box sx={{ 
//           display: 'flex',
//           width: '100%',
//           justifyContent: 'space-between',
//           alignItems: 'flex-start',
//           gap: 2
//         }}>
//           {/* Columna izquierda: nombre y atributos */}
//           <Box sx={{
//             flex: 1,
//             overflow: 'hidden',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: 0.5
//           }}>
//             <Typography 
//               variant="h6"
//               sx={{ 
//                 color: 'text.primary',
//                 fontWeight: 400,
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'nowrap',
//                 fontSize: { xs: '1rem', sm: '1.1rem' }
//               }}
//             >
//               {nombreUnidad}
//             </Typography>
//           </Box>

//           {/* Columna derecha: daño y flecha */}
//           <Box sx={{ 
//             display: 'flex',
//             alignItems: 'center',
//             gap: 2,
//             marginLeft: 'auto',  // Forzar a la derecha
//             minWidth: 'fit-content'  // Evitar que se comprima
//           }}>
//             {!expandido && (
//               <Tooltip
//                 title="Average damage dealt by this unit against all units in the opposing army"
//                 arrow
//                 placement="left"
//                 enterDelay={1000}
//                 leaveDelay={0}
//               >
//                 <Typography sx={{ 
//                   color: danoMedio >= 8 ? '#ff4d4d' : danoMedio >= 5 ? 'primary.main' : 'text.primary',
//                   fontSize: { xs: '1.1rem', sm: '1.25rem' },
//                   fontWeight: 600,
//                   opacity: 1,
//                   minWidth: '60px',
//                   textAlign: 'right',
//                   cursor: 'help',
//                   textShadow: '0 0 10px rgba(0, 207, 200, 0.4)'
//                 }}>
//                   {danoMedio}
//                 </Typography>
//               </Tooltip>
//             )}
//             <Box sx={{ 
//               color: 'text.secondary',
//               opacity: 1,
//               fontSize: '0.8rem',
//               transition: 'transform 0.3s ease',
//               transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)'
//             }}>
//               ▼
//             </Box>
//           </Box>
//         </Box>
//       </Box>

//       {expandido && (
//         <Box sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1,
//           width: '100%',
//           mt: 1
//         }}>
//           {/* Stats y tags en una línea */}
//           <Box sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             mb: 2,
//             px: 0.5,
//             gap: 2,
//             flexWrap: 'wrap'
//           }}>
//             {/* Tags */}
//             <Box sx={{ 
//               display: 'flex', 
//               gap: 0.5,
//               flexWrap: 'wrap',
//               flex: 1
//             }}>
//               {unidad.tags?.map((tag) => (
//                 <UnitTag key={tag} label={tag} />
//               ))}
//             </Box>
//             {/* Stats defensivos */}
//             <Box sx={{
//               display: 'flex',
//               gap: 1.5,
//               flexWrap: 'wrap',
//               alignItems: 'center'
//             }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <PersonIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
//                 <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
//                   {unidad.models}
//                 </Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <FavoriteIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
//                 <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
//                   {unidad.wounds}
//                 </Typography>
//               </Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <ShieldIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
//                 <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
//                   {unidad.save}+
//                 </Typography>
//               </Box>
//               {unidad.ward && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <SecurityIcon sx={{ fontSize: '0.875rem', color: 'text.secondary', opacity: 0.8 }} />
//                   <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
//                     {unidad.ward}+
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </Box>

//           {/* Perfiles de ataque */}
//           <Box sx={{ mb: 2 }}>
//             {unidad.attack_profiles?.map(perfil => (
//               <AttackProfile
//                 key={perfil.name}
//                 perfil={perfil}
//                 activo={perfilesActivos[perfil.name]}
//                 habilidadesPerfil={habilidadesPerfiles[perfil.name]}
//                 onToggleHabilidad={modificarPerfil}
//               />
//             ))}
//           </Box>

//           {/* Daños contra unidades */}
//           <Box sx={{
//             display: 'flex', 
//             flexWrap: 'wrap',
//             gap: 1,
//             width: '100%',
//             pb: 0,
//             '& > *': {
//               flex: 1,
//               maxWidth:  window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)', // forzar máximo de 50%
//               minWidth: window.innerWidth < 800 ? 'calc(100% - 4px)' : 'calc(100% - 4px)' // Ajuste responsivo del ancho mínimo
//             }
//           }}>
//             {combatComparisonData.map((datos, index) => (
//               <DamageCalculator
//                 key={index}
//                 unidadAtacante={datos.unidadAtacante}
//                 unidadOponente={datos.unidadOponente}
//                 perfilesActivos={datos.perfilesActivos}
//                 onDanoCalculado={(dano) => actualizarDano(datos.unidadOponente.name, dano)}
//               />
//             ))}
//           </Box>
//         </Box>
//       )}
//     </Box>
//   );
// });

export default ComparacionEjercitos; 