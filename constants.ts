import { UserRole, ProjectStatus, User, Department, Project } from './types';
import ejatLogo from './assets/ejat.png'; // ✅ ADD THIS

export const COLORS = {
  primary: '#d3a200',
  darkRed: '#65081b',
  white: '#ffffff',
  black: '#000000'
};

/**
 * Ethiopian Janderebaw Generation Logo
 * Institutional branding for the Finance Hub.
 */
export const LOGO_URL = ejatLogo; // ✅ REPLACED Base64 with imported image

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept1', name: 'Executive Administration', budgetCap: 5000000 }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    name: 'System Admin',
    email: 'admin@system.com',
    role: UserRole.SUPER_ADMIN,
    departmentId: 'dept1',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PROJECTS: Project[] = [];
