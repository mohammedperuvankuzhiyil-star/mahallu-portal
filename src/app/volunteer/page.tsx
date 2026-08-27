'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HouseCard from '@/components/volunteer/HouseCard';
import HouseFormModal from '@/components/volunteer/HouseFormModal';
import { House, UserSession } from '@/types';
import {
  Plus,
  Search,
  Home,
  CheckCircle2,
  Users,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { WARDS } from '@/lib/constants';

export default function VolunteerDashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const router = useRouter();

  const fetchSessionAndData = async () => {
    try {
      setLoading(true);
      // Fetch session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      // Fetch houses
      const houseRes = await fetch('/api/houses');
      if (houseRes.ok) {
        const hData = await houseRes.json();
        setHouses(hData.houses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const handleOpenNew = () => {
    setEditingHouse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (house: House) => {
    setEditingHouse(house);
    setIsModalOpen(true);
  };

  // Filter houses based on search & ward
  const filteredHouses = houses.filter((h) => {
    const query = searchQuery.toLowerCase().trim();
    const head = h.members?.find((m) => m.isHead);
    const matchesQuery =
      !query ||
      h.houseNo.toLowerCase().includes(query) ||
      h.houseName.toLowerCase().includes(query) ||
      (head?.name && head.name.toLowerCase().includes(query)) ||
      (head?.phone && head.phone.includes(query));

    const matchesWard = selectedWard === 'All' || h.ward === selectedWard;

    return matchesQuery && matchesWard;
  });

  // Calculate volunteer stats
  const mySubmittedCount = houses.filter(
    (h) => h.registeredByVolunteerId === user?.id || h.registeredByVolunteerName === user?.name
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-16">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ================= GREETING HEADER ================= */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/20 relative overflow-hidden">
          {/* Subtle Islamic Geometric Motif Effect */}
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-9xl select-none pointer-events-none">
            🕌
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/50 backdrop-blur-md border border-emerald-400/30 text-xs font-semibold text-emerald-100 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Volunteer Census Portal</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Assalamu Alaikum, Dear {user?.name || 'Volunteer'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg">
              May Allah bless your noble efforts in collecting data for our Mahallu&apos;s welfare and empowerment.
            </p>

            {/* Quick Stats Banner inside greeting */}
            <div className="mt-5 grid grid-cols-2 gap-3 max-w-sm">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="text-[11px] text-emerald-200 font-medium block">
                  My Submissions
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {mySubmittedCount}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                <span className="text-[11px] text-emerald-200 font-medium block">
                  Total Mahallu Houses
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {houses.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRIMARY ACTION CONTROLS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* New House Entry Button */}
          <button
            onClick={handleOpenNew}
            className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-extrabold text-base">1. New House Entry</span>
                <span className="block text-xs text-emerald-100 font-normal">
                  Add House, Head &amp; Family Members
                </span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              →
            </div>
          </button>

          {/* Quick Search & Edit helper banner */}
          <div className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-sm">
                  2. Search &amp; Edit
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Search any house in Mahallu to edit
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredHouses.length} found
            </span>
          </div>
        </div>

        {/* ================= SEARCH & FILTER CONTROLS ================= */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by House #, House Name, Head Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Ward Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Wards</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchSessionAndData}
                title="Refresh"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= HOUSES LIST ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mahallu Houses Directory</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredHouses.length} of {houses.length} houses
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading records...</p>
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6">
              <Home className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching houses found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search query or ward filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredHouses.map((h) => (
                <HouseCard key={h._id} house={h} onEdit={handleOpenEdit} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* House Create / Edit Multi-step Modal */}
      {isModalOpen && (
        <HouseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchSessionAndData}
          initialData={editingHouse}
        />
      )}
    </div>
  );
}
