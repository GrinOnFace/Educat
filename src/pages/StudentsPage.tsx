import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Search, Person, Delete, Check, Close } from '@mui/icons-material';
import { AppLayout } from '../components';
import { studentService } from '../services/studentService';
import type { Student, StudentRequest } from '../services/studentService';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchData = async () => {
    if (!user?.id) {
      setError('Не удалось получить данные пользователя');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get student IDs and requests
      const [studentIds, requestsList] = await Promise.all([
        studentService.getTeacherStudents(user.id),
        studentService.getTeacherRequests(user.id),
      ]);

      // Fetch full profile for each student using the new endpoint
      const studentsData = await Promise.all(
        studentIds.map(id => studentService.getTeacherStudentProfile(id))
      );

      // Convert TeacherStudentProfile to Student format for compatibility
      const convertedStudents = studentsData.map(profile => ({
        id: profile.userId,
        name: profile.fullName,
        email: profile.user.email,
        avatar: profile.user.photoBase64,
      }));

      setStudents(convertedStudents);
      setRequests(requestsList);
    } catch (err) {
      setError('Произошла ошибка при загрузке данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStudent && user?.id) {
      try {
        await studentService.removeStudent(user.id, selectedStudent.id);
        setStudents(students.filter(s => s.id !== selectedStudent.id));
        setDeleteDialogOpen(false);
      } catch (err) {
        setError('Ошибка при удалении студента');
        console.error(err);
      }
    }
  };

  const handleRequestAction = async (requestId: number, accept: boolean) => {
    if (!user?.id) {
      setError('Не удалось получить данные пользователя');
      return;
    }

    try {
      if (accept) {
        await studentService.acceptRequest(requestId);
      } else {
        await studentService.rejectRequest(requestId);
      }
      // Refresh the requests list
      const newRequests = await studentService.getTeacherRequests(user.id);
      setRequests(newRequests);
    } catch (err) {
      setError(`Ошибка при ${accept ? 'принятии' : 'отклонении'} заявки`);
      console.error(err);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(request =>
    request.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <AppLayout onLogout={handleLogout}>
        <Container maxWidth='lg'>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ mb: 4 }}>
          <Typography variant='h4' gutterBottom>
            Управление учениками
          </Typography>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Поиск по имени...'
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label='Мои ученики' />
            <Tab label={`Заявки (${requests.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <List>
            {filteredStudents.map(student => (
              <Paper key={student.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={student.name} secondary={student.email} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge='end'
                      aria-label='delete'
                      onClick={() => handleDeleteClick(student)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
            {filteredStudents.length === 0 && (
              <Typography color='text.secondary' align='center'>
                Учеников не найдено
              </Typography>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {filteredRequests.map(request => (
              <Paper key={request.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.studentName}
                    secondary={`Запрос от ${format(new Date(request.requestDate), 'dd MMMM yyyy', { locale: ru })}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge='end'
                      aria-label='accept'
                      onClick={() => handleRequestAction(request.id, true)}
                      sx={{ color: 'success.main', mr: 1 }}
                    >
                      <Check />
                    </IconButton>
                    <IconButton
                      edge='end'
                      aria-label='reject'
                      onClick={() => handleRequestAction(request.id, false)}
                      sx={{ color: 'error.main' }}
                    >
                      <Close />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
            {filteredRequests.length === 0 && (
              <Typography color='text.secondary' align='center'>
                Заявок не найдено
              </Typography>
            )}
          </List>
        </TabPanel>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogContent>
            <Typography>
              Вы действительно хотите удалить ученика {selectedStudent?.name}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color='error'>
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
};

export default StudentsPage;
