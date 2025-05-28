import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Divider,
  Alert,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  IconButton,
  Chip,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Edit, Save, Cancel, Delete } from '@mui/icons-material';
import { AppLayout } from '../components';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import {
  getStudentProfile,
  getTeacherProfile,
  updateStudentProfile,
  updateTeacherProfile,
  getStudentStatistics,
  getTeacherStatistics,
  getTeacherRating,
  getTeacherReviews,
  getStudentTeachers,
} from '../services/profileService';
import type {
  StudentProfile,
  TeacherProfile,
  UpdateStudentRequest,
  UpdateTeacherRequest,
  StudentStatistics,
  TeacherStatistics,
  TeacherRating,
  Review,
} from '../services/profileService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | TeacherProfile | null>(null);
  const [statistics, setStatistics] = useState<StudentStatistics | TeacherStatistics | null>(null);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [rating, setRating] = useState<TeacherRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editForm, setEditForm] = useState<UpdateStudentRequest | UpdateTeacherRequest>({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    gender: '',
    contactInfo: '',
    photoBase64: '',
  });

  const { user, logout } = useAuth();
  const isTeacher = user?.roles[0] === 'TEACHER';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          if (isTeacher) {
            const [profileData, statsData, ratingData, reviewsData] = await Promise.all([
              getTeacherProfile(user.id),
              getTeacherStatistics(user.id),
              getTeacherRating(user.id),
              getTeacherReviews(user.id),
            ]);
            setProfile(profileData);
            setStatistics(statsData);
            setRating(ratingData);
            setReviews(reviewsData);
            setEditForm({
              ...getTeacherEditForm(profileData),
              subjectIds: profileData.subjects.map(s => s.id),
              preparationProgramIds: profileData.preparationPrograms.map(p => p.id),
            });
          } else {
            const [profileData, statsData, teacherIds] = await Promise.all([
              getStudentProfile(user.id),
              getStudentStatistics(user.id),
              getStudentTeachers(user.id),
            ]);
            setProfile(profileData);
            setStatistics(statsData);
            const teacherProfiles = await Promise.all(teacherIds.map(id => getTeacherProfile(id)));
            setTeachers(teacherProfiles);
            setEditForm(getStudentEditForm(profileData));
          }
        }
      } catch (err) {
        setError('Не удалось загрузить данные профиля');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, isTeacher]);

  const getTeacherEditForm = (profileData: TeacherProfile): UpdateTeacherRequest => {
    const nameParts = profileData.fullName.split(' ');
    return {
      lastName: nameParts[0] || '',
      firstName: nameParts[1] || '',
      middleName: nameParts[2] || '',
      birthDate: profileData.user.birthDate,
      gender: profileData.user.gender,
      contactInfo: profileData.user.contactInfo || '',
      education: profileData.education,
      experienceYears: profileData.experienceYears,
      hourlyRate: profileData.hourlyRate,
      subjectIds: profileData.subjects.map(s => s.id),
      preparationProgramIds: profileData.preparationPrograms.map(p => p.id),
      photoBase64: profileData.photoBase64,
    };
  };

  const getStudentEditForm = (profileData: StudentProfile): UpdateStudentRequest => {
    const nameParts = profileData.fullName.split(' ');
    return {
      lastName: nameParts[0] || '',
      firstName: nameParts[1] || '',
      middleName: nameParts[2] || '',
      birthDate: profileData.user.birthDate,
      gender: profileData.user.gender,
      contactInfo: profileData.user.contactInfo || '',
      photoBase64: profileData.user.photoBase64 || '',
    };
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (profile) {
      if (isTeacher && 'education' in profile) {
        setEditForm(getTeacherEditForm(profile as TeacherProfile));
      } else {
        setEditForm(getStudentEditForm(profile as StudentProfile));
      }
    }
    setError(null);
  };

  const handleSaveClick = async () => {
    try {
      if (user?.id) {
        if (isTeacher) {
          const updatedProfile = await updateTeacherProfile(
            user.id,
            editForm as UpdateTeacherRequest
          );
          setProfile(updatedProfile);
        } else {
          const updatedProfile = await updateStudentProfile(
            user.id,
            editForm as UpdateStudentRequest
          );
          setProfile(updatedProfile);
        }
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      setError('Не удалось обновить профиль');
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const TeacherStatisticsSection = () => {
    const teacherStats = statistics as TeacherStatistics;
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Статистика
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          <ListItem>
            <ListItemText primary='Всего учеников' secondary={teacherStats.totalStudents} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Всего уроков' secondary={teacherStats.totalLessons} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Завершено уроков' secondary={teacherStats.completedLessons} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Предстоящие уроки' secondary={teacherStats.upcomingLessons} />
          </ListItem>
        </List>
        {teacherStats.ratingDistribution &&
          Object.keys(teacherStats.ratingDistribution).length > 0 && (
            <>
              <Typography variant='subtitle1' sx={{ mt: 2, mb: 1 }}>
                Распределение оценок:
              </Typography>
              <List dense>
                {Object.entries(teacherStats.ratingDistribution).map(([rating, count]) => (
                  <ListItem key={rating}>
                    <ListItemText
                      primary={`${rating} звезд`}
                      secondary={`${count} ${count === 1 ? 'отзыв' : count < 5 ? 'отзыва' : 'отзывов'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
      </Paper>
    );
  };

  const TeacherProfileInfo = () => {
    const teacherProfile = profile as TeacherProfile;
    return (
      <>
        <TextField
          fullWidth
          label='Образование'
          value={
            isEditing ? (editForm as UpdateTeacherRequest).education : teacherProfile.education
          }
          onChange={handleChange('education')}
          disabled={!isEditing}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label='Опыт преподавания (лет)'
            type='number'
            value={
              isEditing
                ? (editForm as UpdateTeacherRequest).experienceYears
                : teacherProfile.experienceYears
            }
            onChange={handleChange('experienceYears')}
            disabled={!isEditing}
          />
          <TextField
            fullWidth
            label='Стоимость занятия (₽/час)'
            type='number'
            value={
              isEditing ? (editForm as UpdateTeacherRequest).hourlyRate : teacherProfile.hourlyRate
            }
            onChange={handleChange('hourlyRate')}
            disabled={!isEditing}
          />
        </Box>
        <Typography variant='subtitle1' gutterBottom>
          Предметы:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {teacherProfile.subjects.map(subject => (
            <Chip key={subject.id} label={subject.name} />
          ))}
        </Box>
        <Typography variant='subtitle1' gutterBottom>
          Программы подготовки:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {teacherProfile.preparationPrograms.map(program => (
            <Chip key={program.id} label={program.name} />
          ))}
        </Box>
      </>
    );
  };

  const ReviewsSection = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant='h6' gutterBottom>
        Отзывы
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {reviews.length > 0 ? (
        <List>
          {reviews.map(review => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant='subtitle1'>{review.studentName}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ru })}
                  </Typography>
                </Box>
                <Rating value={review.rating} readOnly size='small' sx={{ mb: 1 }} />
                <Typography variant='body2'>{review.comment}</Typography>
              </CardContent>
            </Card>
          ))}
        </List>
      ) : (
        <Typography variant='body2' color='text.secondary'>
          Пока нет отзывов
        </Typography>
      )}
    </Paper>
  );

  const StudentStatisticsSection = () => {
    const studentStats = statistics as StudentStatistics;
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Статистика
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          <ListItem>
            <ListItemText primary='Всего уроков' secondary={studentStats.totalLessons} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Завершено уроков' secondary={studentStats.completedLessons} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Предстоящие уроки' secondary={studentStats.upcomingLessons} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Количество репетиторов' secondary={studentStats.teachersCount} />
          </ListItem>
          <ListItem>
            <ListItemText primary='Всего часов занятий' secondary={studentStats.totalLessonHours} />
          </ListItem>
        </List>
      </Paper>
    );
  };

  const TeachersSection = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant='h6' gutterBottom>
        Мои репетиторы
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {teachers.map(teacher => (
          <ListItem
            key={teacher.userId}
            alignItems='flex-start'
          >
            <ListItemAvatar>
              <Avatar
                src={
                  teacher.user.photoBase64 ? `data:image/jpeg;base64,${teacher.user.photoBase64}` : undefined
                }
                alt={teacher.fullName}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography component='span' variant='subtitle1'>
                    {teacher.fullName}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography component='span' variant='body2' color='text.primary' display='block'>
                    {teacher.subjects.map(s => s.name).join(', ')}
                  </Typography>
                  <Typography component='span' variant='body2' color='text.secondary'>
                    Опыт: {teacher.experienceYears} лет • {teacher.hourlyRate} ₽/час
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  if (loading) {
    return (
      <AppLayout>
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <Container maxWidth='lg'>
          <Alert severity='error'>Профиль не найден</Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout onLogout={handleLogout}>
      <Container maxWidth='lg'>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: { xs: '100%', md: '30%' } }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={
                  profile.user.photoBase64 ? `data:image/jpeg;base64,${profile.user.photoBase64}` : undefined
                }
                alt={profile.fullName}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant='h5' gutterBottom>
                {profile.fullName}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {isTeacher ? 'Преподаватель' : 'Ученик'}
              </Typography>
              <Button
                variant='outlined'
                startIcon={isEditing ? <Save /> : <Edit />}
                onClick={isEditing ? handleSaveClick : handleEditClick}
              >
                {isEditing ? 'Сохранить' : 'Редактировать профиль'}
              </Button>
              {isEditing && (
                <Button
                  variant='text'
                  startIcon={<Cancel />}
                  onClick={handleCancelClick}
                >
                  Отменить
                </Button>
              )}
            </Paper>

            {isTeacher ? <TeacherStatisticsSection /> : <StudentStatisticsSection />}
          </Box>

          <Box sx={{ width: { xs: '100%', md: '65%' } }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant='h6' gutterBottom>
                Личная информация
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {isEditing ? (
                  <>
                    <TextField
                      fullWidth
                      label='Фамилия'
                      value={editForm.lastName}
                      onChange={handleChange('lastName')}
                    />
                    <TextField
                      fullWidth
                      label='Имя'
                      value={editForm.firstName}
                      onChange={handleChange('firstName')}
                    />
                    <TextField
                      fullWidth
                      label='Отчество'
                      value={editForm.middleName}
                      onChange={handleChange('middleName')}
                    />
                  </>
                ) : (
                  <TextField fullWidth label='ФИО' value={profile.fullName} disabled />
                )}

                <TextField fullWidth label='Email' value={profile.user.email} disabled />

                <TextField
                  fullWidth
                  label='Дата рождения'
                  type={isEditing ? 'date' : 'text'}
                  value={
                    isEditing
                      ? editForm.birthDate
                      : profile?.user?.birthDate
                        ? format(new Date(profile.user.birthDate), 'dd MMMM yyyy', { locale: ru })
                        : ''
                  }
                  onChange={handleChange('birthDate')}
                  disabled={!isEditing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  fullWidth
                  select={isEditing}
                  label='Пол'
                  value={isEditing ? editForm.gender : profile?.user?.gender || ''}
                  onChange={handleChange('gender')}
                  disabled={!isEditing}
                >
                  {isEditing && [
                    <MenuItem key='male' value='male'>
                      Мужской
                    </MenuItem>,
                    <MenuItem key='female' value='female'>
                      Женский
                    </MenuItem>,
                  ]}
                </TextField>

                <TextField
                  fullWidth
                  label='Контактная информация'
                  multiline
                  rows={4}
                  value={
                    isEditing
                      ? editForm.contactInfo
                      : profile?.user?.contactInfo || ''
                  }
                  onChange={handleChange('contactInfo')}
                  disabled={!isEditing}
                  placeholder='Укажите ваши контактные данные (телефон, социальные сети и т.д.)'
                />

                {isTeacher && <TeacherProfileInfo />}
              </Box>
            </Paper>

            {isTeacher ? <ReviewsSection /> : <TeachersSection />}
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ProfilePage;
