import React, { useState, useCallback } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';

export const AbilityButton = React.memo(({ 
  habilidad, 
  active, 
  onToggle, 
  activeBackgroundColor, 
  activeBorderColor,
  isMobile
}) => {
  const [isClickable, setIsClickable] = useState(true);

  const handleClick = useCallback(() => {
    if (!isClickable || !habilidad.type === 'toggleable') return;
    
    setIsClickable(false);
    onToggle(habilidad.id);
    setTimeout(() => setIsClickable(true), isMobile ? 50 : 300);
  }, [habilidad.id, isClickable, onToggle, isMobile]);

  return (
    <Box sx={{
      position: 'relative',
      animation: 'fadeIn 0.2s ease',
      overflow: 'hidden',
      transition: `all ${isMobile ? '0.1s' : '0.2s'} ease`,
      mb: 0.75,
      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'translateY(-5px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}>
      <Chip
        label={habilidad.name}
        variant="outlined"
        disabled={!habilidad.type === 'toggleable'}
        onClick={handleClick}
        tabIndex={-1}
        sx={{
          flex: 1,
          justifyContent: 'flex-start',
          backgroundColor: active
            ? activeBackgroundColor
            : 'rgba(255, 255, 255, 0.03)',
          cursor: 'pointer',
          border: '1px solid',
          borderColor: active
            ? activeBorderColor
            : 'divider',
          height: isMobile ? '36px' : '32px',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          transition: `all ${isMobile ? '0.1s' : '0.2s'} ease`,
          transform: active ? 'scale(1)' : 'scale(0.98)',
          opacity: active ? 1 : 0.8,
          '&:hover': {
            backgroundColor: active 
              ? activeBackgroundColor 
              : `${activeBackgroundColor}80`,
            borderColor: active
              ? activeBorderColor
              : `${activeBorderColor}80`,
            transform: 'scale(1)',
            opacity: 1
          },
          '&.MuiChip-root': {
            transition: `all ${isMobile ? '0.1s' : '0.2s'} ease`,
            ...(isMobile ? {} : {
              '&:active': {
                transform: 'scale(0.98)'
              }
            })
          },
          '& .MuiChip-label': {
            color: active ? '#e6f7ff' : 'text.secondary',
            transition: `color ${isMobile ? '0.1s' : '0.2s'} ease`,
            fontSize: '0.75rem',
            fontWeight: active ? 500 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingLeft: 1,
            paddingRight: 1,
            '&:hover': {
              color: '#e6f7ff'
            }
          }
        }}
      />

      {/* Botón de información */}
      <Box
        component="button"
        onClick={(e) => {
          e.preventDefault();
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
          minWidth: '32px',
          height: '32px',
          border: 'none',
          outline: 'none',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          userSelect: 'none',
          touchAction: 'manipulation',
          zIndex: 1,
          position: 'relative',
          '&:hover': {
            opacity: 0.8,
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '&:active': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            transform: 'scale(0.95)',
          }
        }}
      >
        ?
      </Box>
    </Box>
  );
});

export default AbilityButton; 