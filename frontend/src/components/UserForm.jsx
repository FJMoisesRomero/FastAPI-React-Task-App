import { useState, useEffect } from 'react'
import { 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid
} from '@mui/material'

const UserForm = ({ editingUser, setEditingUser, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    city: ''
  })

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser)
    }
  }, [editingUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await fetch(`http://localhost:8000/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('http://localhost:8000/users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }
      
      setFormData({
        name: '',
        email: '',
        age: '',
        city: ''
      })
      setEditingUser(null)
      onUserAdded()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Edad"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ciudad"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {editingUser && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingUser(null)
                    setFormData({
                      name: '',
                      email: '',
                      age: '',
                      city: ''
                    })
                  }}
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                variant="contained"
                color="primary"
              >
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export default UserForm
