import { AppBar, Box, Button, Toolbar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Book,
  CalendarMonth,
  Person,
  School,
  Search,
  Add as AddIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

interface AppHeaderProps {
  onLogout?: () => void;
}

const AppHeader = ({ onLogout }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.roles[0] === 'TEACHER';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  const StudentNavItems = () => (
    <>
      <Button component={Link} to='/dashboard' color='inherit' startIcon={<School />}>
        Главная
      </Button>
      <Button component={Link} to='/search' color='inherit' startIcon={<Search />}>
        Поиск репетиторов
      </Button>
      <Button component={Link} to='/schedule' color='inherit' startIcon={<CalendarMonth />}>
        Расписание
      </Button>
    </>
  );

  const TeacherNavItems = () => (
    <>
      <Button component={Link} to='/dashboard' color='inherit' startIcon={<School />}>
        Главная
      </Button>
      <Button component={Link} to='/lessons' color='inherit' startIcon={<Book />}>
        Мои уроки
      </Button>
      <Button component={Link} to='/create-lesson' color='inherit' startIcon={<AddIcon />}>
        Создать урок
      </Button>
      <Button component={Link} to='/schedule' color='inherit' startIcon={<CalendarMonth />}>
        Расписание
      </Button>
      <Button component={Link} to='/students' color='inherit' startIcon={<GroupIcon />}>
        Ученики
      </Button>
    </>
  );

  return (
    <AppBar position='static' color='default' sx={{ backgroundColor: 'transparent', boxShadow: '0px 2px rgba(0, 0, 0, 0.1)' }} elevation={1}>
      <Toolbar>
        <Box sx={{ mr: 4 }} onClick={() => navigate('/dashboard')}>
          <Logo />
        </Box>

        {isTeacher ? <TeacherNavItems /> : <StudentNavItems />}

        <Box sx={{ flexGrow: 1 }} />

        <Button component={Link} to='/profile' color='inherit' startIcon={<Person />}>
          Профиль
        </Button>
        <Button color='inherit' onClick={handleLogout} startIcon={<LogoutIcon />}>
          Выйти
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
