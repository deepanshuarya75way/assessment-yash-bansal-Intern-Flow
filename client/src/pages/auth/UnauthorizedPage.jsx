import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Lock, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.9) 100%)',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'error.soft',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)',
          }}
        >
          <Lock sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#0f172a' }}>
          Access Restricted
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You do not have permission to access this module. Your current role restricts viewing this resource.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.2,
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          }}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default UnauthorizedPage;
