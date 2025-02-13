import React, { useState, useCallback } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';

export const AbilityButton = ({ 
  habilidad, 
  active, 
  isOffensive, 
  onToggle, 
  color, 
  activeBackgroundColor, 
  hoverBackgroundColor, 
  activeBorderColor, 
  hoverBorderColor, 
  activeTextColor 
}) => {
  const isMobile = window.matchMedia('(hover: none)').matches;
  const [isClickable, setIsClickable] = useState(true);

  const handleClick = useCallback(() => {
    if (!isClickable || !habilidad.type === 'toggleable') return;
    
    setIsClickable(false);
    onToggle(habilidad.id);
    setTimeout(() => setIsClickable(true), 300);
  }, [habilidad.id, isClickable, onToggle]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5, 
      width: '100%',
      mb: 0.25
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

      {/* Botón de información */}
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
          placement="right"
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

export default AbilityButton; 