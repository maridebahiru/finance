
import React from 'react';
import { User, UserRole, Project, Department, ProjectStatus } from '../types';
import DashboardCard from '../components/DashboardCard';
import { 
  Banknote,
  Wallet,
  Clock, 
  CheckCircle2, 
  TrendingUp,
  FileBarChart,
  LayoutGrid,
  ArrowRight,
  Coins
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  user: User;
  projects: Project[];
  departments: Department[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, projects, departments, users }) => {
  const isAdmin = user.role === UserRole.SUPER_ADMIN;
  const isFinance = user.role === UserRole.FINANCE;

  const accessibleProjects = isAdmin || isFinance 
    ? projects 
    : projects.filter(p => p.userId === user.id);

  const pendingApprovals = accessibleProjects.filter(p => p.status === ProjectStatus.PENDING).length;
  const activeProjects = accessibleProjects.filter(p => [ProjectStatus.APPROVED, ProjectStatus.IN_PROGRESS].includes(p.status)).length;
  const completedProjectsCount = accessibleProjects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  
  const totalApprovedBudget = accessibleProjects.reduce((sum, p) => sum + p.approvedBudget, 0);

  const deptData = departments.map(d => {
    const deptProjects = projects.filter(p => p.departmentId === d.id);
    return {
      name: d.name,
      budget: deptProjects.reduce((sum, p) => sum + p.approvedBudget, 0),
      spent: deptProjects.reduce((sum, p) => sum + p.spentBudget, 0)
    };
  }).filter(d => d.budget > 0);

  const statusData = [
    { name: 'Pending', value: pendingApprovals, color: '#f59e0b' },
    { name: 'Active', value: activeProjects, color: '#d3a200' },
    { name: 'Completed', value: completedProjectsCount, color: '#10b981' },
    { name: 'Rejected', value: accessibleProjects.filter(p => p.status === ProjectStatus.REJECTED).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none italic">
            Asset <span className="text-primary">Intelligence</span>
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Institutional Hub</span>
            <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
            <span className="text-primary font-black text-xs uppercase tracking-widest">{user.name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard 
          title="Global Liquidity" 
          value={`$${totalApprovedBudget.toLocaleString()}`} 
          icon={Banknote} 
          color="primary"
          trend={{ value: 12, isUp: true }}
        />
        <DashboardCard 
          title="Portfolio Items" 
          value={activeProjects} 
          icon={Wallet} 
          color="blue"
        />
        <DashboardCard 
          title="Audit Queue" 
          value={pendingApprovals} 
          icon={Clock} 
          color="red"
        />
        <DashboardCard 
          title="Settled Assets" 
          value={completedProjectsCount} 
          icon={Coins} 
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Budget Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-2xl font-black flex items-center gap-3 text-gray-900 uppercase tracking-tight">
                <TrendingUp className="text-primary" size={28} />
                Financial Flow
              </h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">Capital Allocation vs Disbursed Reserves</p>
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="900" tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="900" tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(211,162,0,0.05)' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 30px 40px -10px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="budget" name="Approved Reserve" fill="#d3a200" radius={[12, 12, 0, 0]} />
                <Bar dataKey="spent" name="Liquidated Funds" fill="#65081b" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/[0.02]">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-gray-900 uppercase tracking-tight">
            <FileBarChart className="text-primary" size={28} />
            Asset Health
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-6 mt-12">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full ring-4 ring-gray-50 transition-all group-hover:scale-125" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400 font-black text-xs uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="font-black text-gray-900 text-xl tracking-tighter">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
