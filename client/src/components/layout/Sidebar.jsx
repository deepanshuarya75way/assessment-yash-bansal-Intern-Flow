import React from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Typography, Box, Divider, useTheme, Tooltip
} from '@mui/material';
import {
  Dashboard, Assignment, Group, Assessment, WorkOutline,
  Place, BarChart
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard',  icon: <Dashboard />,   path: '/dashboard' },
  { text: 'Projects',   icon: <Group />,        path: '/projects'  },
  { text: 'My Tasks',   icon: <Assignment />,   path: '/tasks'     },
  { text: 'Internship', icon: <WorkOutline />,  path: '/internship'},
  { text: 'Analytics',  icon: <Assessment />,   path: '/analytics' },
  { text: 'Placement',  icon: <Place />,        path: '/placement' },
  { text: 'Reports',    icon: <BarChart />,     path: '/reports'   },
];

const Sidebar = () => {
  const theme = useTheme();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const { user } = useAuth();
  const roleName = (user?.role || user?.role_name || '').toLowerCase().replace(' ', '_');
  const isAdmin = ['admin', 'super_admin'].includes(roleName);
  
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) {
      // Admins have access to ALL modules
      return true;
    }
    if (roleName === 'student' || roleName === 'intern') {
      // Interns see Dashboard, Projects, My Tasks, Internship, Analytics, and Placement
      return ['Dashboard', 'Projects', 'My Tasks', 'Internship', 'Analytics', 'Placement'].includes(item.text);
    }
    if (roleName === 'team_lead') {
      // Team leads see Dashboard, Projects, My Tasks, and Reports
      return ['Dashboard', 'Projects', 'My Tasks', 'Reports'].includes(item.text);
    }
    if (roleName === 'mentor') {
      // Mentors see Dashboard, Projects, My Tasks, Internship, Analytics, and Reports
      return ['Dashboard', 'Projects', 'My Tasks', 'Internship', 'Analytics', 'Reports'].includes(item.text);
    }
    if (roleName === 'placement_coordinator' || roleName === 'coordinator') {
      // Coordinators see Dashboard, Projects, Internship, Analytics, Placement, and Reports
      return ['Dashboard', 'Projects', 'Internship', 'Analytics', 'Placement', 'Reports'].includes(item.text);
    }
    return true;
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? DRAWER_WIDTH : 72,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          px: sidebarOpen ? 3 : 0,
          transition: 'padding 0.2s',
        }}
      >
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          sx={{
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          InternFlow
        </Typography>
        {!sidebarOpen && (
          <Typography variant="h6" color="primary" fontWeight="bold">
            IF
          </Typography>
        )}
      </Box>

      <Divider />

      <List sx={{ px: sidebarOpen ? 1.5 : 1, pt: 2 }}>
        {filteredMenuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={sidebarOpen ? '' : item.text}
            placement="right"
            arrow
          >
            <ListItem
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: 'text.primary',
                textDecoration: 'none',
                minHeight: 44,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: sidebarOpen ? 1.5 : 1,
                '&:hover': { bgcolor: 'action.hover' },
                '&.active': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(99,102,241,0.18)'
                    : 'rgba(99,102,241,0.10)',
                  color: 'primary.main',
                  fontWeight: 700,
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 1.5 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s' }}
                primaryTypographyProps={{ fontWeight: 'inherit', fontSize: '0.9rem' }}
              />
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
