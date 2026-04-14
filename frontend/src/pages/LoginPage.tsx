import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, Divider, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { getApiError } from '../utils/error';

interface FormData { email: string; password: string; }

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setApiError('');
    setLoading(true);
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.token);
      navigate('/projects');
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', p: 2,
      background: 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(139,92,246,0.06) 0%, transparent 50%)',
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3, mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <TaskAltIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.025em">Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to your TaskFlow account
          </Typography>
        </Box>

        <Card elevation={0}>
          <CardContent sx={{ p: 4 }}>
            {apiError && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{apiError}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                fullWidth
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                        {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 0.5, py: 1.4 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
                Create one
              </Link>
            </Typography>

            <Box sx={{ mt: 2.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} mb={0.5}>
                Demo credentials
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                demo@taskflow.dev / Password123!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
