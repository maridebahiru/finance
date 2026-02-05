
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Project, ProjectStatus, Department, Receipt, ProgressUpdate, UserRole } from './types';
import { db, initDB, auth } from './services/db';
import { NotificationService } from './services/notifications';
import { EmailService } from './services/email';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Reports from './pages/Reports';
import Login from './pages/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Track notified projects to avoid spam
  const notifiedProjects = useRef<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const [u, d, p, currUser] = await Promise.all([
      db.users.toArray(),
      db.departments.toArray(),
      db.projects.toArray(),
      auth.getCurrentUser()
    ]);
    setUsers(u);
    setDepartments(d);
    setProjects(p);
    setUser(currUser);
    setLoading(false);
  }, []);

  // Automated Monthly Report Trigger
  useEffect(() => {
    const checkAndSendMonthlyReport = async () => {
      if (!user || user.role !== UserRole.SUPER_ADMIN) return;

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastReport = await db.logs.where('type').equals('MONTHLY_REPORT_DISPATCH').and(l => l.timestamp.startsWith(currentMonth)).first();

      if (!lastReport && projects.length > 0) {
        console.log('Initiating Automated Monthly Intelligence Dispatch...');
        NotificationService.send('Institutional Report', 'Generating monthly financial intelligence for executive dispatch...');
        
        const content = await EmailService.generateMonthlyReport(projects, departments, users);
        if (content) {
          const success = await EmailService.dispatchReport(content);
          if (success) {
            await db.logs.add({
              id: `report-${currentMonth}`,
              type: 'MONTHLY_REPORT_DISPATCH',
              timestamp: new Date().toISOString(),
              metadata: { recipient: EmailService.getRecipient() }
            });
            NotificationService.send('Dispatch Successful', `Monthly report successfully transmitted to ${EmailService.getRecipient()}`);
          }
        }
      }
    };

    if (!loading && user) {
      checkAndSendMonthlyReport();
    }
  }, [user, loading, projects, departments, users]);

  // Background Auditor for Deadlines
  useEffect(() => {
    if (!user) return;

    const runAuditCheck = () => {
      const overdue = projects.filter(p => 
        p.userId === user.id && 
        p.status !== ProjectStatus.COMPLETED && 
        p.status !== ProjectStatus.REJECTED &&
        new Date() > new Date(p.deadline) &&
        !notifiedProjects.current.has(p.id)
      );

      if (overdue.length > 0) {
        overdue.forEach(proj => {
          NotificationService.send(
            'Institutional Deadline Alert',
            `Project "${proj.title}" is past its operational deadline. Immediate update required.`
          );
          notifiedProjects.current.add(proj.id);
        });
      }
    };

    const interval = setInterval(runAuditCheck, 60000); // Check every minute
    runAuditCheck(); // Initial check

    return () => clearInterval(interval);
  }, [user, projects]);

  useEffect(() => {
    const bootstrap = async () => {
      await initDB();
      await loadData();
    };
    bootstrap();
  }, [loadData]);

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setActiveTab('dashboard');
    notifiedProjects.current.clear();
  };

  const handleLogin = async (email: string) => {
    const loggedInUser = await auth.login(email);
    if (loggedInUser) {
      setUser(loggedInUser);
      await loadData();
      // Request notifications on login
      await NotificationService.requestPermission();
    }
  };

  const refreshState = async () => {
    const [u, d, p] = await Promise.all([
      db.users.toArray(),
      db.departments.toArray(),
      db.projects.toArray()
    ]);
    setUsers(u);
    setDepartments(d);
    setProjects(p);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-dark-red rounded-full animate-spin mx-auto mb-6 shadow-2xl"></div>
          <p className="text-[10px] font-black text-dark-red tracking-[0.3em] uppercase">Opening Secure Vault</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        return (
          <ProjectDetails 
            user={user}
            project={project}
            onBack={() => setSelectedProjectId(null)}
            onAddMilestone={async (projectId, update, receipt) => {
              const updates: any = {
                status: ProjectStatus.IN_PROGRESS
              };

              // Handle progress update
              const newUpdate: ProgressUpdate = {
                id: Math.random().toString(36).substr(2, 9),
                description: update.description || '',
                percentage: update.percentage || 0,
                date: new Date().toISOString()
              };
              updates.progressUpdates = [...project.progressUpdates, newUpdate];

              // Handle associated expense/receipt
              if (receipt && receipt.amount && receipt.amount > 0) {
                const newReceipt: Receipt = {
                  id: Math.random().toString(36).substr(2, 9),
                  fileName: receipt.fileName || 'Digital Voucher',
                  amount: receipt.amount,
                  date: receipt.date || new Date().toISOString(),
                  url: receipt.url || '',
                  mimeType: receipt.mimeType || 'application/octet-stream'
                };
                updates.receipts = [...project.receipts, newReceipt];
                updates.spentBudget = project.spentBudget + newReceipt.amount;
                newUpdate.associatedExpenseId = newReceipt.id;
              }

              await db.projects.update(projectId, updates);
              await refreshState();
            }}
            onComplete={async (projectId) => {
              await db.projects.update(projectId, {
                status: ProjectStatus.COMPLETED,
                completedAt: new Date().toISOString()
              });
              await refreshState();
            }}
          />
        );
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} projects={projects} departments={departments} users={users} />;
      case 'users':
        return <Users 
          users={users} 
          departments={departments} 
          onAddUser={async (newUser) => {
            await db.users.add({
              ...newUser,
              id: Math.random().toString(36).substr(2, 9),
              active: true,
              createdAt: new Date().toISOString()
            } as User);
            await refreshState();
          }} 
          onUpdateUser={async (id, updates) => {
            await db.users.update(id, updates);
            await refreshState();
          }} 
          onToggleUserStatus={async (id) => {
            const u = users.find(usr => usr.id === id);
            if (u) {
              await db.users.update(id, { active: !u.active });
              await refreshState();
            }
          }} 
        />;
      case 'departments':
        return <Departments 
          departments={departments} 
          onAddDepartment={async (dept) => {
            await db.departments.add({
              ...dept,
              id: Math.random().toString(36).substr(2, 9)
            } as Department);
            await refreshState();
          }} 
          onUpdateDepartment={async (id, updates) => {
            await db.departments.update(id, updates);
            await refreshState();
          }} 
        />;
      case 'projects':
        return (
          <Projects 
            user={user} 
            projects={projects} 
            users={users} 
            departments={departments} 
            onCreateProject={async (p) => {
              await db.projects.add({
                ...p,
                id: Math.random().toString(36).substr(2, 9),
                userId: user.id,
                departmentId: user.departmentId,
                approvedBudget: 0,
                spentBudget: 0,
                status: ProjectStatus.PENDING,
                receipts: [],
                progressUpdates: [],
                createdAt: new Date().toISOString(),
                deadline: p.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              } as Project);
              await refreshState();
            }}
            onUpdateStatus={async (id, status, budget) => {
              const updates: any = { status };
              if (budget !== undefined) updates.approvedBudget = budget;
              if (status === ProjectStatus.APPROVED) updates.approvedAt = new Date().toISOString();
              await db.projects.update(id, updates);
              await refreshState();
            }}
            onViewDetails={setSelectedProjectId}
          />
        );
      case 'reports':
        return <Reports projects={projects} departments={departments} users={users} />;
      default:
        return <Dashboard user={user} projects={projects} departments={departments} users={users} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={(tab: string) => {
        setActiveTab(tab);
        setSelectedProjectId(null);
      }}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
