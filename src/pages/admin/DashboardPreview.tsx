import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPreview = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the standalone HTML file
    window.location.href = '/dashboard-redesign.html';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading New Dashboard Design...</h2>
        <p className="text-neutral-600">
          If you're not redirected, <a href="/dashboard-redesign.html" className="text-terra-600 underline">click here</a>
        </p>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mt-4 px-4 py-2 bg-neutral-200 rounded-lg hover:bg-neutral-300"
        >
          Back to Old Dashboard
        </button>
      </div>
    </div>
  );
};

export default DashboardPreview;
