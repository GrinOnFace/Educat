import api from './api';

export interface Subject {
  id: number;
  name: string;
}

export const subjectService = {
  getSubjects: async (): Promise<Subject[]> => {
    const response = await api.get('/Dictionary/subjects');
    return response.data;
  },
};
