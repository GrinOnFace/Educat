import api from './api';
import type { User } from './authService';

export interface StudentProfile {
  userId: number;
  fullName: string;
  user: User;
}

export interface TeacherProfile {
  userId: number;
  fullName: string;
  education: string;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  photoBase64: string;
  preparationPrograms: Program[];
  subjects: Subject[];
  user: User;
}

export interface UpdateStudentRequest {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  gender: string;
  contactInfo: string;
  photoBase64: string;
}

export interface UpdateTeacherRequest {
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: string;
  gender: string;
  contactInfo: string;
  education: string;
  experienceYears: number;
  hourlyRate: number;
  subjectIds: number[];
  preparationProgramIds: number[];
  photoBase64: string;
}

export interface StudentStatistics {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  teachersCount: number;
  lessonsBySubject: Record<string, number>;
  totalLessonHours: number;
}

export interface TeacherStatistics {
  totalStudents: number;
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  rating: number;
  reviewsCount: number;
  lessonsBySubject: Record<string, number>;
  ratingDistribution: Record<string, number>;
}

export interface TeacherRating {
  rating: number;
  reviewsCount: number;
}

export interface Review {
  id: number;
  lessonId: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Program {
  id: number;
  name: string;
  description: string;
}

export interface Subject {
  id: number;
  name: string;
}

export const getStudentProfile = async (studentId: number): Promise<StudentProfile> => {
  const response = await api.get(`/Student/profile/${studentId}`);
  return response.data;
};

export const getTeacherProfile = async (teacherId: number): Promise<TeacherProfile> => {
  const response = await api.get(`/Teacher/profile/${teacherId}`);
  return response.data;
};

export const updateStudentProfile = async (
  studentId: number,
  data: UpdateStudentRequest
): Promise<StudentProfile> => {
  const response = await api.put(`/Student/profile/${studentId}`, data);
  return response.data;
};

export const updateTeacherProfile = async (
  teacherId: number,
  data: UpdateTeacherRequest
): Promise<TeacherProfile> => {
  const response = await api.put(`/Teacher/profile/${teacherId}`, data);
  return response.data;
};

export const getStudentStatistics = async (studentId: number): Promise<StudentStatistics> => {
  const response = await api.get(`/Student/${studentId}/statistics`);
  console.log('getStudentStatistics', response.data);
  return response.data;
};

export const getTeacherStatistics = async (teacherId: number): Promise<TeacherStatistics> => {
  const response = await api.get(`/Teacher/${teacherId}/statistics`);
  console.log('getTeacherStatistics', response.data);
  return response.data;
};

export const getTeacherRating = async (teacherId: number): Promise<TeacherRating> => {
  const response = await api.get(`/Teacher/${teacherId}/rating`);
  return response.data;
};

export const getTeacherReviews = async (teacherId: number): Promise<Review[]> => {
  const response = await api.get(`/Teacher/${teacherId}/reviews`);
  console.log('getTeacherReviews', response.data);
  return response.data;
};

export const getStudentTeachers = async (studentId: number): Promise<number[]> => {
  const response = await api.get(`/Student/${studentId}/teachers`);
  return response.data;
};
