import React from 'react';
import { Stack, Box, Grid, Typography, Container, Paper, Divider, LinearProgress } from '@mui/material';

const ComparacionEjercitos = ({ armies, selectedEjercitoDefensor, selectedEjercitoAtacante }) => {
  const unidadesAtacantesOrdenadas = Object.entries(armies[selectedEjercitoAtacante]);
  const unidadesDefensorasOrdenadas = Object.entries(armies[selectedEjercitoDefensor]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Comparación de Ejércitos
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Atacantes
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {unidadesAtacantesOrdenadas.map(([nombreUnidad, unidad]) => (
              <Box key={nombreUnidad} sx={{ mb: 2 }}>
                <UnidadCard
                  nombreUnidad={nombreUnidad}
                  unidad={unidad}
                  ejercitoOponente={armies[selectedEjercitoDefensor]}
                  ejercitoAtacante={armies[selectedEjercitoAtacante]}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Defensores
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {unidadesDefensorasOrdenadas.map(([nombreUnidad, unidad]) => (
              <Box key={nombreUnidad} sx={{ mb: 2 }}>
                <UnidadCard
                  nombreUnidad={nombreUnidad}
                  unidad={unidad}
                  ejercitoOponente={armies[selectedEjercitoDefensor]}
                  ejercitoAtacante={armies[selectedEjercitoAtacante]}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComparacionEjercitos;

const StatBox = ({ label, value, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
    <Typography variant="caption" sx={{ color: color || 'text.secondary', fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
      {value}
    </Typography>
  </Box>
);

const UnitTag = ({ label }) => (
  <Typography
    variant="caption"
    sx={{
      color: 'primary.blue',
      fontWeight: 'bold',
      fontSize: '0.75rem'
    }}
  >
    {label}
  </Typography>
);

const DanoBar = ({ value, maxValue }) => {
  const percent = (value / maxValue) * 100;
  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
      <Typography variant="caption" align="center" display="block">
        {value} / {maxValue}
      </Typography>
    </Box>
  );
};

const UnidadCard = ({ nombreUnidad, unidad, ejercitoOponente, ejercitoAtacante }) => {
  const danoCalculado = unidad.attack_profiles && unidad.attack_profiles[0] ? 
    unidad.attack_profiles[0].damage * unidad.attack_profiles[0].attacks : 0;

  const maxDamage = ejercitoOponente.wounds * 5;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {nombreUnidad}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatBox label="Ataques" value={unidad.attack_profiles && unidad.attack_profiles[0]?.attacks || '-'} />
          <StatBox label="Hit" value={unidad.attack_profiles && unidad.attack_profiles[0]?.hit || '-'} />
          <StatBox label="Wound" value={unidad.attack_profiles && unidad.attack_profiles[0]?.wound || '-'} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1">
              Daño: {danoCalculado}
            </Typography>
            <DanoBar value={danoCalculado} maxValue={maxDamage} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}; 