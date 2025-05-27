import { Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
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
        <Link to='/login' style={{ color: 'black', marginRight: "20px", textDecoration: 'none' }}>
          Войти
        </Link>
        <Link to='/register' style={{ color: 'black', textDecoration: 'none' }}>
          Регистрация
        </Link>
      </Box>
    </Box>
  );
};

export default PublicHeader;
