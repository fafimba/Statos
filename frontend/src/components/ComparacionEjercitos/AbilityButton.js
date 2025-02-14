import React, { useState, useCallback } from 'react';
import { Box, Typography, Switch } from '@mui/material';

export const AbilityButton = React.memo(({ 
  habilidad, 
  active, 
  onToggle,
  activeBackgroundColor,
  activeBorderColor,
  isMobile
}) => {
  const handleClick = useCallback(() => {
    if (!habilidad.type === 'toggleable') return;
    onToggle(habilidad.id);
  }, [habilidad.id, onToggle]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        p: 0.75,
        borderRadius: '4px',
        border: '1px solid',
        borderColor: active ? activeBorderColor : 'rgba(255,255,255,0.1)',
        backgroundColor: active ? activeBackgroundColor : 'rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.15s ease-out',
        opacity: active ? 1 : 0.8,
        '&:hover': {
          backgroundColor: active ? activeBackgroundColor : 'rgba(0,0,0,0.15)',
          borderColor: active ? activeBorderColor : 'rgba(255,255,255,0.15)',
          opacity: 1
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1.5,
        flex: 1
      }}>
        <Typography sx={{ 
          fontSize: '0.8rem',
          color: active ? '#e6f7ff' : 'text.secondary',
          transition: 'color 0.15s ease-out'
        }}>
          {habilidad.name}
        </Typography>
        
        <Box
          onClick={(e) => {
            e.stopPropagation();
            alert(habilidad.description);
          }}
          sx={{
            opacity: 0.7,
            fontSize: '0.75rem',
            color: 'text.secondary',
            cursor: 'help',
            '&:hover': {
              opacity: 0.9
            }
          }}
        >
          ?
        </Box>
      </Box>

      <Switch
        checked={active}
        size="small"
        sx={{
          p: 0,
          transition: 'opacity 0.15s ease-out',
          '& .MuiSwitch-switchBase': {
            padding: '4px',
            color: 'rgba(255,255,255,0.5)',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              '& + .MuiSwitch-track': {
                backgroundColor: activeBackgroundColor,
                opacity: 0.9,
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: '#e6f7ff',
              }
            },
            '&:not(.Mui-checked)': {
              '& + .MuiSwitch-track': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                opacity: 0.5,
              },
              '& .MuiSwitch-thumb': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              }
            }
          },
          '& .MuiSwitch-track': {
            transition: 'background-color 0.15s ease-out, opacity 0.15s ease-out',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .MuiSwitch-thumb': {
            width: 14,
            height: 14,
            boxShadow: 'none',
          }
        }}
      />
    </Box>
  );
});

export default AbilityButton; 