import React from 'react';  
import { Typography } from '@mui/material';

export const UnitTag = ({ label }) => (
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

export default UnitTag; 