
import React, { useState, useEffect } from 'react';
import { Project, Department, ProjectStatus, User } from '../types';
import { Download, Filter, Calendar, Building2, Mail, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { EmailService } from '../services/email';
import { db } from '../services/db';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ReportsProps {
  projects: Project[];
  departments: Department[];
  users: User[];
}

const Reports: React.FC<ReportsProps> = ({ projects, departments, users }) => {
  const [filters, setFilters] = useState({
    departmentId: 'ALL',
    status: 'ALL',
    timeRange: 'YEARLY' // DAILY, MONTHLY, YEARLY
  });
  const [lastDispatch, setLastDispatch] = useState<any>(null);

  useEffect(() => {
    const checkDispatchStatus = async () => {
      const logs = await db.logs.where('type').equals('MONTHLY_REPORT_DISPATCH').reverse().sortBy('timestamp');
      if (logs.length > 0) setLastDispatch(logs[0]);
    };
    checkDispatchStatus();
    
    // Refresh status occasionally to reflect background dispatches
    const interval = setInterval(checkDispatchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredProjects = projects.filter(p => {
    const deptMatch = filters.departmentId === 'ALL' || p.departmentId === filters.departmentId;
    const statusMatch = filters.status === 'ALL' || p.status === filters.status;
    return deptMatch && statusMatch;
  });

  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.approvedBudget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spentBudget, 0);

  // Group by Date for Chart
  const timeData = filteredProjects.reduce((acc: any, p) => {
    const date = new Date(p.createdAt);
    let key = '';
    if (filters.timeRange === 'YEARLY') key = date.getFullYear().toString();
    else if (filters.timeRange === 'MONTHLY') key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    else key = date.toISOString().split('T')[0];

    if (!acc[key]) acc[key] = { name: key, budget: 0, spent: 0 };
    acc[key].budget += p.approvedBudget;
    acc[key].spent += p.spentBudget;
    return acc;
  }, {});

  const chartData = Object.values(timeData).sort((a: any, b: any) => a.name.localeCompare(b.name));

  const handleDownload = () => {
    const headers = "Title,Department,Requested Budget,Spent Budget,Status,Date\n";
    const csvContent = filteredProjects.map(p => {
      const d = departments.find(dept => dept.id === p.departmentId);
      return `"${p.title}","${d?.name}",${p.approvedBudget},${p.spentBudget},"${p.status}","${new Date(p.createdAt).toLocaleDateString()}"`;
    }).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Finance_Report_${filters.timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-500 text-sm">Analyze spending patterns and budget allocations.</p>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-dark-red text-white font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Automated Dispatch Status - Purely Informational */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
          <Activity size={100} className="text-primary" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
           <div className="p-4 bg-primary/10 rounded-2xl text-primary ring-8 ring-primary/5">
              <Mail size={32} />
           </div>
           <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Automatic Intelligence Relay</h3>
                <span className="flex items-center gap-1 bg-green-50 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-green-100">
                  <ShieldCheck size={10} /> Active
                </span>
              </div>
              <p className="text-xs text-gray-400 font-bold mt-1">
                Background protocols transmitting to: <span className="text-dark-red italic">{EmailService.getRecipient()}</span>
              </p>
           </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
           {lastDispatch ? (
             <div className="flex items-center gap-4 bg-gray-50/50 px-6 py-3 rounded-2xl border border-gray-100">
                <CheckCircle2 size={24} className="text-green-500" />
                <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Last Sync Complete</p>
                   <p className="text-xs font-bold text-gray-900">{new Date(lastDispatch.timestamp).toLocaleString()}</p>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-4 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Awaiting Initial Monthly Cycle</p>
             </div>
           )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
            <Building2 size={14} /> Department
          </label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
            value={filters.departmentId}
            onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
            <Filter size={14} /> Status
          </label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
            <Calendar size={14} /> Frequency
          </label>
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm"
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
          >
            <option value="DAILY">Daily</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-1 space-y-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">Filtered Total Budget</p>
            <h4 className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</h4>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Filtered Total Spent</p>
            <h4 className="text-2xl font-bold text-dark-red">${totalSpent.toLocaleString()}</h4>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Utilization Rate</p>
            <h4 className="text-2xl font-bold text-primary">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
            </h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-3">
          <h3 className="font-bold mb-6">Financial Trend Analysis</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="budget" name="Approved Budget" stroke="#d3a200" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="spent" name="Spent" stroke="#65081b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold">Project Financial Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Approved</th>
                <th className="px-6 py-4">Spent</th>
                <th className="px-6 py-4">Remaining</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map(p => {
                const dept = departments.find(d => d.id === p.departmentId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.title}</td>
                    <td className="px-6 py-4 text-sm">{dept?.name}</td>
                    <td className="px-6 py-4 text-sm font-bold">${p.approvedBudget.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-red">${p.spentBudget.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">${(p.approvedBudget - p.spentBudget).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border border-gray-100 bg-gray-50 text-gray-500">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">No project records match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
