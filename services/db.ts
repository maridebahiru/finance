
// Use named import for Dexie class to ensure all instance methods like version() are correctly inherited
import { Dexie, type EntityTable } from 'dexie';
import { User, Project, Department } from '../types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_DEPARTMENTS } from '../constants';

class FinanceDB extends Dexie {
  users!: EntityTable<User, 'id'>;
  projects!: EntityTable<Project, 'id'>;
  departments!: EntityTable<Department, 'id'>;
  session!: EntityTable<{ id: string; user: User }, 'id'>;
  logs!: EntityTable<{ id: string; type: string; timestamp: string; metadata?: any }, 'id'>;

  constructor() {
    super('FinanceManagementDB');
    // Define the database schema using the version() method inherited from Dexie.
    (this as any).version(2).stores({
      users: 'id, email, role, departmentId',
      projects: 'id, userId, departmentId, status',
      departments: 'id, name',
      session: 'id',
      logs: 'id, type, timestamp'
    });
  }
}

export const db = new FinanceDB();

export const initDB = async () => {
  const userCount = await db.users.count();
  if (userCount === 0) {
    await db.users.bulkAdd(INITIAL_USERS);
    await db.projects.bulkAdd(INITIAL_PROJECTS);
    await db.departments.bulkAdd(INITIAL_DEPARTMENTS);
  }
};

export const auth = {
  getCurrentUser: async () => {
    const s = await db.session.get('current');
    return s ? s.user : null;
  },
  login: async (email: string) => {
    const user = await db.users.where('email').equals(email).first();
    if (user && user.active) {
      await db.session.put({ id: 'current', user });
      return user;
    }
    return null;
  },
  logout: async () => {
    await db.session.delete('current');
  }
};
