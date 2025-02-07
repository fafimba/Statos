import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Slider
} from '@mui/material';
import { calculateAttacks } from '../utils/calculator';
import { useCalculator } from '../context/CalculatorContext';

function Calculadora() {
  const { calculatorData, setCalculatorData } = useCalculator();
  const [result, setResult] = useState(null);
  const location = useLocation();

  // Efecto para cargar los datos del perfil cuando llegamos desde el comparador
  useEffect(() => {
    if (location.state) {
      const { attacker, defender } = location.state;
      
      // Actualizar el estado de la calculadora con los datos recibidos
      setCalculatorData({
        models: attacker.models.toString(),
        attacks_per_model: attacker.attacks.toString(),
        hit: attacker.hit.toString(),
        wound: attacker.wound.toString(),
        damage: attacker.damage.toString(),
        rend: attacker.rend.toString(),
        crit_type: 'none',  // valor por defecto
        save: defender.save ? defender.save.toString() : '-',
        ward: defender.ward ? defender.ward.toString() : '-'
      });
    }
  }, [location.state, setCalculatorData]);

  const calculateResults = async (newData) => {
    try {
      // Preparar los datos en el formato esperado
      const attackProfile = {
        attacker: {
          models: parseInt(newData.models),
          attack_profiles: [{
            name: "Simulated Attack",
            attacks: parseInt(newData.attacks_per_model),
            hit: parseInt(newData.hit),
            wound: parseInt(newData.wound),
            damage: parseInt(newData.damage),
            rend: parseInt(newData.rend),
            crit_type: newData.crit_type
          }]
        },
        defender: {
          save: newData.save !== '-' ? parseInt(newData.save) : 0,
          ward: newData.ward !== '-' ? parseInt(newData.ward) : 0
        }
      };

      // Usar la función local en lugar de la llamada al backend
      const result = calculateAttacks({
        miniaturas: attackProfile.attacker.models,
        perfiles_ataque: attackProfile.attacker.attack_profiles,
        guardia: attackProfile.defender.save,
        salvaguardia: attackProfile.defender.ward
      });

      setResult(result);
    } catch (error) {
      console.error('Error calculating results:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...calculatorData,
      [name]: value
    };
    setCalculatorData(newFormData);
    calculateResults(newFormData);
  };

  useEffect(() => {
    calculateResults(calculatorData);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#121212',
      pt: { xs: 2, md: 4 },
      px: { xs: 2, md: 3 }
    }}>
      {/* Result Panel with Interactive Target Stats */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 },
          mb: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Save Selector */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'text.secondary' }}>Save</InputLabel>
              <Select
                name="save"
                value={calculatorData.save}
                onChange={handleChange}
                label="Save"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  },
                  color: '#90caf9'
                }}
              >
                <MenuItem value="-">-</MenuItem>
                {[6,5,4,3,2].map(value => (
                  <MenuItem 
                    key={value} 
                    value={value.toString()}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.08)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(144, 202, 249, 0.16)'
                      }
                    }}
                  >
                    {value}+
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Expected Damage */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Expected Damage
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '3rem', md: '5rem' },
                  color: '#ffd700',
                  lineHeight: 1.2
                }}
              >
                {result?.damage_final?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </Grid>

          {/* Ward Selector */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: 'text.secondary' }}>Ward</InputLabel>
              <Select
                name="ward"
                value={calculatorData.ward}
                onChange={handleChange}
                label="Ward"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  },
                  color: '#90caf9'
                }}
              >
                <MenuItem value="-">-</MenuItem>
                {[6,5,4,3,2].map(value => (
                  <MenuItem 
                    key={value} 
                    value={value.toString()}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(144, 202, 249, 0.08)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(144, 202, 249, 0.16)'
                      }
                    }}
                  >
                    {value}+
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Input Panel */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 2
        }}
      >
        <Grid container spacing={3}>
          {/* Unidad */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Unit Size
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2 
              }}>
                <Slider
                  name="models"
                  value={parseInt(calculatorData.models)}
                  onChange={handleChange}
                  min={1}
                  max={30}
                  sx={{
                    color: '#90caf9',
                    flexGrow: 1,
                    '& .MuiSlider-thumb': {
                      width: 28,
                      height: 28,
                      backgroundColor: '#90caf9',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(144, 202, 249, 0.16)'
                      },
                      '&::after': {
                        content: '""',
                        width: 32,
                        height: 32,
                        borderRadius: '50%'
                      }
                    }
                  }}
                />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#90caf9',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}
                >
                  {calculatorData.models}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Perfil de Ataque */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1
            }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Attack Profile
              </Typography>
              <Grid container spacing={2}>
                {/* Ataques por modelo */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 2,
                    mb: 2
                  }}>
                    <Typography color="text.secondary" sx={{ minWidth: '100px' }}>
                      Attacks
                    </Typography>
                    <Slider
                      name="attacks_per_model"
                      value={parseInt(calculatorData.attacks_per_model)}
                      onChange={handleChange}
                      min={1}
                      max={10}
                      sx={{ flexGrow: 1, color: '#90caf9' }}
                    />
                    <Typography sx={{ color: '#90caf9', minWidth: '30px' }}>
                      {calculatorData.attacks_per_model}
                    </Typography>
                  </Box>
                </Grid>

                {/* Hit, Wound, Rend, Damage */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex',
                    gap: 2,
                    mb: 2
                  }}>
                    <Paper sx={{ 
                      p: 2,
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Hit
                      </Typography>
                      <Select
                        name="hit"
                        value={calculatorData.hit}
                        onChange={handleChange}
                        sx={{ 
                          mt: 1,
                          color: '#90caf9',
                          '& .MuiSelect-select': {
                            py: 0.5
                          }
                        }}
                      >
                        {[6,5,4,3,2].map(value => (
                          <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                        ))}
                      </Select>
                    </Paper>
                    <Paper sx={{ 
                      p: 2,
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Wound
                      </Typography>
                      <Select
                        name="wound"
                        value={calculatorData.wound}
                        onChange={handleChange}
                        sx={{ 
                          mt: 1,
                          color: '#90caf9',
                          '& .MuiSelect-select': {
                            py: 0.5
                          }
                        }}
                      >
                        {[6,5,4,3,2].map(value => (
                          <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                        ))}
                      </Select>
                    </Paper>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex',
                    gap: 2
                  }}>
                    <Paper sx={{ 
                      p: 2,
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Rend
                      </Typography>
                      <Slider
                        name="rend"
                        value={parseInt(calculatorData.rend)}
                        onChange={handleChange}
                        min={0}
                        max={3}
                        marks
                        sx={{ mt: 1, color: '#90caf9' }}
                      />
                    </Paper>
                    <Paper sx={{ 
                      p: 2,
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Damage
                      </Typography>
                      <Slider
                        name="damage"
                        value={parseInt(calculatorData.damage)}
                        onChange={handleChange}
                        min={1}
                        max={6}
                        marks
                        sx={{ mt: 1, color: '#90caf9' }}
                      />
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Calculadora;