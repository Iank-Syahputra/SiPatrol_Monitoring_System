'use client';

import { useState, useEffect } from 'react';
import { Activity, Map, Users, AlertTriangle, CircleGauge, Clock, Shield, Eye, Search, Filter, FileText, Building, User, Plus, Download, Printer } from "lucide-react";
import { useUser } from '@clerk/nextjs';

export default function ManageUnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Fetch units from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/units?search=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUnits(data.units);
        setFilteredUnits(data.units);
      } catch (err) {
        console.error('Error fetching units:', err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleAddUnit = async () => {
    // Get form values
    const name = (document.getElementById('unit-name') as HTMLInputElement)?.value;
    const district = (document.getElementById('unit-district') as HTMLInputElement)?.value;

    if (!name || !district) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, district }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the data
      const data = await response.json();
      setUnits([data.unit, ...units]);
      setFilteredUnits([data.unit, ...filteredUnits]);
      setShowAddForm(false);

      // Clear form
      (document.getElementById('unit-name') as HTMLInputElement).value = '';
      (document.getElementById('unit-district') as HTMLInputElement).value = '';
    } catch (err) {
      console.error('Error adding unit:', err);
      alert('Failed to add unit');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading units...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Units</h2>
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
          <a href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <FileText className="h-5 w-5" />
            <span>Report Management</span>
          </a>
          <a href="/admin/units" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
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
            <h1 className="text-xl font-bold">Manage Units</h1>
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
          {/* Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search units..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4" />
                Add New Unit
              </button>
            </div>

            {/* Add Unit Form */}
            {showAddForm && (
              <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-medium text-white mb-3">Add New Unit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Unit Name</label>
                    <input
                      id="unit-name"
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter unit name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">District</label>
                    <input
                      id="unit-district"
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter district"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    onClick={handleAddUnit}
                  >
                    Save Unit
                  </button>
                  <button
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Units Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Units List</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="pb-3">Unit Name</th>
                    <th className="pb-3">District</th>
                    <th className="pb-3">Created At</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {units.map((unit: any) => (
                    <tr key={unit.id} className="text-sm">
                      <td className="py-3 font-medium text-white">
                        {unit.name}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {unit.district}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {new Date(unit.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Edit
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {units.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        No units found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}