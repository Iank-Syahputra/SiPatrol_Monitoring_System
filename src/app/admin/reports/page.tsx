'use client';

import { useState, useEffect } from 'react';
import { Activity, Map, Users, AlertTriangle, CircleGauge, Clock, Shield, Eye, Search, Filter, FileText, Building, User, Download, Printer } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import ReportDetailsModal from '@/components/report-details-modal';

export default function ReportManagementPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch reports and units from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/reports?search=${encodeURIComponent(searchTerm)}&unit=${encodeURIComponent(selectedUnit)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReports(data.reports);
        setAllUnits(data.units);
        setFilteredReports(data.reports);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedUnit]);

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Reports</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare units for the dropdown
  const units = [
    { id: 'all', name: 'All Units' },
    ...allUnits
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Command Center</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Activity className="h-5 w-5" />
            <span>Live Feed</span>
          </a>
          <a href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
            <FileText className="h-5 w-5" />
            <span>Report Management</span>
          </a>
          <a href="/admin/units" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Building className="h-5 w-5" />
            <span>Manage Units</span>
          </a>
          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <User className="h-5 w-5" />
            <span>Manage Users</span>
          </a>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {user?.firstName || user?.username || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Report Management</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700">
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filters */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Filter by Unit</label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-sm hover:bg-zinc-700"
                  onClick={() => {
                    // This will trigger the useEffect to refetch data
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Reports List</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="pb-3">Officer</th>
                    <th className="pb-3">Unit</th>
                    <th className="pb-3">Date/Time</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {reports.map((report: any) => (
                    <tr key={report.id} className="text-sm">
                      <td className="py-3 font-medium text-white">
                        {report.profiles?.full_name || 'N/A'}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {report.units?.name || 'N/A'}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {new Date(report.captured_at).toLocaleString()}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {report.latitude && report.longitude
                          ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                          : 'N/A'}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                          Completed
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No reports found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {isModalOpen && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}