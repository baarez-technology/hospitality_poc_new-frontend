import { Loader2 } from 'lucide-react';

export const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};
