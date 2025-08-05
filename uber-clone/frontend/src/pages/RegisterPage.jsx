import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultUserType = queryParams.get('type') || 'user';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: defaultUserType,
    // Driver specific fields
    licenseNumber: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: '',
    vehicleYear: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user makes changes
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    // Driver specific validation
    if (formData.userType === 'driver') {
      if (!formData.licenseNumber) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (!formData.vehicleModel) {
        newErrors.vehicleModel = 'Vehicle model is required';
      }
      if (!formData.vehiclePlate) {
        newErrors.vehiclePlate = 'Vehicle plate is required';
      }
      if (!formData.vehicleColor) {
        newErrors.vehicleColor = 'Vehicle color is required';
      }
      if (!formData.vehicleYear) {
        newErrors.vehicleYear = 'Vehicle year is required';
      } else if (formData.vehicleYear < 2000 || formData.vehicleYear > new Date().getFullYear()) {
        newErrors.vehicleYear = 'Please enter a valid year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare user data
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType: formData.userType
      };

      const result = await register(userData);
      if (result.success) {
        // If driver registration, we might need to handle additional driver data
        // This would typically be done in a separate API call after user creation
        if (formData.userType === 'driver') {
          // TODO: Save driver specific information
          console.log('Driver data to be saved:', {
            licenseNumber: formData.licenseNumber,
            vehicleModel: formData.vehicleModel,
            vehiclePlate: formData.vehiclePlate,
            vehicleColor: formData.vehicleColor,
            vehicleYear: formData.vehicleYear
          });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Join UberClone
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* User Type Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    label="Account Type"
                  >
                    <MenuItem value="user">Rider</MenuItem>
                    <MenuItem value="driver">Driver</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  margin="normal"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  margin="normal"
                  required
                />
              </Grid>

              {/* Driver Specific Fields */}
              {formData.userType === 'driver' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Driver Information
                      </Typography>
                    </Divider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      error={!!errors.licenseNumber}
                      helperText={errors.licenseNumber}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vehicle Model"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      error={!!errors.vehicleModel}
                      helperText={errors.vehicleModel}
                      margin="normal"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Vehicle Plate"
                      name="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={handleChange}
                      error={!!errors.vehiclePlate}
                      helperText={errors.vehiclePlate}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Vehicle Color"
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleChange}
                      error={!!errors.vehicleColor}
                      helperText={errors.vehicleColor}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Vehicle Year"
                      name="vehicleYear"
                      type="number"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      error={!!errors.vehicleYear}
                      helperText={errors.vehicleYear}
                      margin="normal"
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Sign in here
              </Link>
            </Typography>
          </Box>

          <Box textAlign="center" mt={3}>
            <Link component={RouterLink} to="/" underline="hover">
              ← Back to Home
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;