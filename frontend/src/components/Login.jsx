import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  TaskAlt,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isRegister) {
        const response = await axios.post('http://localhost:8000/usuarios/', formData);
        onLogin(response.data);
        toast.success('¡Registro exitoso!');
      } else {
        const response = await axios.post('http://localhost:8000/login/', {
          email: formData.email,
          password: formData.password
        });
        onLogin(response.data);
        toast.success('¡Inicio de sesión exitoso!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Error durante la autenticación');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        p: 2,
      }}
    >
      <Grid
        container
        spacing={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          width: '90%',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      >
        {/* Imagen y descripción */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { md: 8, lg: 12 },
            bgcolor: 'white',
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src="https://cdn-icons-png.flaticon.com/512/906/906334.png"
            alt="Task Management"
            sx={{
              width: '60%',
              height: 'auto',
              mb: 4,
            }}
          />
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            Gestión de Tareas
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ maxWidth: '80%' }}
          >
            Organiza tus tareas de manera eficiente, colabora con tu equipo y aumenta tu productividad.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['Gestión Simple', 'Colaboración', 'Organización'].map((feature) => (
              <Box
                key={feature}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  p: 1,
                  px: 2,
                  borderRadius: 2,
                }}
              >
                <TaskAlt color="primary" sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="primary.main">
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Formulario */}
        <Grid
          item
          xs={12}
          md={6}
          component={Paper}
          elevation={0}
          square
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'white',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {isRegister && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="username"
                label="Nombre de Usuario"
                value={formData.username}
                onChange={handleChange}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoFocus={!isRegister}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                  boxShadow: '0 4px 6px 3px rgba(33, 203, 243, .4)',
                },
              }}
            >
              {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>

            <Button
              fullWidth
              onClick={() => {
                setIsRegister(!isRegister);
                setFormData({
                  username: '',
                  email: '',
                  password: ''
                });
              }}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              {isRegister
                ? '¿Ya tienes una cuenta? Inicia sesión'
                : '¿No tienes una cuenta? Regístrate'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
