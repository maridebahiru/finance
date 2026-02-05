
import React, { useState } from 'react';
import { Department } from '../types';
import { Plus, Building2, Trash2, Edit2, DollarSign } from 'lucide-react';

interface DepartmentsProps {
  departments: Department[];
  onAddDepartment: (dept: Partial<Department>) => void;
  onUpdateDepartment: (id: string, updates: Partial<Department>) => void;
}

const Departments: React.FC<DepartmentsProps> = ({ departments, onAddDepartment, onUpdateDepartment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', budgetCap: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDept) onUpdateDepartment(editingDept.id, formData);
    else onAddDepartment(formData);
    closeModal();
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, budgetCap: dept.budgetCap });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '', budgetCap: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500 text-sm">Organize projects and set budget limitations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-dark-red/5 rounded-lg text-dark-red">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400 font-bold uppercase">Budget Cap</p>
                <p className="text-xl font-bold text-primary flex items-center gap-1">
                  <DollarSign size={18} /> {dept.budgetCap.toLocaleString()}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button 
                  onClick={() => openEdit(dept)}
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-dark-red p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingDept ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={closeModal}><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Limitation ($)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
                  value={formData.budgetCap}
                  onChange={(e) => setFormData({...formData, budgetCap: parseFloat(e.target.value)})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90">
                  {editingDept ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
