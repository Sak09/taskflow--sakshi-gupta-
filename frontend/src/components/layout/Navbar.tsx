import { AppBar, Toolbar, Typography, Box, Button, Avatar, Menu, MenuItem, Divider, IconButton } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Logo */}
        <Box component={Link} to="/projects" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mr: 4 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 2,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TaskAltIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' } }}>
            TaskFlow
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* User menu */}
        {user && (
          <>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ borderRadius: 3, px: 1.5, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
              startIcon={
                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                  {initials}
                </Avatar>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, border: '1px solid', borderColor: 'divider' } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2, color: 'error.main' }}>
                <LogoutIcon fontSize="small" />
                <Typography variant="body2" fontWeight={500}>Sign out</Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
