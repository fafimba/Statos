import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Columna del Ejército Atacante */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
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

        {/* Columna del Ejército Defensor */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 3 }}>
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