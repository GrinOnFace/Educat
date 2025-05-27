import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Button,
  Avatar,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { School, Star, Send, Check } from '@mui/icons-material';
import { AppLayout } from '../components';
import { tutorService } from '../services/tutorService';
import { subjectService } from '../services/subjectService';
import type { TeacherProfile, TutorSearchParams } from '../services/tutorService';
import type { Subject } from '../services/subjectService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TutorSearchPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tutors, setTutors] = useState<TeacherProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<TeacherProfile | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [teacherStudents, setTeacherStudents] = useState<{ [key: number]: number[] }>({});

  // Filter states
  const [filters, setFilters] = useState<TutorSearchParams>({
    minPrice: 0,
    maxPrice: 5000,
    minExperience: 0,
    minRating: 0,
    subjectId: undefined,
  });

  const searchTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tutorService.searchTutors(filters);
      setTutors(result);
    } catch (err) {
      setError('Произошла ошибка при поиске репетиторов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tutorsData, subjectsData] = await Promise.all([
          tutorService.searchTutors(filters),
          subjectService.getSubjects()
        ]);
        setTutors(tutorsData);
        setSubjects(subjectsData);
        console.log('tutorsData', tutorsData);

        // Получаем студентов для каждого преподавателя
        const studentsData = await Promise.all(
          tutorsData.map(async teacher => ({
            teacherId: teacher.userId,
            students: await tutorService.getStudentTeachers(teacher.userId)
          }))
        );

        // Преобразуем в объект для удобного доступа
        const studentsMap = studentsData.reduce((acc, { teacherId, students }) => {
          acc[teacherId] = students;
          return acc;
        }, {} as { [key: number]: number[] });

        setTeacherStudents(studentsMap);
        console.log('teacherStudents', studentsMap);
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (field: keyof TutorSearchParams, value: number | undefined) => {
    setFilters((prev: TutorSearchParams) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendRequest = async (tutor: TeacherProfile) => {
    setSelectedTutor(tutor);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedTutor || !user?.id) {
      setError('Не удалось отправить заявку: нет данных пользователя');
      return;
    }

    try {
      await tutorService.sendRequest(selectedTutor.userId, user.id);
      setRequestSuccess(`Заявка репетитору ${selectedTutor.fullName} успешно отправлена`);
      setConfirmDialogOpen(false);
    } catch (err) {
      setError('Произошла ошибка при отправке заявки');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hasStudent = (teacherId: number, studentId: number) => {
    return teacherStudents[teacherId]?.includes(studentId);
  };

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        <Box sx={{ py: 4 }}>
          <Typography variant='h4' gutterBottom>
            Поиск репетиторов
          </Typography>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                <FormControl fullWidth>
                  <InputLabel>Предмет</InputLabel>
                  <Select
                    value={filters.subjectId || ''}
                    onChange={(e: SelectChangeEvent<string | number>) =>
                      handleFilterChange('subjectId', e.target.value as number)
                    }
                    label='Предмет'
                  >
                    <MenuItem value=''>Все предметы</MenuItem>
                    {subjects.map(subject => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                <Typography gutterBottom>Стоимость (₽/час)</Typography>
                <Slider
                  value={[filters.minPrice || 0, filters.maxPrice || 5000]}
                  onChange={(_, value) => {
                    const [min, max] = value as number[];
                    handleFilterChange('minPrice', min);
                    handleFilterChange('maxPrice', max);
                  }}
                  valueLabelDisplay='auto'
                  min={0}
                  max={5000}
                  step={100}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                <Typography gutterBottom>Минимальный опыт (лет)</Typography>
                <Slider
                  value={filters.minExperience || 0}
                  onChange={(_, value) => handleFilterChange('minExperience', value as number)}
                  valueLabelDisplay='auto'
                  min={0}
                  max={20}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                <Typography gutterBottom>Минимальный рейтинг</Typography>
                <Rating
                  value={filters.minRating || 0}
                  onChange={(_, value) => handleFilterChange('minRating', value || undefined)}
                  precision={0.5}
                />
              </Box>

              <Box sx={{ width: '100%' }}>
                <Button variant='contained' onClick={searchTutors} fullWidth>
                  Применить фильтры
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Status messages */}
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {requestSuccess && (
            <Alert severity='success' sx={{ mb: 2 }}>
              {requestSuccess}
            </Alert>
          )}

          {/* Tutors list */}
          {loading ? (
            <Box display='flex' justifyContent='center' p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {tutors.map(tutor => (
                <Box key={tutor.userId} sx={{ width: { xs: '100%', md: '45%', lg: '30%' } }}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={`data:image/jpeg;base64,${tutor.user.photoBase64}`}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        <School />
                      </Avatar>
                      <Box>
                        <Typography variant='h6'>{tutor.fullName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={tutor.rating} readOnly precision={0.5} size='small' />
                          <Typography variant='body2' sx={{ ml: 1 }}>
                            ({tutor.reviewsCount} отзывов)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      <strong>Образование:</strong> {tutor.education}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      <strong>Опыт:</strong> {tutor.experienceYears} лет
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      <strong>Стоимость:</strong> {tutor.hourlyRate} ₽/час
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      <strong>Контакты:</strong> {tutor.user.contactInfo}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      {tutor.subjects.map(subject => (
                        <Chip
                          key={subject.id}
                          label={subject.name}
                          size='small'
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>

                    <Button
                      variant='contained'
                      fullWidth
                      startIcon={hasStudent(tutor.userId, user?.id || 0) ? <Check /> : <Send />}
                      onClick={() => handleSendRequest(tutor)}
                      disabled={hasStudent(tutor.userId, user?.id || 0)}
                      sx={{
                        backgroundColor: hasStudent(tutor.userId, user?.id || 0) ? 'success.main' : undefined,
                        '&.Mui-disabled': {
                          backgroundColor: 'success.main',
                          color: 'white'
                        }
                      }}
                    >
                      {hasStudent(tutor.userId, user?.id || 0) ? 'Ваш репетитор' : 'Отправить заявку'}
                    </Button>
                  </Paper>
                </Box>
              ))}

              {tutors.length === 0 && !loading && (
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography color='text.secondary'>Репетиторов не найдено</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Подтверждение заявки</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы действительно хотите отправить заявку репетитору {selectedTutor?.fullName}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleConfirmRequest} variant='contained'>
              Отправить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AppLayout>
  );
};

export default TutorSearchPage;
