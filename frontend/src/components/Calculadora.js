import React, { useState, useEffect } from 'react';
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

function Calculadora() {
  const [formData, setFormData] = useState({
    models: '5',
    attacks_per_model: '1',
    hit: '3',
    wound: '3',
    damage: '1',
    rend: '0',
    crit_type: 'none',
    save: '-',
    ward: '-'
  });
  const [result, setResult] = useState(null);

  const calculateResults = async (newData) => {
    try {
      // Preparar los datos en el nuevo formato
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
          save: newData.save === '-' ? 0 : parseInt(newData.save),
          ward: newData.ward === '-' ? 0 : parseInt(newData.ward)
        }
      };

      const response = await fetch('http://localhost:5001/api/calculate-damage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attackProfile),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    calculateResults(newFormData);
  };

  useEffect(() => {
    calculateResults(formData);
  }, []);

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      pt: { xs: 0, md: 4 },
      px: { xs: 0, md: 3 }
    }}>
      {/* Result Panel */}
      {result && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, md: 3 },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '100px', md: 'auto' },
            position: { xs: 'sticky', md: 'sticky' },
            top: 0,
            zIndex: 1,
            borderRadius: { xs: 0, md: 1 }
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Total Damage
          </Typography>
          <Typography 
            variant="h3" 
            color="primary"
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: { xs: '2.5rem', md: '4rem' }
            }}
          >
            {result.damage_final?.toFixed(2) || 0}
          </Typography>
        </Paper>
      )}

      {/* Main Input Panel */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, md: 3 },
          bgcolor: 'background.paper',
          flex: 1,
          overflow: 'auto',
          borderRadius: { xs: 0, md: 1 }
        }}
      >
        <Grid container spacing={2}>
          {/* Attack Fields */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Attack Profile
            </Typography>
          </Grid>

          {/* Models and Attacks */}
          <Grid item xs={6}>
            <Typography variant="caption" display="block" gutterBottom>
              Models: {formData.models}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                size="small"
                name="models"
                value={parseInt(formData.models)}
                onChange={handleChange}
                min={1}
                max={30}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" display="block" gutterBottom>
              Attacks: {formData.attacks_per_model}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                size="small"
                name="attacks_per_model"
                value={parseInt(formData.attacks_per_model)}
                onChange={handleChange}
                min={1}
                max={10}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>

          {/* Hit and Wound */}
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Hit</InputLabel>
              <Select
                name="hit"
                value={formData.hit}
                onChange={handleChange}
                label="Hit"
              >
                {[6,5,4,3,2].map(value => (
                  <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Wound</InputLabel>
              <Select
                name="wound"
                value={formData.wound}
                onChange={handleChange}
                label="Wound"
              >
                {[6,5,4,3,2].map(value => (
                  <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Damage and Rend */}
          <Grid item xs={6}>
            <Typography variant="caption" display="block" gutterBottom>
              Damage: {formData.damage}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                size="small"
                name="damage"
                value={parseInt(formData.damage)}
                onChange={handleChange}
                min={1}
                max={6}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" display="block" gutterBottom>
              Rend: {formData.rend}
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                size="small"
                name="rend"
                value={parseInt(formData.rend)}
                onChange={handleChange}
                min={0}
                max={3}
                sx={{ width: '100%' }}
              />
            </Box>
          </Grid>

          {/* Critical Type */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Critical Type</InputLabel>
              <Select
                name="crit_type"
                value={formData.crit_type}
                onChange={handleChange}
                label="Critical Type"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="mortal">Mortal</MenuItem>
                <MenuItem value="two_hits">Two Hits</MenuItem>
                <MenuItem value="auto_wound">Auto Wound</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Separator */}
          <Grid item xs={12}>
            <Box sx={{ mt: 1, mb: 1, borderTop: '1px solid', borderColor: 'divider' }} />
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              Target Defenses
            </Typography>
          </Grid>

          {/* Save and Ward */}
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Save</InputLabel>
              <Select
                name="save"
                value={formData.save}
                onChange={handleChange}
                label="Save"
              >
                <MenuItem value="-">None</MenuItem>
                {[6,5,4,3,2].map(value => (
                  <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Ward</InputLabel>
              <Select
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                label="Ward"
              >
                <MenuItem value="-">None</MenuItem>
                {[6,5,4,3,2].map(value => (
                  <MenuItem key={value} value={value.toString()}>{value}+</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Calculadora;