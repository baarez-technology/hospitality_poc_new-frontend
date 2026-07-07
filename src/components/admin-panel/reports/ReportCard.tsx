import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReportCard({ title, description, icon: Icon, href, color = '#A57865' }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
          <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{description}</p>
          <button
            onClick={() => navigate(href)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FAF7F4] hover:bg-[#A57865]/10 rounded-lg text-sm font-medium transition-colors"
            style={{ color }}
          >
            View Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
