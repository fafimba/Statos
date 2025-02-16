import { Box, Typography, IconButton } from '@mui/material';

export const LifeBar = ({ unidadOponente, porcentajeVidaTotal }) => {
  console.log("unidadOponente", unidadOponente);
  console.log("porcentajeVidaTotal", porcentajeVidaTotal);
  return (
    <Box sx={{
      position: 'relative',
      width: `${Math.min(100, unidadOponente.models * unidadOponente.wounds * 5.6)}%`,
      height: '8px',
      maskImage: `
        repeating-linear-gradient(
          to right,
          transparent 0px,
          transparent 3.6px,
          white 0,
          white ${100 / (unidadOponente.models)}%
        )`,
      backgroundRepeat: 'no-repeat',
    }}>
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        maskImage: `
          repeating-linear-gradient(
            to right,
            transparent 0px,
            transparent 1px,
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
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
};


export default LifeBar; 