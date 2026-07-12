import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatBytes, formatDate } from '../utils/format';

export default function Dashboard() {
  const { accessToken, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.getDocuments(accessToken);
        const documents = response.data;

        setStats({
          totalDocuments: documents.length,
          totalSize: documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchStats();
    }
  }, [accessToken]);

  const memberSince = user?.created_at || user?.user_metadata?.created_at;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-600">Welcome back, {user?.email}</p>
          </div>
          <Link to="/documents" className="btn-primary">
            Manage Documents
          </Link>
        </div>

        {loading && (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <p className="text-sm font-medium text-slate-500">Total Documents</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.totalDocuments}
              </p>
            </div>

            <div className="card">
              <p className="text-sm font-medium text-slate-500">Total Storage Used</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatBytes(stats.totalSize)}
              </p>
            </div>

            <div className="card">
              <p className="text-sm font-medium text-slate-500">Member Since</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {memberSince ? formatDate(memberSince) : '—'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
