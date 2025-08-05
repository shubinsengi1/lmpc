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
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Dashboard,
  People,
  DirectionsCar,
  TrendingUp,
  Settings,
  ExitToApp,
  AccountCircle,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, ridesResponse] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/users?limit=10'),
        axios.get('/api/admin/rides?limit=10')
      ]);

      setDashboardStats(statsResponse.data.stats);
      setUsers(usersResponse.data.users || []);
      setRides(ridesResponse.data.rides || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-status`);
      // Reload users data
      const response = await axios.get('/api/admin/users?limit=10');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const verifyDriver = async (driverId, verified) => {
    try {
      await axios.put(`/api/admin/drivers/${driverId}/verify`, { verified });
      // Reload users data
      const response = await axios.get('/api/admin/users?limit=10');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error verifying driver:', err);
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

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value || 0}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'black' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UberClone Admin
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.firstName}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<Dashboard />} label="Dashboard" />
            <Tab icon={<People />} label="Users" />
            <Tab icon={<DirectionsCar />} label="Rides" />
            <Tab icon={<TrendingUp />} label="Analytics" />
          </Tabs>
        </Paper>

        {/* Dashboard Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={dashboardStats?.totalUsers}
                icon={<People fontSize="large" />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Drivers"
                value={dashboardStats?.totalDrivers}
                icon={<DirectionsCar fontSize="large" />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Rides"
                value={dashboardStats?.totalRides}
                icon={<TrendingUp fontSize="large" />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Rides"
                value={dashboardStats?.activeRides}
                icon={<Dashboard fontSize="large" />}
                color="warning"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Overview
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${dashboardStats?.totalRevenue || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Revenue
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Today's Activity
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {dashboardStats?.todayRides || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Rides Today
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Users Tab */}
        {activeTab === 1 && (
          <Paper>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.userType} 
                            color={user.userType === 'driver' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.rating?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={user.isActive}
                                onChange={() => toggleUserStatus(user.id, user.isActive)}
                                size="small"
                              />
                            }
                            label="Active"
                          />
                          {user.userType === 'driver' && (
                            <Button
                              size="small"
                              variant={user.documentsVerified ? 'contained' : 'outlined'}
                              color={user.documentsVerified ? 'success' : 'primary'}
                              onClick={() => verifyDriver(user.id, !user.documentsVerified)}
                              sx={{ ml: 1 }}
                            >
                              {user.documentsVerified ? 'Verified' : 'Verify'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        )}

        {/* Rides Tab */}
        {activeTab === 2 && (
          <Paper>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Recent Rides
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Fare</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell>#{ride.id}</TableCell>
                        <TableCell>
                          {ride.userFirstName} {ride.userLastName}
                        </TableCell>
                        <TableCell>
                          {ride.driverFirstName ? 
                            `${ride.driverFirstName} ${ride.driverLastName}` : 
                            'Not assigned'
                          }
                        </TableCell>
                        <TableCell>{ride.pickupAddress}</TableCell>
                        <TableCell>{ride.destinationAddress}</TableCell>
                        <TableCell>
                          <Chip 
                            label={ride.status}
                            color={getStatusColor(ride.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${ride.fare}</TableCell>
                        <TableCell>
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        )}

        {/* Analytics Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Advanced analytics features coming soon...
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2">
                    • Revenue trends and forecasting
                  </Typography>
                  <Typography variant="body2">
                    • User engagement metrics
                  </Typography>
                  <Typography variant="body2">
                    • Driver performance analytics
                  </Typography>
                  <Typography variant="body2">
                    • Geographic heat maps
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;