
import React, { useState } from 'react';
import { LOGO_URL } from '../constants';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Artificial delay for local node security verification
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      onLogin(email);
    } catch (err) {
      setError('System authentication failure. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative patterns for depth without images */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dark-red via-primary to-dark-red opacity-20"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-dark-red/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-gray-100 mb-6 transform hover:scale-105 transition-all duration-500">
            <img 
              src={LOGO_URL} 
              alt="Institutional Logo" 
              className="h-32 w-auto object-contain" 
            />
          </div>
          <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">Finance Portal</h1>
          <p className="text-gray-400 mt-2 font-black text-[10px] uppercase tracking-[0.4em]">Institutional Integrity System</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-gray-100 to-primary"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] rounded-r-lg font-black uppercase tracking-wider animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Credential Email</label>
              <input 
                type="email" 
                required 
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                placeholder="identity@institution.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Passkey</label>
              <input 
                type="password" 
                required
                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-black font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs border-b-4 border-black/10 active:border-b-0 active:translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] hover:shadow-primary/30 active:scale-95'}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Identity...</span>
                  </>
                ) : 'Authorize Access'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Node Active: Dexie DB
             </div>
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
               Root Identity: <span className="text-primary font-black">admin@system.com</span>
             </p>
          </div>
        </div>

        <p className="text-center text-[9px] font-black text-gray-300 mt-12 uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} CORE FINANCIAL NODES
        </p>
      </div>
    </div>
  );
};

export default Login;
