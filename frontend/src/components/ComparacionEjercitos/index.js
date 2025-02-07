import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Switch
} from '@mui/material';
import { armies } from '../../data/armies';
import { default as UnidadCard } from './UnidadCard';


function ComparacionEjercitos() {
  // Estado para los ejércitos seleccionados
  const [selectedEjercitoAtacante, setSelectedEjercitoAtacante] = useState(() => 
    localStorage.getItem('selectedAttacker') || Object.keys(armies)[0]
  );
  
  const [selectedEjercitoDefensor, setSelectedEjercitoDefensor] = useState(() =>
    localStorage.getItem('selectedDefender') || Object.keys(armies)[1]
  );

  // Ordenar unidades por nombre
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

  // Guardar selecciones en localStorage
  useEffect(() => {
    localStorage.setItem('selectedAttacker', selectedEjercitoAtacante);
  }, [selectedEjercitoAtacante]);

  useEffect(() => {
    localStorage.setItem('selectedDefender', selectedEjercitoDefensor);
  }, [selectedEjercitoDefensor]);

  // Nuevo estado para el modo de vista
  const [vistaUnaColumna, setVistaUnaColumna] = useState(false);

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, // Padding responsivo
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#1a1e2c'
    }}>
      {/* Control de vista */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: 2 
      }}>
        <Typography variant="body2" color="text.secondary">
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
        <Grid item xs={12} md={vistaUnaColumna ? 6 : 6}>
          <FormControl fullWidth size="small">
            <InputLabel>Attacking Army</InputLabel>
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
        <Grid item xs={12} md={vistaUnaColumna ? 6 : 6}>
          <FormControl fullWidth size="small">
            <InputLabel>Defending Army</InputLabel>
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

      {/* Contenido de unidades */}
      <Grid 
        container 
        spacing={2}
        sx={{
          '& .MuiCard-root': {
            height: '100%'
          }
        }}
      >
        {/* Columna del Ejército Atacante */}
        <Grid 
          item 
          xs={12} 
          md={vistaUnaColumna ? 12 : 6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {unidadesAtacantesOrdenadas.map(([nombre, unidad]) => (
            <UnidadCard
              key={nombre}
              nombreUnidad={nombre}
              unidad={unidad}
              ejercitoOponente={armies[selectedEjercitoDefensor]}
              esAtacante={true}
              vistaUnaColumna={vistaUnaColumna}
            />
          ))}
        </Grid>

        {/* Columna del Ejército Defensor */}
        {!vistaUnaColumna && (
          <Grid 
            item 
            xs={12} 
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {unidadesDefensorasOrdenadas.map(([nombre, unidad]) => (
              <UnidadCard
                key={nombre}
                nombreUnidad={nombre}
                unidad={unidad}
                ejercitoOponente={armies[selectedEjercitoAtacante]}
                esAtacante={false}
                vistaUnaColumna={vistaUnaColumna}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default ComparacionEjercitos; 