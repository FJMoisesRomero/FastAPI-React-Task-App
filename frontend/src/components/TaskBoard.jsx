import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Menu as MenuIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import UserList from './UserList';

const DRAWER_WIDTH = 240;

const TaskBoard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/usuarios/');
      const usersMap = {};
      response.data.forEach(user => {
        usersMap[user.id] = user;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    try {
      await axios.post('http://localhost:8000/tasks/', {
        ...newTask,
        usuario_id: user.id,
        status: 'pendiente'
      });
      setNewTask({ title: '', description: '' });
      setShowNewTaskForm(false);
      fetchTasks();
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error al crear la tarea');
    }
  };

  const handleUpdateTask = async (taskId, status) => {
    try {
      await axios.put(`http://localhost:8000/tasks/${taskId}`, { status });
      fetchTasks();
      toast.success('Estado de la tarea actualizado');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`);
      fetchTasks();
      toast.success('Tarea eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const handleStartEdit = (task) => {
    setEditingTask({ ...task });
    setOpenEditDialog(true);
  };

  const handleEditTask = async () => {
    if (!editingTask) return;
    try {
      await axios.put(`http://localhost:8000/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status
      });
      setOpenEditDialog(false);
      setEditingTask(null);
      fetchTasks();
      toast.success('Tarea actualizada exitosamente');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleMoveClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMoveClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleMoveTask = async (newStatus) => {
    if (!selectedTask) return;
    try {
      await axios.put(`http://localhost:8000/tasks/${selectedTask.id}`, {
        status: newStatus
      });
      fetchTasks();
      toast.success('Tarea movida exitosamente');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Error al mover la tarea');
    }
    handleMoveClose();
  };

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pendiente':
        return [{ status: 'en_progreso', label: 'En Progreso' }];
      case 'en_progreso':
        return [
          { status: 'pendiente', label: 'Pendiente' },
          { status: 'completada', label: 'Completada' }
        ];
      case 'completada':
        return [{ status: 'en_progreso', label: 'En Progreso' }];
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada':
        return '#4caf50';
      case 'en_progreso':
        return '#ff9800';
      default:
        return '#f44336';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pendiente': 'en_progreso',
      'en_progreso': 'completada',
      'completada': 'pendiente'
    };
    return statusFlow[currentStatus] || 'pendiente';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada'
    };
    return statusTexts[status] || status;
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="subtitle1" noWrap>
          {user.username || user.email}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => setShowNewTaskForm(true)}
          sx={{
            '&:hover': {
              bgcolor: '#64b5f6',
              color: 'white',
              cursor: 'pointer',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#1976d2' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText
            primary="Nueva Tarea"
            sx={{ color: '#1976d2' }}
          />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Tablero" />
        </ListItem>
        <ListItem button onClick={() => setShowUserList(!showUserList)}>
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="Usuarios" />
        </ListItem>
        <ListItem button onClick={onLogout}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" sx={{ color: 'error.main' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', bgcolor: '#f5f5f5' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          boxShadow: 'none',
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Tablero de Tareas
          </Typography>
          <IconButton color="inherit" onClick={() => setShowUserList(!showUserList)}>
            <Badge badgeContent={Object.keys(users).length} color="secondary">
              <GroupIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {['pendiente', 'en_progreso', 'completada'].map((status) => (
                <Grid 
                  item 
                  xs={12} 
                  md={4}
                  key={status}
                  sx={{
                    minWidth: { xs: '100%', md: '32%' },
                  }}
                >
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: 3,
                      height: '100%',
                      minHeight: 'calc(100vh - 300px)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: getStatusColor(status),
                        fontWeight: 'bold',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                      }}
                    >
                      <AssignmentIcon sx={{ color: getStatusColor(status) }} />
                      {getStatusText(status)}
                    </Typography>
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto',
                      maxHeight: 'calc(100vh - 350px)',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#888',
                        borderRadius: '4px',
                        '&:hover': {
                          background: '#666',
                        },
                      },
                    }}>
                      {tasks
                        .filter((task) => task.status === status)
                        .map((task) => (
                          <Card
                            key={task.id}
                            sx={{
                              mb: 2,
                              borderLeft: `4px solid ${getStatusColor(task.status)}`,
                              '&:hover': {
                                boxShadow: 6,
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease-in-out',
                              },
                            }}
                          >
                            <CardContent>
                              <Typography 
                                variant="h6" 
                                gutterBottom
                                sx={{ 
                                  fontSize: { xs: '1rem', sm: '1.25rem' },
                                  fontWeight: 'bold',
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Typography
                                color="textSecondary"
                                sx={{
                                  mb: 2,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                }}
                              >
                                {task.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    sx={{
                                      width: { xs: 28, sm: 32 },
                                      height: { xs: 28, sm: 32 },
                                      bgcolor: 'primary.main',
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    }}
                                  >
                                    {users[task.usuario_id]?.username?.[0]?.toUpperCase() || '?'}
                                  </Avatar>
                                  <Typography 
                                    variant="body2" 
                                    color="textSecondary"
                                    sx={{ 
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    }}
                                  >
                                    {users[task.usuario_id]?.username || 'Usuario'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMoveClick(e, task)}
                                    sx={{ mr: 1 }}
                                  >
                                    <ArrowForwardIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStartEdit(task)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    <DeleteIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          {showUserList && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 3,
                  mt: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon /> Usuarios del Sistema
                  </Typography>
                </Box>
                <UserList />
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* New Task Dialog */}
        <Dialog 
          open={showNewTaskForm} 
          onClose={() => setShowNewTaskForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Nueva Tarea</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Título"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNewTaskForm(false)}>Cancelar</Button>
            <Button onClick={handleCreateTask} variant="contained">
              Crear Tarea
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Tarea</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Título"
              type="text"
              fullWidth
              value={editingTask?.title || ''}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Descripción"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={editingTask?.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleEditTask} color="primary" variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menú para mover tareas */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMoveClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {selectedTask && getNextStatuses(selectedTask.status).map((option) => (
            <MenuItem 
              key={option.status} 
              onClick={() => handleMoveTask(option.status)}
              sx={{
                color: getStatusColor(option.status),
                '&:hover': {
                  backgroundColor: `${getStatusColor(option.status)}15`,
                },
              }}
            >
              <MenuItemIcon sx={{ color: 'inherit' }}>
                <ArrowForwardIcon />
              </MenuItemIcon>
              Mover a {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};

export default TaskBoard;
