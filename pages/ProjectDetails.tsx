
import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, User, Receipt, ProgressUpdate } from '../types';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  DollarSign,
  TrendingUp,
  Receipt as ReceiptIcon,
  FileUp,
  X,
  Eye,
  AlertCircle
} from 'lucide-react';

interface ProjectDetailsProps {
  user: User;
  project: Project;
  onBack: () => void;
  onAddMilestone: (projectId: string, update: Partial<ProgressUpdate>, receipt?: Partial<Receipt>) => void;
  onComplete: (projectId: string) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ user, project, onBack, onAddMilestone, onComplete }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unified Form State
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [hasExpense, setHasExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, type: string } | null>(null);

  const isOwner = project.userId === user.id;
  const isApproved = project.status === ProjectStatus.APPROVED || project.status === ProjectStatus.IN_PROGRESS;
  const canModify = isOwner && isApproved;

  const currentProgress = project.progressUpdates.length > 0 
    ? project.progressUpdates[project.progressUpdates.length - 1].percentage 
    : 0;

  const financialUtilization = project.approvedBudget > 0 
    ? (project.spentBudget / project.approvedBudget) * 100 
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        alert("Institutional security policy: Files must be under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          data: reader.result as string,
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const update: Partial<ProgressUpdate> = {
      description,
      percentage: progress,
      date: new Date().toISOString()
    };

    let receipt: Partial<Receipt> | undefined;
    if (hasExpense && expenseAmount > 0) {
      receipt = {
        fileName: expenseTitle || `Expense for ${progress}% milestone`,
        amount: expenseAmount,
        url: selectedFile?.data || '',
        mimeType: selectedFile?.type || 'application/octet-stream',
        date: new Date().toISOString()
      };
    }

    await onAddMilestone(project.id, update, receipt);
    
    setLoading(false);
    setIsUpdateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setProgress(currentProgress);
    setDescription('');
    setHasExpense(false);
    setExpenseAmount(0);
    setExpenseTitle('');
    setSelectedFile(null);
  };

  const openUpdateModal = () => {
    setProgress(currentProgress);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-3 text-gray-400 hover:text-dark-red font-black text-[10px] uppercase tracking-widest transition-all group"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-dark-red group-hover:text-white transition-all">
          <ArrowLeft size={16} />
        </div>
        Return to Budget tracker
      </button>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Header Info */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/[0.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <TrendingUp size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    project.status === ProjectStatus.PENDING ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    project.status === ProjectStatus.COMPLETED ? 'bg-green-50 text-green-600 border border-green-100' :
                    'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">{project.title}</h2>
                <p className="text-gray-500 mt-4 leading-relaxed font-medium">{project.description}</p>
              </div>
              
              {canModify && currentProgress === 100 && (
                <button 
                  onClick={() => onComplete(project.id)}
                  className="w-full md:w-auto bg-green-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase text-xs tracking-widest"
                >
                  Finalize Completion
                </button>
              )}
            </div>
          </div>

          {/* Progress Visualizer */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black flex items-center gap-3 text-gray-900 uppercase tracking-tight">
                  <TrendingUp className="text-primary" size={24} />
                  Operational Milestones
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Audit trail of execution & spending</p>
              </div>
              {canModify && (
                <button 
                  onClick={openUpdateModal}
                  className="bg-primary text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={16} /> Log Milestone
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
               <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Physical Progress</span>
                    <span className="text-2xl font-black text-primary">{currentProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${currentProgress}%` }} />
                  </div>
               </div>
               <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Financial Burn</span>
                    <span className="text-2xl font-black text-dark-red">{financialUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div className="h-full bg-dark-red rounded-full transition-all duration-1000" style={{ width: `${financialUtilization}%` }} />
                  </div>
               </div>
            </div>

            <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
              {project.progressUpdates.slice().reverse().map((upd, idx) => (
                <div key={upd.id} className="relative pl-14">
                  <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center transition-all ${idx === 0 ? 'bg-primary rotate-3 scale-110' : 'bg-gray-100'}`}>
                    <CheckCircle2 size={18} className={idx === 0 ? 'text-black' : 'text-gray-300'} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">
                        {upd.percentage}% Milestone: <span className="text-primary">{upd.description}</span>
                      </h4>
                      <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{new Date(upd.date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {project.progressUpdates.length === 0 && (
                <div className="text-center py-12 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-200">
                  <Clock className="mx-auto text-gray-200 mb-4" size={40} />
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest italic">Awaiting initial execution report</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Data */}
        <div className="lg:w-96 space-y-8">
          {/* Financial Ledger */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-gray-900 uppercase tracking-tight">
              <DollarSign size={22} className="text-primary" />
              Institutional Ledger
            </h3>
            <div className="space-y-6">
              <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Approved Allocation</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">${project.approvedBudget.toLocaleString()}</p>
              </div>
              <div className="p-5 bg-red-50/30 rounded-2xl border border-red-100/30">
                <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-1">Liquidated Funds</p>
                <p className="text-3xl font-black text-dark-red tracking-tighter">${project.spentBudget.toLocaleString()}</p>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Reserves</p>
                  <p className="text-xl font-black text-green-600 tracking-tighter">${(project.approvedBudget - project.spentBudget).toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Health</p>
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${financialUtilization > 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                     {financialUtilization > 90 ? 'CRITICAL' : 'OPTIMAL'}
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Vault */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-gray-900 uppercase tracking-tight">
              <ReceiptIcon size={22} className="text-primary" />
              Document Vault
            </h3>
            <div className="space-y-3">
              {project.receipts.map(rec => (
                <div 
                  key={rec.id} 
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/50 transition-all group"
                >
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                    {rec.mimeType.includes('pdf') ? <FileText size={20} /> : <ReceiptIcon size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-black truncate text-gray-900 uppercase tracking-tight">{rec.fileName}</p>
                    <p className="text-[9px] text-gray-400 font-bold">${rec.amount.toLocaleString()} • {new Date(rec.date).toLocaleDateString()}</p>
                  </div>
                  {rec.url && (
                    <button 
                      onClick={() => {
                        const win = window.open();
                        win?.document.write(`<iframe src="${rec.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }}
                      className="p-2 text-gray-300 hover:text-primary transition-colors"
                      title="View Document"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              ))}
              {project.receipts.length === 0 && (
                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] italic">No digital vouchers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unified Update Milestone Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-dark-red p-8 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Log Institutional Milestone</h3>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mt-1">Audit Protocol V2.1</p>
              </div>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleMilestoneSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Progress Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Completion Percentage</label>
                  <span className="text-3xl font-black text-primary italic">{progress}%</span>
                </div>
                <div className="relative pt-6">
                  <input 
                    type="range" 
                    min={currentProgress}
                    max="100"
                    step="1"
                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[8px] font-bold text-gray-300">CURRENT: {currentProgress}%</span>
                    <span className="text-[8px] font-bold text-gray-300">TARGET: 100%</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Summary</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Summarize the achievements for this milestone..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-bold text-gray-900 placeholder:text-gray-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Expense Toggle */}
              <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-lg border-2 border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                    checked={hasExpense}
                    onChange={(e) => setHasExpense(e.target.checked)}
                  />
                  <span className="text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-primary transition-colors">Associate Financial Liquidation?</span>
                </label>

                {hasExpense && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Title</label>
                        <input 
                          type="text" 
                          required={hasExpense}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-bold text-sm"
                          placeholder="e.g. Phase 2 Materials"
                          value={expenseTitle}
                          onChange={(e) => setExpenseTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount utilized ($)</label>
                        <input 
                          type="number" 
                          required={hasExpense}
                          min="0.01"
                          step="0.01"
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all font-bold text-sm"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(parseFloat(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* File Upload Zone */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Digital Voucher (Image/PDF)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:bg-white group ${selectedFile ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                        />
                        {selectedFile ? (
                          <>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                              {selectedFile.type.includes('pdf') ? <FileText size={24} /> : <FileUp size={24} />}
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                className="text-[9px] text-red-500 font-bold uppercase mt-1 hover:underline"
                              >
                                Remove File
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <FileUp className="text-gray-300 group-hover:text-primary transition-colors" size={32} />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Click to upload voucher</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 px-8 py-5 border border-gray-200 rounded-2xl text-[11px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px] border-b-4 border-black/10 active:border-b-0 active:translate-y-1 hover:scale-[1.02]"
                >
                  {loading ? 'Processing Node...' : 'Commit Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
