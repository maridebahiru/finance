
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'red' | 'blue' | 'green';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary border-primary/20 ring-primary/5',
    red: 'bg-red-50 text-red-600 border-red-100 ring-red-50',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-50',
    green: 'bg-green-50 text-green-600 border-green-100 ring-green-50'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      {/* Background Decorative Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
        <Icon size={120} />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-wider ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
              <span className="bg-current/10 px-1.5 py-0.5 rounded">
                {trend.isUp ? '▲' : '▼'} {trend.value}%
              </span>
              <span className="text-gray-300">vs month avg</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl border ring-8 transition-all ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
