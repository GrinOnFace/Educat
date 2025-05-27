import { Box, Button, Container, Link, Typography } from '@mui/material';
import { PublicLayout } from '../components';

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
          <Button component={Link} href='/#/login' variant='contained' color='primary' size='large'>
            Войти
          </Button>
          <Button component={Link} href='/#/register' variant='outlined' color='primary' size='large'>
            Зарегистрироваться
          </Button>
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default HomePage;
