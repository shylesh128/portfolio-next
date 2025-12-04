import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, TextField, Button, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
// import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { MdDelete, MdEdit } from 'react-icons/md';

interface Item {
  id: number;
  name: string;
}

interface TestPageProps {
  serverTime: string;
}

export default function TestPage({ serverTime }: TestPageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Fetch items on load
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/test-crud');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    try {
      await axios.post('/api/test-crud', { name: newItemName });
      setNewItemName('');
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.name.trim()) return;
    try {
      await axios.put('/api/test-crud', { id: editingItem.id, name: editingItem.name });
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await axios.delete(`/api/test-crud?id=${id}`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Server-Side & CRUD Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="body1">
          <strong>Server Rendered Time:</strong> {serverTime}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          This timestamp confirms getServerSideProps is running.
        </Typography>
      </Paper>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          label="New Item Name"
          variant="outlined"
          size="small"
          fullWidth
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddItem}>
          Add
        </Button>
      </Box>

      <List>
        {items.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <Box>
                <IconButton edge="end" aria-label="edit" onClick={() => setEditingItem(item)} sx={{ mr: 1 }}>
                  <MdEdit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item.id)}>
                  <MdDelete />
                </IconButton>
              </Box>
            }
          >
            {editingItem?.id === item.id ? (
              <Box sx={{ display: 'flex', gap: 1, width: '100%', mr: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
                <Button variant="contained" size="small" color="success" onClick={handleUpdateItem}>
                  Save
                </Button>
                <Button variant="outlined" size="small" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <ListItemText primary={item.name} secondary={`ID: ${item.id}`} />
            )}
          </ListItem>
        ))}
      </List>
      
      {items.length === 0 && (
        <Typography variant="body2" color="textSecondary" align="center">
          No items found. Add one above!
        </Typography>
      )}
    </Container>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      serverTime: new Date().toISOString(),
    },
  };
}
