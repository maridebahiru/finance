
import { User, Project, Department, ProjectStatus } from '../types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_DEPARTMENTS } from '../constants';

const KEYS = {
  USERS: 'fms_users',
  PROJECTS: 'fms_projects',
  DEPARTMENTS: 'fms_departments',
  AUTH: 'fms_auth_user'
};

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getProjects: (): Project[] => {
    const data = localStorage.getItem(KEYS.PROJECTS);
    return data ? JSON.parse(data) : INITIAL_PROJECTS;
  },
  saveProjects: (projects: Project[]) => {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  },
  getDepartments: (): Department[] => {
    const data = localStorage.getItem(KEYS.DEPARTMENTS);
    return data ? JSON.parse(data) : INITIAL_DEPARTMENTS;
  },
  saveDepartments: (depts: Department[]) => {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts));
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
    else localStorage.removeItem(KEYS.AUTH);
  }
};
