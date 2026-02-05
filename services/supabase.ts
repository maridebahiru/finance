
import { createClient } from '@supabase/supabase-js';
import { User, Project, Department, ProjectStatus, Receipt, ProgressUpdate, UserRole } from '../types';

const supabaseUrl = 'https://vgubtzdnimaguwaqzlpa.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZndWJ0emRuaW1hZ3V3YXF6bHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTcxODksImV4cCI6MjA4MDMzMzE4OX0.LPWuQwLbQrkMFdRTbNYdGzBv-yj3CZfl8Oyv9aDsDfw';

export const supabase = createClient(supabaseUrl, supabaseKey);

const mapProject = (p: any): Project => ({
  id: p.id,
  title: p.title,
  description: p.description,
  userId: p.user_id,
  departmentId: p.department_id,
  requestedBudget: Number(p.requested_budget || 0),
  approvedBudget: Number(p.approved_budget || 0),
  spentBudget: Number(p.spent_budget || 0),
  status: p.status as ProjectStatus,
  receipts: (p.receipts || []).map((r: any) => ({
    id: r.id,
    fileName: r.file_name,
    amount: Number(r.amount || 0),
    date: r.date || r.created_at,
    url: r.url,
    // Add missing mimeType to satisfy Receipt interface
    mimeType: r.mime_type || 'application/octet-stream'
  })),
  progressUpdates: (p.progress_updates || []).map((pu: any) => ({
    id: pu.id,
    description: pu.description,
    percentage: pu.percentage,
    date: pu.date || pu.created_at
  })),
  createdAt: p.created_at,
  // Add missing deadline to satisfy Project interface (defaulting to created_at if missing)
  deadline: p.deadline || p.created_at,
  approvedAt: p.approved_at,
  completedAt: p.completed_at
});

const mapProfile = (p: any): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role as UserRole,
  departmentId: p.department_id,
  active: p.active,
  createdAt: p.created_at
});

export const db = {
  getProfiles: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapProfile);
  },

  updateProfile: async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.departmentId !== undefined) dbUpdates.department_id = updates.departmentId;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  getDepartments: async (): Promise<Department[]> => {
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      budgetCap: Number(d.budget_cap || 0)
    }));
  },

  upsertDepartment: async (dept: Partial<Department>) => {
    const payload = { name: dept.name, budget_cap: dept.budgetCap };
    const { error } = dept.id 
      ? await supabase.from('departments').update(payload).eq('id', dept.id)
      : await supabase.from('departments').insert(payload);
    if (error) throw error;
  },

  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, receipts(*), progress_updates(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProject);
  },

  createProject: async (project: Partial<Project>) => {
    if (!project.departmentId) throw new Error("Dept identification required.");
    const { data, error } = await supabase.from('projects').insert({
      title: project.title,
      description: project.description,
      user_id: project.userId,
      department_id: project.departmentId,
      requested_budget: project.requestedBudget,
      status: ProjectStatus.PENDING
    }).select().single();
    if (error) throw error;
    return mapProject(data);
  },

  updateProjectStatus: async (id: string, status: ProjectStatus, approvedBudget?: number) => {
    const updates: any = { status };
    if (status === ProjectStatus.APPROVED) {
      updates.approved_at = new Date().toISOString();
      if (approvedBudget !== undefined) updates.approved_budget = approvedBudget;
    }
    if (status === ProjectStatus.COMPLETED) updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) throw error;
  },

  addReceipt: async (projectId: string, receipt: Partial<Receipt>, newSpentTotal: number) => {
    const { error: rError } = await supabase.from('receipts').insert({
      project_id: projectId,
      file_name: receipt.fileName,
      amount: receipt.amount,
      url: receipt.url || 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=200'
    });
    if (rError) throw rError;

    const { error: pError } = await supabase.from('projects')
      .update({ spent_budget: newSpentTotal, status: ProjectStatus.IN_PROGRESS })
      .eq('id', projectId);
    if (pError) throw pError;
  },

  addProgress: async (projectId: string, update: Partial<ProgressUpdate>) => {
    const { error: puError } = await supabase.from('progress_updates').insert({
      project_id: projectId,
      description: update.description,
      percentage: update.percentage
    });
    if (puError) throw puError;

    const { error: pError } = await supabase.from('projects')
      .update({ status: ProjectStatus.IN_PROGRESS })
      .eq('id', projectId);
    if (pError) throw pError;
  }
};
