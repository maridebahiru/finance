
import React, { useState } from 'react';
import { Project, ProjectStatus, User, UserRole, Department } from '../types';
import { Plus, Eye, CheckCircle, XCircle, FileText, Calendar, AlertCircle } from 'lucide-react';

interface ProjectsProps {
  user: User;
  projects: Project[];
  users: User[];
  departments: Department[];
  onCreateProject: (project: Partial<Project>) => void;
  onUpdateStatus: (id: string, status: ProjectStatus, budget?: number) => void;
  onViewDetails: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ user, projects, users, departments, onCreateProject, onUpdateStatus, onViewDetails }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectStatus | 'ALL'>('ALL');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestedBudget: 0,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 30 days
  });

  const canCreate = user.role === UserRole.USER && !projects.some(p => p.userId === user.id && p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.REJECTED);

  const filteredProjects = projects.filter(p => {
    const isOwner = p.userId === user.id;
    const isAuditor = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.FINANCE;
    const matchesTab = activeTab === 'ALL' || p.status === activeTab;
    return (isOwner || isAuditor) && matchesTab;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject({
      ...formData,
      deadline: new Date(formData.deadline).toISOString()
    });
    setIsModalOpen(false);
    setFormData({ 
      title: '', 
      description: '', 
      requestedBudget: 0, 
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Budget Requests</h2>
          <p className="text-gray-500 text-sm">Track and manage financial resources for your initiatives.</p>
        </div>
        {user.role === UserRole.USER && (
          <button 
            disabled={!canCreate}
            onClick={() => setIsModalOpen(true)}
            className={`font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-opacity ${
              canCreate ? 'bg-primary text-black hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            {canCreate ? 'Request Budget' : 'Project in Progress'}
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit overflow-x-auto max-w-full">
        {['ALL', ...Object.values(ProjectStatus)].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-dark-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => {
          const pUser = users.find(u => u.id === project.userId);
          const pDept = departments.find(d => d.id === project.departmentId);
          const progress = project.progressUpdates.length > 0 ? project.progressUpdates[project.progressUpdates.length-1].percentage : 0;
          const isOverdue = project.status !== ProjectStatus.COMPLETED && 
                           project.status !== ProjectStatus.REJECTED && 
                           new Date() > new Date(project.deadline);

          return (
            <div key={project.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all ${isOverdue ? 'border-red-200 ring-2 ring-red-50' : 'border-gray-100'}`}>
              <div className="p-5 flex-1 relative">
                {isOverdue && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <span className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter shadow-lg">
                      <AlertCircle size={8} /> OVERDUE
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    project.status === ProjectStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                    project.status === ProjectStatus.REJECTED ? 'bg-red-100 text-red-700' :
                    project.status === ProjectStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {project.status}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department</span>
                    <span className="font-semibold">{pDept?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline</span>
                    <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Budget</p>
                  <p className="font-bold text-gray-900">${project.requestedBudget.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onViewDetails(project.id)}
                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-primary hover:border-primary transition-all shadow-sm"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {(user.role === UserRole.SUPER_ADMIN || user.role === UserRole.FINANCE) && project.status === ProjectStatus.PENDING && (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(project.id, ProjectStatus.APPROVED, project.requestedBudget)}
                        className="p-2 bg-green-50 border border-green-100 rounded-lg text-green-600 hover:bg-green-100 transition-all shadow-sm"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(project.id, ProjectStatus.REJECTED)}
                        className="p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 hover:bg-red-100 transition-all shadow-sm"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-dark-red p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">New Budget Request</h3>
              <button onClick={() => setIsModalOpen(false)}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Annual Office Renovation"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe the project goal and expected outcomes..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Budget ($)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    value={formData.requestedBudget}
                    onChange={(e) => setFormData({...formData, requestedBudget: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Deadline</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                    value={formData.deadline}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
