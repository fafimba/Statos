import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Switch
} from '@mui/material';
import { armies } from '../../data/armies';
import { default as UnidadCard } from './UnidadCard';

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
      <Grid container spacing={3}>
        <Grid item xs={12} md={vistaUnaColumna ? 12 : 6}>
          <Typography variant="h6" sx={{ mb: 2, color: '#90caf9' }}>
            Attacking Units
          </Typography>
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
            <Typography variant="h6" sx={{ mb: 2, color: '#ff6b6b' }}>
              Defending Units
            </Typography>
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

export default ComparacionEjercitos; 