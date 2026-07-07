import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <Construction className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
        <p className="text-neutral-500">{description || 'This page is under construction.'}</p>
      </div>
    </div>
  );
}
