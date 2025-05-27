import { Box, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';

const PublicHeader = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Box
      component='header'
      sx={{
        py: 2,
        px: { xs: 2, md: 6 },
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Logo />

      <Box>
        <Button href='/login' color={isLoginPage ? 'primary' : 'inherit'} sx={{ mr: 2 }}>
          Войти
        </Button>
        <Button href='/register' color={!isLoginPage ? 'primary' : 'inherit'}>
          Регистрация
        </Button>
      </Box>
    </Box>
  );
};

export default PublicHeader;
