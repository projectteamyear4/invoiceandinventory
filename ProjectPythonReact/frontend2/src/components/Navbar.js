// components/Navbar.js
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

/** @type {{ text: string; path: string; icon: React.ReactNode }[]} */
const mainNavItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'About', path: '/about', icon: <InfoIcon /> },
  { text: 'Create', path: '/create', icon: <InfoIcon /> },
];

/** @type {{ text: string; path: string; icon: React.ReactNode }[]} */
const secondaryNavItems = [
  { text: 'All mail', path: '#', icon: <InboxIcon /> },
  { text: 'Trash', path: '#', icon: <MailIcon /> },
  { text: 'Spam', path: '#', icon: <InboxIcon /> },
];

/**
 * @param {Object} props
 * @param {() => Window} [props.window]
 * @param {string} props.currentPath - The current active path
 */
export default function Navbar({ window, currentPath }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ bgcolor: '#1976d2', color: 'white' }}>
        <Typography variant="h6" noWrap>
          My App
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ bgcolor: '#f5f5f5' }}>
        {mainNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={item.path === currentPath}
              sx={{
                '&:hover': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                },
                '&.Mui-selected': {
                  bgcolor: '#bbdefb',
                  color: '#1976d2',
                  '&:hover': {
                    bgcolor: '#90caf9',
                  },
                },
                py: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.path === currentPath ? '#1976d2' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.path === currentPath ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ bgcolor: '#f5f5f5' }}>
        {secondaryNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                '&:hover': {
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                },
                py: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#1976d2',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&: hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            My Application
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            },
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: '#fafafa',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {/* Added Test Content */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: '#1976d2',
              fontWeight: 500,
            }}
          >
            Welcome to the App
          </Typography>
          <Typography 
            variant="body1" 
            paragraph
            sx={{ 
              color: '#666',
              lineHeight: 1.6,
            }}
          >
            This is a test content area. You can navigate using the sidebar to visit different pages:
            Home, About, and Create. The navigation highlights the active page and provides a
            responsive experience for both mobile and desktop views.
          </Typography>
          <Box
            sx={{
              bgcolor: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              mt: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Test Card
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a sample card component to demonstrate content styling.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}