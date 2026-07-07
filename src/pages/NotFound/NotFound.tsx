import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-3xl font-semibold text-neutral-900 mt-4 mb-2">
            Page Not Found
          </h2>
          <p className="text-neutral-600">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link to={ROUTES.HOME}>
            <Button leftIcon={<Home size={18} />} fullWidth>
              Back to Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
