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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  DirectionsCar,
  AccountCircle,
  ExitToApp,
  LocalTaxi,
  Star,
  AttachMoney,
  Notifications,
  CheckCircle,
  Cancel,
  PlayArrow,
  Stop,
  LocationOn
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [rides, setRides] = useState([]);
  const [pendingRides, setPendingRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideDialog, setRideDialog] = useState(false);

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rides/driver?limit=10');
      setRides(response.data.rides || []);
      
      // Load pending ride requests (this would typically come from Socket.io)
      // For demo, we'll show some mock pending rides
      setPendingRides([]);
    } catch (err) {
      setError('Failed to load driver data');
      console.error('Driver data error:', err);
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

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In a real app, this would update the driver's availability in the database
    console.log('Driver availability changed to:', !isAvailable);
  };

  const acceptRide = async (rideId) => {
    try {
      setLoading(true);
      await axios.post(`/api/rides/${rideId}/accept`);
      // Remove from pending and reload rides
      setPendingRides(prev => prev.filter(ride => ride.id !== rideId));
      loadDriverData();
      setRideDialog(false);
    } catch (err) {
      setError('Failed to accept ride');
      console.error('Accept ride error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId, status) => {
    try {
      setLoading(true);
      await axios.put(`/api/rides/${rideId}/status`, { status });
      loadDriverData();
      setRideDialog(false);
    } catch (err) {
      setError('Failed to update ride status');
      console.error('Update status error:', err);
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
      case 'arrived': return 'secondary';
      default: return 'default';
    }
  };

  const getNextStatusAction = (status) => {
    switch (status) {
      case 'accepted': return { status: 'arrived', label: 'Mark as Arrived', icon: <LocationOn /> };
      case 'arrived': return { status: 'started', label: 'Start Trip', icon: <PlayArrow /> };
      case 'started': return { status: 'completed', label: 'Complete Trip', icon: <CheckCircle /> };
      default: return null;
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

  const completedRides = rides.filter(ride => ride.status === 'completed');
  const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
  const averageRating = rides.length > 0 ? 
    rides.reduce((sum, ride) => sum + (ride.rating || 5), 0) / rides.length : 5.0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UberClone Driver
          </Typography>
          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={toggleAvailability}
                  color="success"
                />
              }
              label={isAvailable ? "Online" : "Offline"}
              sx={{ mr: 2, color: 'white' }}
            />
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.firstName}
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

        {/* Availability Status */}
        {!isAvailable && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You are currently offline. Toggle the switch in the header to start receiving ride requests.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Driver Stats */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <DirectionsCar />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {completedRides.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed Rides
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      ${totalEarnings.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Earnings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Star />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: isAvailable ? 'success.main' : 'error.main', mr: 2 }}>
                    <LocalTaxi />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {isAvailable ? 'Online' : 'Offline'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Rides */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Active Rides
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {rides.filter(ride => ['accepted', 'arrived', 'started'].includes(ride.status)).length > 0 ? (
                    rides.filter(ride => ['accepted', 'arrived', 'started'].includes(ride.status)).map((ride) => (
                      <ListItem key={ride.id} divider>
                        <ListItemIcon>
                          <DirectionsCar />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">
                                {ride.userFirstName} {ride.userLastName}
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
                                From: {ride.pickupAddress}
                              </Typography>
                              <Typography variant="caption" display="block">
                                To: {ride.destinationAddress}
                              </Typography>
                              <Typography variant="caption" color="success.main">
                                ${ride.fare}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedRide(ride);
                            setRideDialog(true);
                          }}
                        >
                          Manage
                        </Button>
                      </ListItem>
                    ))
                  ) : (
                    <Box textAlign="center" py={4}>
                      <LocalTaxi sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="textSecondary">
                        No active rides
                      </Typography>
                      {!isAvailable && (
                        <Typography variant="caption" color="textSecondary">
                          Go online to receive ride requests
                        </Typography>
                      )}
                    </Box>
                  )}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Recent Rides */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Rides
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : rides.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {rides.slice(0, 10).map((ride) => (
                    <ListItem key={ride.id} divider>
                      <ListItemIcon>
                        <DirectionsCar />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {ride.userFirstName} {ride.userLastName}
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
                            <Typography variant="caption" display="block">
                              {ride.destinationAddress}
                            </Typography>
                            {ride.fare && (
                              <Typography variant="caption" color="success.main">
                                ${ride.fare}
                              </Typography>
                            )}
                            {ride.rating && (
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <Star sx={{ fontSize: 12, color: 'warning.main', mr: 0.5 }} />
                                <Typography variant="caption">
                                  {ride.rating}/5
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <DirectionsCar sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="textSecondary">
                    No rides yet
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Ride Management Dialog */}
        <Dialog open={rideDialog} onClose={() => setRideDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manage Ride</DialogTitle>
          <DialogContent>
            {selectedRide && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Passenger: {selectedRide.userFirstName} {selectedRide.userLastName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Phone: {selectedRide.userPhone || 'Not provided'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" gutterBottom>
                  <strong>Pickup:</strong> {selectedRide.pickupAddress}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Destination:</strong> {selectedRide.destinationAddress}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Fare:</strong> ${selectedRide.fare}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip
                    label={selectedRide.status}
                    color={getStatusColor(selectedRide.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRideDialog(false)}>Close</Button>
            {selectedRide && getNextStatusAction(selectedRide.status) && (
              <Button
                onClick={() => updateRideStatus(selectedRide.id, getNextStatusAction(selectedRide.status).status)}
                variant="contained"
                startIcon={getNextStatusAction(selectedRide.status).icon}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : getNextStatusAction(selectedRide.status).label}
              </Button>
            )}
            {selectedRide && ['accepted', 'arrived'].includes(selectedRide.status) && (
              <Button
                onClick={() => updateRideStatus(selectedRide.id, 'cancelled')}
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                disabled={loading}
              >
                Cancel Ride
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DriverDashboard;