import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui2/Button';

export default function ReportCard({ title, description, href }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-[10px] bg-white p-6">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-[12px] text-neutral-500 mb-4 line-clamp-2 leading-relaxed">{description}</p>
      <Button
        onClick={() => navigate(href)}
        variant="outline"
        size="sm"
        iconRight={ArrowRight}
      >
        View Report
      </Button>
    </div>
  );
}
