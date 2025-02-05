import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ '& > :not(style)': { m: 1 } }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
          >
            Calculator
          </Button>
          <Button
            component={RouterLink}
            to="/ejercitos"
            color="inherit"
          >
            Army Comparison
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation; 