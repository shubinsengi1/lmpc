import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  DirectionsCar,
  History,
  AccountCircle,
  ExitToApp,
  Add,
  Star,
  AccessTime,
  Payment
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    pickupAddress: '',
    destinationAddress: '',
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    destinationLat: 40.7589,
    destinationLng: -73.9851,
    distance: 5.2,
    duration: 15
  });

  useEffect(() => {
    loadUserRides();
  }, []);

  const loadUserRides = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rides/user?limit=10');
      setRides(response.data.rides || []);
    } catch (err) {
      setError('Failed to load rides');
      console.error('Rides error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFare = (distance) => {
    const baseFare = 2.50;
    const perKmRate = 1.20;
    return Math.round((baseFare + (distance * perKmRate)) * 100) / 100;
  };

  const handleBookRide = async () => {
    try {
      setLoading(true);
      const rideRequest = {
        pickupLat: bookingData.pickupLat,
        pickupLng: bookingData.pickupLng,
        pickupAddress: bookingData.pickupAddress,
        destinationLat: bookingData.destinationLat,
        destinationLng: bookingData.destinationLng,
        destinationAddress: bookingData.destinationAddress,
        distance: bookingData.distance,
        duration: bookingData.duration
      };

      await axios.post('/api/rides/request', rideRequest);
      setBookingDialog(false);
      setError('');
      // Show success message
      alert('Ride requested successfully! Looking for nearby drivers...');
      // Reload rides
      loadUserRides();
    } catch (err) {
      setError('Failed to book ride. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'requested': return 'warning';
      case 'accepted': return 'info';
      case 'started': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UberClone
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2 }}>
              Hi, {user?.firstName}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <DirectionsCar />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user?.totalRides || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Rides
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Star />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user?.rating?.toFixed(1) || '5.0'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Your Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Payment />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      ${rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.fare || 0), 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Map Placeholder */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Your Location
              </Typography>
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1
                }}
              >
                <Box textAlign="center">
                  <LocationOn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Map Integration
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Google Maps integration coming soon
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<MyLocation />}
                    sx={{ mt: 2 }}
                    onClick={() => setBookingDialog(true)}
                  >
                    Book a Ride
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Rides */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Recent Rides
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : rides.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {rides.slice(0, 5).map((ride) => (
                    <ListItem key={ride.id} divider>
                      <ListItemIcon>
                        <DirectionsCar />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {ride.destinationAddress}
                            </Typography>
                            <Chip
                              label={ride.status}
                              color={getStatusColor(ride.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatDate(ride.createdAt)}
                            </Typography>
                            {ride.fare && (
                              <Typography variant="caption" color="success.main">
                                ${ride.fare}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No rides yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="book ride"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setBookingDialog(true)}
        >
          <Add />
        </Fab>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book a Ride</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Pickup Location"
                value={bookingData.pickupAddress}
                onChange={(e) => handleBookingChange('pickupAddress', e.target.value)}
                margin="normal"
                placeholder="Enter pickup address"
                InputProps={{
                  startAdornment: <MyLocation sx={{ mr: 1, color: 'primary.main' }} />
                }}
              />
              <TextField
                fullWidth
                label="Destination"
                value={bookingData.destinationAddress}
                onChange={(e) => handleBookingChange('destinationAddress', e.target.value)}
                margin="normal"
                placeholder="Where to?"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'error.main' }} />
                }}
              />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Ride Details
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Distance:</Typography>
                  <Typography variant="body2">{bookingData.distance} km</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Estimated Time:</Typography>
                  <Typography variant="body2">{bookingData.duration} min</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight="bold">Estimated Fare:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ${calculateFare(bookingData.distance)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button
              onClick={handleBookRide}
              variant="contained"
              disabled={!bookingData.pickupAddress || !bookingData.destinationAddress || loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Book Ride'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserDashboard;