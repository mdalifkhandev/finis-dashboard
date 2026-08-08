import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '@/services/api/client';

export function SharedCompanyPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get(`/public-share/company/${token}`)
      .then((res: any) => {
        if (res.success !== false) {
          setData(res.data || res); // Handle both nested and direct responses
          setLoading(false);
        } else {
          setError(res.message || 'Error loading public company profile');
          setLoading(false);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Error loading public company profile');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow p-8">
        <div className="flex items-center gap-4 mb-6">
          {data?.logoUrl ? (
            <img src={data.logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-2xl font-bold">
              {data?.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{data?.name}</h1>
            <p className="text-slate-500">{data?.industry}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
            <p className="text-slate-800">{data?.description || 'No description available.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact</h3>
            <p className="text-slate-800">{data?.phone || 'N/A'}</p>
            <p className="text-slate-800">{data?.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Website</h3>
            <p className="text-slate-800">{data?.website ? <a href={data.website.startsWith('http') ? data.website : 'https://'+data.website} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">{data.website}</a> : 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Projects</h3>
            <p className="text-slate-800">{data?._count?.projects || 0} active projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}