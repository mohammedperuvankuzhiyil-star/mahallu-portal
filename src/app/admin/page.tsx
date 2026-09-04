'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HouseFormModal from '@/components/volunteer/HouseFormModal';
import { House, Citizen, UserSession } from '@/types';
import {
  ShieldCheck,
  Users,
  Home,
  Globe,
  HeartPulse,
  GraduationCap,
  Download,
  Search,
  Filter,
  RotateCcw,
  UserPlus,
  Trash2,
  Phone,
  MessageCircle,
  Eye,
  Edit3,
  Car,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Heart,
  BookOpen,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  WARDS,
  BLOOD_GROUPS,
  EDUCATION_STAGES,
  JOB_CATEGORIES,
  ECONOMIC_STATUS_OPTIONS,
  HEALTH_CONDITIONS,
  CLASS_YEAR_OPTIONS,
} from '@/lib/constants';

export default function AdminDashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [citizens, setCitizens] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'master' | 'blood' | 'students' | 'welfare' | 'volunteers'>('master');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  // Master Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWard, setFilterWard] = useState('All');
  const [filterEdu, setFilterEdu] = useState('All');
  const [filterJob, setFilterJob] = useState('All');
  const [filterBlood, setFilterBlood] = useState('All');
  const [filterEconomic, setFilterEconomic] = useState('All');

  // Emergency Blood Donor Finder State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('O+');

  // Student Filter State
  const [selectedClassYear, setSelectedClassYear] = useState<string>('All');
  const [studentSubTab, setStudentSubTab] = useState<'batches' | 'milestones'>('batches');
  const [rolloverData, setRolloverData] = useState<any>(null);
  const [rolloverLoading, setRolloverLoading] = useState(false);
  const [rolloverSuccess, setRolloverSuccess] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Volunteer Creation Form State
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volUsername, setVolUsername] = useState('');
  const [volPassword, setVolPassword] = useState('');
  const [volLoading, setVolLoading] = useState(false);
  const [volError, setVolError] = useState('');
  const [volSuccess, setVolSuccess] = useState('');

  const router = useRouter();

  const fetchRolloverData = async () => {
    try {
      setRolloverLoading(true);
      const res = await fetch('/api/academic/rollover');
      if (res.ok) {
        const data = await res.json();
        setRolloverData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRolloverLoading(false);
    }
  };

  const handleRunRollover = async () => {
    if (
      !confirm(
        'Run Academic Year Promotion? This will automatically advance intermediate classes (Class 1-9, +1, Degree 1st/2nd yr) to their next class, and flag milestone students (SSLC, +2, Final Year Degree) for career review.'
      )
    )
      return;

    try {
      setRolloverLoading(true);
      setRolloverSuccess('');
      const res = await fetch('/api/academic/rollover', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setRolloverSuccess(
          `Academic Year ${result.currentAcademicYear} Rollover completed! Auto-promoted: ${result.autoPromotedCount}, Milestone alerts flagged: ${result.milestoneFlaggedCount}`
        );
        fetchData();
        fetchRolloverData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRolloverLoading(false);
    }
  };

  const handleResolveMilestone = async (citizenId: string, option: any) => {
    try {
      setResolvingId(citizenId);
      const res = await fetch('/api/academic/rollover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          newClass: option.newClass,
          newStage: option.newStage,
          newJobCategory: option.newJobCategory,
          notes: option.label,
        }),
      });

      if (res.ok) {
        fetchData();
        fetchRolloverData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      if (meData.user?.role !== 'SUPERADMIN') {
        router.push('/volunteer');
        return;
      }
      setUser(meData.user);

      // Fetch houses and volunteers in parallel
      const [houseRes, volRes] = await Promise.all([
        fetch('/api/houses'),
        fetch('/api/volunteers'),
      ]);

      if (houseRes.ok) {
        const hData = await houseRes.json();
        setHouses(hData.houses || []);

        const allCits: any[] = [];
        (hData.houses || []).forEach((h: House) => {
          (h.members || []).forEach((m: Citizen) => {
            allCits.push({
              ...m,
              houseNo: h.houseNo,
              houseName: h.houseName,
              ward: h.ward,
              economicStatus: h.economicStatus,
            });
          });
        });
        setCitizens(allCits);
      }

      if (volRes.ok) {
        const vData = await volRes.json();
        setVolunteers(vData.volunteers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRolloverData();
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterWard('All');
    setFilterEdu('All');
    setFilterJob('All');
    setFilterBlood('All');
    setFilterEconomic('All');
  };

  const handleExportExcel = () => {
    window.location.href = '/api/export';
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolError('');
    setVolSuccess('');
    setVolLoading(true);

    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: volName,
          phone: volPhone,
          username: volUsername,
          password: volPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create volunteer');
      }

      if (data.volunteer) {
        setVolunteers((prev) => [data.volunteer, ...prev]);
      }
      setVolSuccess(`Volunteer "${volName}" created successfully!`);
      setVolName('');
      setVolPhone('');
      setVolUsername('');
      setVolPassword('');
    } catch (err: any) {
      setVolError(err.message || 'Error creating volunteer');
    } finally {
      setVolLoading(false);
    }
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Are you sure you want to remove this volunteer?')) return;
    try {
      const res = await fetch(`/api/volunteers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this house record and all its members?')) return;
    try {
      const res = await fetch(`/api/houses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // KPI Calculations
  const totalHouses = houses.length;
  const totalPopulation = citizens.length;
  const totalMales = citizens.filter((c) => c.gender === 'Male').length;
  const totalFemales = citizens.filter((c) => c.gender === 'Female').length;
  const totalPravasis = citizens.filter((c) => c.isPravasi).length;
  const totalBPL = houses.filter((h) =>
    h.economicStatus.toLowerCase().includes('bpl') ||
    h.economicStatus.toLowerCase().includes('yellow') ||
    h.economicStatus.toLowerCase().includes('priority')
  ).length;
  const totalStudents = citizens.filter((c) => c.jobCategory === 'Student').length;
  const totalChronic = citizens.filter(
    (c) => c.healthCondition && c.healthCondition !== 'None (Healthy)'
  ).length;

  // Filtered Citizens for Master Table
  const filteredCitizens = citizens.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.houseNo.toLowerCase().includes(q) ||
      c.houseName.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.specificJob && c.specificJob.toLowerCase().includes(q));

    const matchesWard = filterWard === 'All' || c.ward === filterWard;
    const matchesEdu = filterEdu === 'All' || c.educationStage === filterEdu;
    const matchesJob = filterJob === 'All' || c.jobCategory === filterJob;
    const matchesBlood = filterBlood === 'All' || c.bloodGroup === filterBlood;
    const matchesEconomic = filterEconomic === 'All' || c.economicStatus === filterEconomic;

    return (
      matchesSearch &&
      matchesWard &&
      matchesEdu &&
      matchesJob &&
      matchesBlood &&
      matchesEconomic
    );
  });

  // Emergency Blood Donors
  const bloodDonors = citizens.filter(
    (c) => c.bloodGroup === selectedBloodGroup && c.phone
  );

  // Targeted Students
  const targetedStudents = citizens.filter((c) => {
    const isStudentOrStudying =
      c.jobCategory === 'Student' ||
      c.classOrYear?.includes('Class') ||
      c.classOrYear?.includes('Degree') ||
      c.classOrYear?.includes('+');
    const matchesClass = selectedClassYear === 'All' || c.classOrYear === selectedClassYear;
    return isStudentOrStudying && matchesClass;
  });

  // Welfare & Chronic Illness list
  const welfareList = citizens.filter((c) => {
    const hasIllness = c.healthCondition && c.healthCondition !== 'None (Healthy)';
    const isBpl =
      c.economicStatus?.toLowerCase().includes('bpl') ||
      c.economicStatus?.toLowerCase().includes('yellow');
    return hasIllness || isBpl;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ================= ADMIN OVERVIEW BANNER ================= */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/40 border border-emerald-400/30 text-xs font-semibold text-emerald-300 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Admin Console</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Mahallu Welfare &amp; Census Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Real-time demographics, community welfare analytics, educational orientation, and emergency medical tools.
              </p>
            </div>

            {/* Quick Export Button in Header */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel (.xlsx)</span>
            </button>
          </div>

          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-emerald-300 block font-medium">Total Houses</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalHouses}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-emerald-300 block font-medium">Total Population</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalPopulation}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {totalMales} M • {totalFemales} F
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-amber-300 block font-medium">BPL / Priority</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalBPL}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {totalHouses > 0 ? Math.round((totalBPL / totalHouses) * 100) : 0}% of houses
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-teal-300 block font-medium">Pravasis (Abroad)</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalPravasis}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-indigo-300 block font-medium">Students</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalStudents}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-rose-300 block font-medium">Medical / Chronic</span>
              <span className="text-xl sm:text-2xl font-black text-white">{totalChronic}</span>
            </div>
          </div>
        </div>

        {/* ================= DASHBOARD NAVIGATION TABS ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('master')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === 'master'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Data Table ({citizens.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blood')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === 'blood'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Emergency Blood Finder</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Orientation ({totalStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('welfare')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === 'welfare'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Welfare &amp; Medical Aid ({welfareList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
              activeTab === 'volunteers'
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Volunteers ({volunteers.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: MASTER DATA TABLE WITH MULTI-FILTERS ================= */}
        {activeTab === 'master' && (
          <div className="space-y-4">
            {/* Multi Filter Box */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-500" />
                  Filter Mahallu Database
                </span>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Filter Controls Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Search Bar */}
                <div className="sm:col-span-2 relative">
                  <input
                    type="text"
                    placeholder="Search name, house, phone, job..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Ward Filter */}
                <div>
                  <select
                    value={filterWard}
                    onChange={(e) => setFilterWard(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="All">All Wards</option>
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Education Filter */}
                <div>
                  <select
                    value={filterEdu}
                    onChange={(e) => setFilterEdu(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="All">All Education</option>
                    {EDUCATION_STAGES.map((ed) => (
                      <option key={ed} value={ed}>
                        {ed.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Filter */}
                <div>
                  <select
                    value={filterJob}
                    onChange={(e) => setFilterJob(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="All">All Jobs</option>
                    {JOB_CATEGORIES.map((jc) => (
                      <option key={jc} value={jc}>
                        {jc.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Blood Group Filter */}
                <div>
                  <select
                    value={filterBlood}
                    onChange={(e) => setFilterBlood(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="All">All Blood</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Master Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Showing {filteredCitizens.length} member records
                </span>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Citizen Name</th>
                      <th className="py-3 px-3">House / Ward</th>
                      <th className="py-3 px-2">Age/Gender</th>
                      <th className="py-3 px-2">Blood</th>
                      <th className="py-3 px-3">Education &amp; Status</th>
                      <th className="py-3 px-3">Job / Pravasi</th>
                      <th className="py-3 px-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {filteredCitizens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          No matching records found. Try clearing some filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCitizens.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {c.isHead ? (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  Head of House
                                </span>
                              ) : (
                                c.relationToHead
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {c.houseName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              #{c.houseNo} • {c.ward}
                            </div>
                          </td>

                          <td className="py-3 px-2 whitespace-nowrap">
                            <span>{c.age} yrs</span>
                            <span className="text-[10px] text-slate-400 block">{c.gender}</span>
                          </td>

                          <td className="py-3 px-2">
                            <span className="font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px]">
                              {c.bloodGroup}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="truncate max-w-[150px] font-medium">
                              {c.educationStage?.split('(')[0]}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                              {c.classOrYear}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="truncate max-w-[140px] font-medium">
                              {c.jobCategory?.split('(')[0]}
                            </div>
                            {c.isPravasi && (
                              <span className="inline-block text-[9px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded">
                                Pravasi: {c.pravasiCountry || 'Abroad'}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            {c.phone ? (
                              <a
                                href={`tel:${c.phone}`}
                                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{c.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: EMERGENCY BLOOD DONOR FINDER ================= */}
        {activeTab === 'blood' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-rose-900 to-red-900 text-white p-6 rounded-3xl shadow-lg border border-rose-800/50">
              <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">
                <Heart className="w-4 h-4 text-rose-300" />
                <span>Mahallu Emergency Blood Bank Finder</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Find Immediate Blood Donors
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/80 mt-1 max-w-xl">
                Quickly select a blood group to find verified donors within our Mahallu with 1-click Call &amp; WhatsApp actions.
              </p>

              {/* Blood Group Selector Chips */}
              <div className="flex items-center gap-2 flex-wrap mt-4">
                {BLOOD_GROUPS.filter((b) => b !== 'Unknown / Not Tested').map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedBloodGroup(bg)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                      selectedBloodGroup === bg
                        ? 'bg-white text-rose-900 shadow-md scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Donors List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                {bloodDonors.length} Verified Donors for Blood Group ({selectedBloodGroup})
              </h3>

              {bloodDonors.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    No donors registered with blood group {selectedBloodGroup} yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {bloodDonors.map((donor) => (
                    <div
                      key={donor._id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {donor.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {donor.age} yrs • {donor.gender}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-black text-xs">
                          {donor.bloodGroup}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <span>{donor.houseName}</span>
                        <span className="block text-[11px] text-slate-400">
                          #{donor.houseNo} • {donor.ward}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <a
                          href={`tel:${donor.phone}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Donor</span>
                        </a>

                        <a
                          href={`https://wa.me/${donor.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: STUDENT ORIENTATION & EMPOWERMENT ================= */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-lg border border-indigo-800/40">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Education &amp; Student Career Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Student Tracking &amp; Academic Progression Engine
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-2xl">
                Automatically promote continuous classes every academic year (June), and review milestone transitions (SSLC, +2, Final Year Degree) to guide youth towards higher studies or careers.
              </p>

              {/* Sub-tab Switcher inside Student Hub */}
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <button
                  onClick={() => setStudentSubTab('batches')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                    studentSubTab === 'batches'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>All Student Batches ({targetedStudents.length})</span>
                </button>

                <button
                  onClick={() => setStudentSubTab('milestones')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                    studentSubTab === 'milestones'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300/60 font-black'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Milestone Transitions &amp; Rollover</span>
                  {rolloverData?.milestoneCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                      {rolloverData.milestoneCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* MILESTONE SUB-TAB */}
            {studentSubTab === 'milestones' && (
              <div className="space-y-4">
                {/* Academic Rollover Control Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Academic Cycle: {rolloverData?.currentAcademicYear || 'Current Year'}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Annual June Academic Progression
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                        Promotes students in continuous grades (Class 1–9, +1, Degree 1st/2nd Yr) to the next class and increments their age. Milestone students (SSLC, +2, Final Degree) are flagged for committee guidance.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={handleRunRollover}
                        disabled={rolloverLoading}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all"
                      >
                        <RotateCcw className={`w-4 h-4 ${rolloverLoading ? 'animate-spin' : ''}`} />
                        <span>{rolloverLoading ? 'Running Promotion...' : '🚀 Run June Academic Promotion'}</span>
                      </button>
                    </div>
                  </div>

                  {rolloverSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{rolloverSuccess}</span>
                    </div>
                  )}

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Total Registered Students</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {rolloverData?.totalStudents ?? targetedStudents.length}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-medium">Auto-Promotable (Classes 1–9, +1, etc.)</span>
                      <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                        {rolloverData?.autoPromotableCount ?? 0}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 block font-medium">Milestone Review Required</span>
                      <span className="text-lg font-black text-amber-800 dark:text-amber-300">
                        {rolloverData?.milestoneCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone Students Guidance List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Students Awaiting Milestone Career &amp; Education Decision ({rolloverData?.milestoneStudents?.length || 0})</span>
                    </h3>
                  </div>

                  {!rolloverData?.milestoneStudents || rolloverData.milestoneStudents.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        All Milestones Up-to-Date
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        No students are currently stuck in transitional milestone grades. All SSLC, +2, and graduates have their next path recorded.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                      {rolloverData.milestoneStudents.map((st: any) => (
                        <div
                          key={st._id}
                          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-3 relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                  {st.name}
                                </h4>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                  {st.age} yrs • {st.gender}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {st.houseName} • #{st.houseNo} • {st.ward}
                              </p>
                            </div>

                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black shrink-0 border border-amber-200 dark:border-amber-800">
                              {st.classOrYear}
                            </span>
                          </div>

                          {/* Contact buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {st.phone ? (
                              <>
                                <a
                                  href={`tel:${st.phone}`}
                                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>Call {st.phone}</span>
                                </a>
                                <a
                                  href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="py-1.5 px-2.5 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-950/60 dark:hover:bg-green-950 text-green-700 dark:text-green-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-green-200 dark:border-green-800"
                                >
                                  <MessageCircle className="w-3 h-3 text-green-500" />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No direct phone listed</span>
                            )}
                          </div>

                          {/* Career Path / Transition Choices */}
                          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Update Career / Study Path:</span>
                            </span>

                            <div className="flex flex-wrap gap-1.5">
                              {st.availableOptions?.map((opt: any, idx: number) => (
                                <button
                                  key={idx}
                                  disabled={resolvingId === st._id}
                                  onClick={() => handleResolveMilestone(st._id, opt)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-medium transition-all flex items-center gap-1 text-left disabled:opacity-50"
                                >
                                  <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BATCHES SUB-TAB */}
            {studentSubTab === 'batches' && (
              <div className="space-y-4">
                {/* Batch Filter Row */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Filter by Class / Year:
                    </span>
                  </div>

                  <select
                    value={selectedClassYear}
                    onChange={(e) => setSelectedClassYear(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">All Student Batches ({targetedStudents.length})</option>
                    {CLASS_YEAR_OPTIONS.filter((cy) => cy !== 'Not Applicable' && cy !== 'Course Completed / Graduated').map((cy) => (
                      <option key={cy} value={cy}>
                        {cy}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Students Grid */}
                {targetedStudents.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">
                      No students found for class {selectedClassYear}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {targetedStudents.map((st) => (
                      <div
                        key={st._id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {st.name}
                            </h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                              {st.classOrYear}
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {st.age} yrs
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          <p>
                            <strong className="text-slate-700 dark:text-slate-300">Education:</strong> {st.educationStage}
                          </p>
                          <p>
                            <strong className="text-slate-700 dark:text-slate-300">Madrassa:</strong> {st.islamicEducation || 'None'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {st.houseName} • {st.ward}
                          </p>
                        </div>

                        {st.phone && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <a
                              href={`tel:${st.phone}`}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{st.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${st.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: WELFARE & MEDICAL AID ================= */}
        {activeTab === 'welfare' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-900 to-orange-950 text-white p-6 rounded-3xl shadow-lg border border-amber-800/50">
              <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                <HeartPulse className="w-4 h-4 text-amber-300" />
                <span>Welfare &amp; Medical Scheme Matching</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Poverty &amp; Medical Aid Candidates
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/80 mt-1 max-w-xl">
                Identify families and citizens facing chronic health challenges (Dialysis, Heart, Cancer, Bedridden) and BPL economic hardship for Zakat and medical kits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {welfareList.map((wf) => (
                <div
                  key={wf._id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {wf.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {wf.age} yrs • {wf.relationToHead}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                      {wf.economicStatus?.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                    <span className="font-bold block">Medical Condition:</span>
                    <span>
                      {wf.healthCondition === 'Other'
                        ? wf.healthConditionOther || 'Other Illness'
                        : wf.healthCondition}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>{wf.houseName}</span> • <span>{wf.ward}</span>
                  </div>

                  {wf.phone && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <a
                        href={`tel:${wf.phone}`}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{wf.phone}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: MANAGE VOLUNTEERS ================= */}
        {activeTab === 'volunteers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Volunteer Form Card */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Add New Volunteer</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create login credentials for a Mahallu volunteer
                </p>
              </div>

              {volError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{volError}</span>
                </div>
              )}

              {volSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{volSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddVolunteer} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Volunteer Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed Shafi"
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9847123456"
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shafi_v1"
                    value={volUsername}
                    onChange={(e) => setVolUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass@123"
                    value={volPassword}
                    onChange={(e) => setVolPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={volLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {volLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Volunteer Login</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Volunteers List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Active Volunteers ({volunteers.length})
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {volunteers.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No volunteer accounts created yet.
                  </p>
                ) : (
                  volunteers.map((v) => (
                    <div key={v.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          {v.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Username: <code className="font-mono text-emerald-600 font-semibold">{v.username}</code> • Phone: {v.phone || 'N/A'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteVolunteer(v.id)}
                        className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                        title="Remove Volunteer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
