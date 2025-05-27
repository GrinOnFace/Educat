import api from './api';

export interface PreparationProgram {
  id: number;
  name: string;
  description: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  gender: string;
  contactInfo: string;
  isTeacher: boolean;
  roles: string[];
  photoBase64: string;
}

export interface TeacherProfile {
  userId: number;
  fullName: string;
  education: string;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  preparationPrograms: PreparationProgram[];
  subjects: Subject[];
  user: User;
}

export interface TutorSearchParams {
  subjectId?: number;
  minPrice?: number;
  maxPrice?: number;
  minExperience?: number;
  minRating?: number;
}

export const tutorService = {
  // Search tutors with filters
  searchTutors: async (params: TutorSearchParams): Promise<TeacherProfile[]> => {
    const response = await api.get('/Student/search-tutors', { params });
    console.log('searchTutors', response.data);
    return response.data;
  },

  // Get teacher profile by ID
  getTeacherProfile: async (teacherId: number): Promise<TeacherProfile> => {
    const response = await api.get(`/api/Student/teacher-profile/${teacherId}`);
    return response.data;
  },

  // Send request to tutor
  sendRequest: async (teacherId: number, studentId: number): Promise<void> => {
    await api.post(`/Student/send-request/${teacherId}`, null, {
      params: { studentId },
    });
  },

  getStudentTeachers: async (teacherId: number): Promise<number[]> => {
    const response = await api.get(`/Teacher/${teacherId}/students`);
    return response.data;
  },
};
