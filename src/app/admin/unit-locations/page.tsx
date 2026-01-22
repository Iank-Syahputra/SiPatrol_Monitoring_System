'use client';

import { useState, useEffect } from 'react';
import { Activity, Map, Users, AlertTriangle, CircleGauge, Clock, Shield, Eye, Search, Filter, FileText, Building, User, Plus, Download, Printer, Edit3, Trash2, Home, MapPin } from "lucide-react";
import AdminSidebar from '@/components/admin-sidebar';

export default function ManageUnitLocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch locations and units from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch units
        const unitsResponse = await fetch('/api/admin/units');
        if (!unitsResponse.ok) {
          throw new Error(`HTTP error! status: ${unitsResponse.status}`);
        }
        const unitsData = await unitsResponse.json();
        setUnits(unitsData.units || []);

        // Fetch locations
        let url = `/api/admin/unit-locations?search=${encodeURIComponent(searchTerm)}`;
        if (selectedUnit) {
          url += `&unit_id=${encodeURIComponent(selectedUnit)}`;
        }
        const locationsResponse = await fetch(url);

        if (!locationsResponse.ok) {
          throw new Error(`HTTP error! status: ${locationsResponse.status}`);
        }

        const locationsData = await locationsResponse.json();
        setLocations(locationsData.locations || []);
        setFilteredLocations(locationsData.locations || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load locations and units');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedUnit]);

  // Filter locations based on search term and selected unit
  useEffect(() => {
    let result = locations;
    
    if (searchTerm) {
      result = result.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.units?.name && location.units.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedUnit) {
      result = result.filter(location => location.unit_id === selectedUnit);
    }
    
    setFilteredLocations(result);
  }, [locations, searchTerm, selectedUnit]);

  const handleAddLocation = async () => {
    const name = (document.getElementById('location-name') as HTMLInputElement)?.value;
    const unitId = (document.getElementById('location-unit') as HTMLSelectElement)?.value;

    if (!name || !unitId) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/unit-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, unit_id: unitId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Refresh the data
      const data = await response.json();
      setLocations([data.location, ...locations]);
      setFilteredLocations([data.location, ...filteredLocations]);
      setShowAddForm(false);

      // Clear form
      (document.getElementById('location-name') as HTMLInputElement).value = '';
      (document.getElementById('location-unit') as HTMLSelectElement).value = '';
    } catch (err) {
      console.error('Error adding location:', err);
      alert(err instanceof Error ? err.message : 'Failed to add location');
    }
  };

  const handleEditLocation = async () => {
    const name = (document.getElementById('edit-location-name') as HTMLInputElement)?.value;
    const unitId = (document.getElementById('edit-location-unit') as HTMLSelectElement)?.value;

    if (!name || !unitId || !editingLocation) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/unit-locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: editingLocation.id, 
          name, 
          unit_id: unitId 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Refresh the data
      const data = await response.json();
      setLocations(locations.map(loc => loc.id === editingLocation.id ? data.location : loc));
      setFilteredLocations(filteredLocations.map(loc => loc.id === editingLocation.id ? data.location : loc));
      setShowEditForm(false);
      setEditingLocation(null);

      // Clear form
      (document.getElementById('edit-location-name') as HTMLInputElement).value = '';
      (document.getElementById('edit-location-unit') as HTMLSelectElement).value = '';
    } catch (err) {
      console.error('Error updating location:', err);
      alert(err instanceof Error ? err.message : 'Failed to update location');
    }
  };

  const handleDeleteLocation = async (location: any) => {
    if (!window.confirm(`Are you sure you want to delete location "${location.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/unit-locations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: location.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove from state
      setLocations(locations.filter(loc => loc.id !== location.id));
      setFilteredLocations(filteredLocations.filter(loc => loc.id !== location.id));
    } catch (err) {
      console.error('Error deleting location:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete location');
    }
  };

  const startEditLocation = (location: any) => {
    setEditingLocation(location);
    setShowEditForm(true);
    
    // Populate form fields after a short delay to ensure DOM is ready
    setTimeout(() => {
      const nameInput = document.getElementById('edit-location-name') as HTMLInputElement;
      const unitSelect = document.getElementById('edit-location-unit') as HTMLSelectElement;
      
      if (nameInput) nameInput.value = location.name;
      if (unitSelect) unitSelect.value = location.unit_id;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Locations</h2>
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
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Manage Unit Locations</h1>
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
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
                
                <select
                  className="w-full sm:w-48 bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="">All Units</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>

            {/* Add Location Form */}
            {showAddForm && (
              <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-medium text-white mb-3">Add New Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Location Name</label>
                    <input
                      id="location-name"
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location name (e.g. Lobby, Basement)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Unit</label>
                    <select
                      id="location-unit"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    onClick={handleAddLocation}
                  >
                    Save Location
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

            {/* Edit Location Form */}
            {showEditForm && editingLocation && (
              <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-medium text-white mb-3">Edit Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Location Name</label>
                    <input
                      id="edit-location-name"
                      type="text"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location name (e.g. Lobby, Basement)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Unit</label>
                    <select
                      id="edit-location-unit"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    onClick={handleEditLocation}
                  >
                    Update Location
                  </button>
                  <button
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingLocation(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Locations Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Locations List</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                    <th className="pb-3">Location Name</th>
                    <th className="pb-3">Unit</th>
                    <th className="pb-3">Created At</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredLocations.map((location: any) => (
                    <tr key={location.id} className="text-sm">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        {location.name}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {location.units?.name || 'N/A'}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {new Date(location.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button 
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                            onClick={() => startEditLocation(location)}
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </button>
                          <button 
                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                            onClick={() => handleDeleteLocation(location)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredLocations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        No locations found matching your criteria
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