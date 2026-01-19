"use client";

import { useState } from "react";
import { Camera, MapPin, Send, User, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ReportForm({ user }: { user: any }) {
  const [notes, setNotes] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Submit logic placeholder");
  };

  return (
    <div className="max-w-2xl mx-auto pt-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/security" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
           <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Report</h1>
          <p className="text-sm text-gray-500">Submit security finding</p>
        </div>
      </div>

      {/* DARK CARD CONTAINER - Matches Dashboard Widgets */}
      <div className="bg-zinc-950 text-white rounded-2xl shadow-xl overflow-hidden border border-zinc-800">
        
        {/* Header Strip */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-400">Report Details</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
            <User className="w-3 h-3 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-200 tracking-wide">
              {user?.full_name || "OFFICER"}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Camera Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Evidence
              </label>

              <label className="relative group cursor-pointer block">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-400 group-hover:border-blue-500 group-hover:text-blue-400 transition-all bg-zinc-900/50">
                  <Camera className="w-10 h-10 mb-3" />
                  <span className="font-medium">Tap to capture photo</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
              </label>
            </div>

            {/* 2. Notes Input */}
            <div className="space-y-2">
               <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</label>
               <textarea 
                 className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all resize-none text-sm leading-relaxed" 
                 rows={5}
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 placeholder="Describe the incident or situation in detail..."
               />
            </div>

            {/* 3. Location Tag */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xs text-zinc-400">
                <p className="text-zinc-300 font-medium">Location Tagging Active</p>
                Coordinates will be attached automatically.
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-gray-200 transition-transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                SUBMIT REPORT
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}