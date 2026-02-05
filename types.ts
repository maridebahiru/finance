
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FINANCE = 'FINANCE',
  USER = 'USER'
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  active: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  budgetCap: number;
}

export interface Receipt {
  id: string;
  fileName: string;
  amount: number;
  date: string;
  url: string; // Used for Base64 data or external URL
  mimeType: string;
}

export interface ProgressUpdate {
  id: string;
  description: string;
  percentage: number;
  date: string;
  associatedExpenseId?: string; // Links progress to a specific receipt
}

export interface Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  departmentId: string;
  requestedBudget: number;
  approvedBudget: number;
  spentBudget: number;
  status: ProjectStatus;
  receipts: Receipt[];
  progressUpdates: ProgressUpdate[];
  createdAt: string;
  deadline: string; // ISO String for the expected completion date
  approvedAt?: string;
  completedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
