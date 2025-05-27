import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { PublicLayout, FormContainer } from '../components';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.login, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Ошибка при входе. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <FormContainer>
        <Typography component='h1' variant='h4' align='center' gutterBottom>
          Вход в систему
        </Typography>

        {error && (
          <Alert severity='error' sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Typography variant='body2' align='left' sx={{ mb: 1 }}>
            Логин
          </Typography>
          <TextField
            margin='normal'
            required
            fullWidth
            id='login'
            name='login'
            value={formData.login}
            onChange={handleChange}
            placeholder='user@example.com'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Person />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <Typography variant='body2' align='left' sx={{ mb: 1 }}>
            Пароль
          </Typography>
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            type={showPassword ? 'text' : 'password'}
            id='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='••••••••'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword(!showPassword)}
                    edge='end'
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            sx={{ mt: 2, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 500 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Войти'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to='/register' style={{ color: 'black', textDecoration: 'underline' }}>
              Нет аккаунта? Зарегистрируйтесь
            </Link>
          </Box>
        </Box>
      </FormContainer>
    </PublicLayout>
  );
};

export default LoginPage;
