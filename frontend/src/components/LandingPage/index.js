import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Button,
  alpha 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ConstructionIcon from '@mui/icons-material/Construction';

const GameCard = ({ title, description, isAvailable, onClick }) => (
  <Card 
    sx={{ 
      height: '100%',
      backgroundColor: isAvailable ? alpha('#00CED1', 0.1) : 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: isAvailable ? alpha('#00CED1', 0.3) : 'divider',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: isAvailable ? 'translateY(-4px)' : 'none',
        backgroundColor: isAvailable ? alpha('#00CED1', 0.15) : 'background.paper',
        borderColor: isAvailable ? alpha('#00CED1', 0.4) : 'divider',
      }
    }}
  >
    <CardActionArea 
      disabled={!isAvailable}
      onClick={onClick}
      sx={{ 
        height: '100%',
        '& .MuiCardContent-root': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <CardContent sx={{ 
        height: '100%', 
        p: { xs: 2, md: 3 },
        overflow: 'hidden'
      }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: isAvailable ? '#00CED1' : 'text.primary',
            fontWeight: isAvailable ? 600 : 400
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {isAvailable && (
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 'auto', 
              pt: 2,
              color: alpha('#00CED1', 0.7),
              display: 'block'
            }}
          >
            Available now
          </Typography>
        )}
        {!isAvailable && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mt: 'auto',
            pt: 2,
            color: 'text.disabled' 
          }}>
            <ConstructionIcon fontSize="small" />
            <Typography variant="caption">
              Under development
            </Typography>
          </Box>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
        pt: { xs: 4, md: 12 }
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          maxWidth: '800px',
          mx: 'auto'
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #00CED1 30%, #4169E1 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 2
            }}
          >
            PreBattle.net
          </Typography>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: 'text.secondary',
              mb: 4
            }}
          >
            Tactical tools to master the battlefield
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              color: alpha('#fff', 0.7),
              mb: 8
            }}
          >
            Optimize your strategy with our specialized tools.
            Analyze units, compare armies and maximize your potential in every battle.
            Designed by players, for players.
          </Typography>
        </Box>

        {/* Tools Grid */}
        <Grid 
          container 
          spacing={{ xs: 2, md: 4 }}
          sx={{ 
            mb: 8,
            maxWidth: '1000px',
            justifyContent: 'center'
          }}
        >
          <Grid item xs={12} sm={10} md={6}>
            <GameCard
              title="Age of Sigmar: Spearhead"
              description="Compare units and analyze potential damage for the new competitive format of Age of Sigmar."
              isAvailable={true}
              onClick={() => navigate('/spearhead')}
            />
          </Grid>
          <Grid item xs={12} sm={10} md={6}>
            <GameCard
              title="Damage Calculator"
              description="Quick and easy tool to calculate expected damage output for any unit profile or weapon combination."
              isAvailable={false}
            />
          </Grid>
          <Grid item xs={12} sm={10} md={6}>
            <GameCard
              title="Age of Sigmar"
              description="Complete tools for Age of Sigmar, including list analysis and combat calculator."
              isAvailable={false}
            />
          </Grid>
          <Grid item xs={12} sm={10} md={6}>
            <GameCard
              title="Kill Team"
              description="Optimize your Kill Team squads with our specialized suite of tools."
              isAvailable={false}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage; 