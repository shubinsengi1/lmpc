import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  DirectionsCar, 
  Person, 
  AdminPanelSettings,
  Speed,
  Security,
  Support
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Speed fontSize="large" />,
      title: 'Fast & Reliable',
      description: 'Get matched with nearby drivers in seconds and reach your destination quickly.'
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Safe & Secure',
      description: 'All drivers are verified and tracked in real-time for your safety.'
    },
    {
      icon: <Support fontSize="large" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any issues.'
    }
  ];

  const userTypes = [
    {
      icon: <Person fontSize="large" />,
      title: 'Riders',
      description: 'Book rides instantly, track your driver, and pay seamlessly.',
      action: 'Start Riding',
      path: '/register?type=user'
    },
    {
      icon: <DirectionsCar fontSize="large" />,
      title: 'Drivers',
      description: 'Earn money on your schedule by driving with our platform.',
      action: 'Start Driving',
      path: '/register?type=driver'
    },
    {
      icon: <AdminPanelSettings fontSize="large" />,
      title: 'Admins',
      description: 'Manage the platform, users, and monitor operations.',
      action: 'Admin Login',
      path: '/login'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UberClone
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="inherit" onClick={() => navigate('/register')}>
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Ride, Your Way
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Experience the future of transportation with our reliable ride-sharing platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: 'white', 
              color: 'black',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: '#f0f0f0'
              }
            }}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Types Section */}
      <Box sx={{ backgroundColor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Join Our Platform
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {userTypes.map((userType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {userType.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {userType.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {userType.description}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(userType.path)}
                      sx={{ mt: 'auto' }}
                    >
                      {userType.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: 'black', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                UberClone
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Your reliable ride-sharing platform for safe and convenient transportation.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  color="inherit" 
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
                <Button 
                  color="inherit" 
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid #333' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2024 UberClone. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;