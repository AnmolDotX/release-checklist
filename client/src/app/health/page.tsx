'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthData {
  status: string;
  database: string;
  message?: string;
  error?: string;
  timestamp: string;
  uptimeSeconds: number;
}

function getApiBaseUrl(): string {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  rawUrl = rawUrl.trim().replace(/\/+$/, '');
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
  if (!rawUrl.endsWith('/api')) {
    rawUrl = `${rawUrl}/api`;
  }
  return rawUrl;
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setErrorMsg(null);
    const start = Date.now();
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/health`);
      const elapsed = Date.now() - start;
      setLatency(elapsed);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to backend server');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isHealthy = data?.status === 'healthy' && data?.database === 'connected';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">System Health Monitor</h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status check for API & Aiven MySQL Database</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm font-medium text-slate-700">Checking system health & database connection...</p>
            <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
              ⚡ Free tier Aiven DB spins down due to inactivity. Initial query may take up to 10-15 seconds.
            </p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6 text-red-700">
            <div className="flex items-center gap-2 font-bold text-red-800 mb-1">
              <span className="h-3 w-3 rounded-full bg-red-600 inline-block"></span>
              Backend Unreachable
            </div>
            <p className="text-xs">{errorMsg}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`p-5 rounded-xl border flex items-center justify-between ${
              isHealthy ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <div>
                  <h3 className="font-bold text-base">
                    {isHealthy ? 'All Systems Operational' : 'System Degraded / Waking Up'}
                  </h3>
                  <p className="text-xs opacity-80 mt-0.5">{data?.message}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                isHealthy ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {data?.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <span className="text-xs font-medium text-slate-500 block mb-1">Database Connection</span>
                <span className={`font-semibold text-sm ${data?.database === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {data?.database === 'connected' ? '🟢 Connected' : '🟡 Disconnected / Spinning Up'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <span className="text-xs font-medium text-slate-500 block mb-1">API Latency</span>
                <span className="font-semibold text-sm text-slate-800">
                  ⚡ {latency !== null ? `${latency} ms` : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <span className="text-xs font-medium text-slate-500 block mb-1">Server Uptime</span>
                <span className="font-semibold text-sm text-slate-800">
                  ⏱️ {data?.uptimeSeconds ? `${data.uptimeSeconds} seconds` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Detailed JSON View */}
            <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-x-auto">
              <div className="text-slate-400 font-sans text-xs font-semibold mb-2">Raw API Response</div>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>

          </div>
        )}

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {loading ? 'Re-checking...' : '🔄 Run Health Check Now'}
          </button>
          <span className="text-xs text-slate-400">
            Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>

      </div>
    </div>
  );
}
