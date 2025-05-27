import { Box, Button, Container, Typography } from '@mui/material';
import { PublicLayout } from '../components';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <PublicLayout>
      <Container
        maxWidth='md'
        sx={{
          flex: 1,
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Typography
          variant='h2'
          component='h1'
          align='center'
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Добро пожаловать в EduCat
        </Typography>

        <Typography variant='h5' component='p' align='center' color='text.secondary' sx={{ mb: 4 }}>
          Ваш надежный помощник в подготовке к экзаменам
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Link to='/login' style={{ color: 'black', textDecoration: 'none', padding: '10px 20px', borderRadius: '5px'}}>
            Войти
          </Link>
          <Link to='/register' style={{ color: 'black', textDecoration: 'none', padding: '10px 20px', borderRadius: '5px', backgroundColor: '#ffa500' }}>
            Зарегистрироваться
          </Link>
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default HomePage;
