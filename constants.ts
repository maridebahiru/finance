
import { UserRole, ProjectStatus, User, Department, Project } from './types';

export const COLORS = {
  primary: '#d3a200',
  darkRed: '#65081b',
  white: '#ffffff',
  black: '#000000'
};

/**
 * High-fidelity Base64 representation of the Ethiopian Generation Logo.
 * Institutional branding for the Finance Hub.
 */
export const LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNTYgNDhMMjQ0IDYwSDI2OEwyNTYgNDhaIiBmaWxsPSIjNjUwODFiIi8+CjxwYXRoIGQ9Ik0yNTYgNjBWOTJNMjQwIDc2SDI3MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjUwODFiIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjU2IDkyQzI3NS4zMyAxMDguNjcgMjkyIDEyOCAyOTIgMTI4SDIyMEMyMjAgMTA4LjY3IDIzNi42NyA5MiAyNTYgOTJaIiBmaWxsPSIjNjUwODFiIi8+CjxwYXRoIGQ9Ik0xNjAgMTQ0TDEzNiAyNzZIMzc2TDM1MiAxNDRIMTYwWiIgZmlsbD0IjY1MDgxYiIvPgo8cGF0aCBkPSJNMTYwIDE2MEgzNTJNMTYwIDE4MEgzNTJNMTYwIDIwMEgzNTJNMTYwIDIyMEgzNTJNMTYwIDI0MEgzNTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTM2IDI3NkMxMzYgMzA1LjMzIDE2Mi42NyAzMjYgMjU2IDMyNkMzNDkuMzMgMzI2IDM3NiAzMDUuMzMgMzc2IDI3NiIgc3Ryb2tlPSIjNjUwODFiIiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTk2IiBjeT0iMzcwIiByPSIzOCIgc3Ryb2tlPSIjNjUwODFiIiBzdHJva2Utd2lkdGg9IjgiLz4KPGNpcmNsZSBjeD0iMzE2IiBjeT0iMzcwIiByPSIzOCIgc3Ryb2tlPSIjNjUwODFiIiBzdHJva2Utd2lkdGg9IjgiLz4KPHRleHQgeD0iMjU2IiB5PSI0NDAiIGZpbGw9IiM2NTA4MWIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBL4YqV4YmH4YmI4Yuj4YitIOAInuAInuAInTwvRleHQ+Cjx0ZXh0IHg9IjI1NiIgeT0iNDgwIiBmaWxsPSIjNjUwODFiIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7hirXhiJ3hiJ3hiak8L3RleHQ+CjxyZWN0IHg9IjEyMCIgeT0iNDcyIiB3aWR0aD0iNzQiIGhlaWdodD0iMyIgZmlsbD0iIzY1MDgxYiIvPgo8cmVjdCB4PSIzMTgiIHk9IjQ3MiIgd2lkdGg9Ijc0IiBoZWlnaHQ9IjMiIGZpbGw9IiM2NTA4MWIiLz4KPC9zdmc+';

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
