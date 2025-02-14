import React from 'react';  
import { Box, Typography, Switch } from '@mui/material';
import { RiSwordFill } from "react-icons/ri";
import { LuCrosshair } from "react-icons/lu";
import { useState, useCallback, useMemo } from 'react';
import { weapon_abilities } from '../../data/weapon_abilities';

// Componente para los perfiles de ataque
const AttackProfile = ({ perfil, activo, habilidadesPerfil = {}, onToggleHabilidad }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 0.75,
      px: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        flex: 1,
        minWidth: 0
      }}>
        {perfil.type === 'melee' ? (
          <RiSwordFill 
            style={{
              fontSize: '1rem',
              color: '#ff9999',
              opacity: 0.7,
              transform: 'scaleX(-1)'  // Flip horizontal
            }}
          />
        ) : (
          <LuCrosshair
            style={{
              fontSize: '1rem',
              color: '#99ccff',
              opacity: 0.7
            }}
          />
        )}
        <Typography sx={{
          color: 'text.primary',
          fontSize: { xs: '0.8rem', sm: '0.85rem' },
          fontWeight: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {perfil.name}
        </Typography>
      </Box>
  
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        ml: 1,
        flexShrink: 0
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: { xs: 1, sm: 1.5 }
        }}>
          {/* Stats */}
          <Typography sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            A{perfil.attacks}
          </Typography>
          <Typography sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            H{perfil.hit}+
          </Typography>
          <Typography sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            W{perfil.wound}+
          </Typography>
          <Typography sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            R{perfil.rend === 0 ? '-' : perfil.rend}
          </Typography>
          <Typography sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            D{perfil.damage}
          </Typography>
        </Box>
  
        <Switch
          checked={activo}
          onChange={() => onToggleHabilidad(perfil.name, 'active', !activo)}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            transform: 'scale(0.7)',
            ml: -0.5,
            '& .MuiSwitch-thumb': {
              backgroundColor: activo ? 'primary.main' : '#404040'
            },
            '& .MuiSwitch-track': {
              backgroundColor: activo ? 'rgba(0, 207, 200, 0.3)' : '#242424',
              opacity: 1
            }
          }}
        />
      </Box>
    </Box>
  );
  
  export default AttackProfile; 
  