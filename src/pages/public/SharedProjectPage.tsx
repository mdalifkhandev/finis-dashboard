import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/services/api/client';

export function SharedProjectPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get(`/public-share/project/${token}`)
      .then((res: any) => {
        if (res.success !== false) {
          setData(res.data || res); // Handle both nested and direct responses
          setLoading(false);
        } else {
          setError(res.message || 'Error loading public project profile');
          setLoading(false);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Error loading public project profile');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{data?.name}</h1>
            <p className="text-slate-500">Project Type: {data?.type || 'N/A'}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {data?.status}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</h3>
            <p className="text-slate-800 flex items-center gap-2">
              {data?.company?.logoUrl && <img src={data.company.logoUrl} className="w-6 h-6 rounded-full" alt="Company Logo" />}
              {data?.company?.name}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
            <p className="text-slate-800">{data?.description || 'No description available.'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Start Date</h3>
              <p className="text-slate-800">{data?.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Progress</h3>
              <p className="text-slate-800">{data?.progress}%</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</h3>
            <p className="text-slate-800">{data?.location || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}