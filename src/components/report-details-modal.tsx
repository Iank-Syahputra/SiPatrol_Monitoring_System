'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Camera } from 'lucide-react';

interface ReportDetailsModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailsModal({ report, isOpen, onClose }: ReportDetailsModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted, return nothing to avoid hydration errors
  if (!isMounted || !isOpen || !report) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white">Report Details</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Photo Evidence */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo Evidence
              </h4>
              <div className="bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl w-full h-64 flex items-center justify-center">
                <span className="text-zinc-500">Photo Preview</span>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Officer Information</h4>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Name:</span> {report.profiles?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-400">Unit:</span> {report.units?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Location</h4>
                <div className="bg-zinc-800/50 rounded-lg p-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-300">
                      {report.latitude && report.longitude 
                        ? `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}` 
                        : 'Location not available'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Timestamp</h4>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-sm text-zinc-300">
                    {new Date(report.captured_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6">
            <h4 className="font-semibold text-white mb-2">Officer Notes</h4>
            <div className="bg-zinc-800/50 rounded-lg p-4 min-h-[100px]">
              <p className="text-zinc-300">
                {report.notes || 'No notes provided for this report.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}