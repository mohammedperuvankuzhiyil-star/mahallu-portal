'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Home,
  User,
  Users,
  Car,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import {
  WARDS,
  ECONOMIC_STATUS_OPTIONS,
  HOUSE_OWNERSHIP_OPTIONS,
  VEHICLE_TYPES,
  GENDER_OPTIONS,
  BLOOD_GROUPS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
  EDUCATION_STAGES,
  CLASS_YEAR_OPTIONS,
  ISLAMIC_EDUCATION_OPTIONS,
  PRAVASI_COUNTRIES,
  JOB_CATEGORIES,
  HEALTH_CONDITIONS,
  SPECIAL_SKILLS,
} from '@/lib/constants';
import { House, Citizen, VehicleCount } from '@/types';

interface HouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: House | null;
}

const defaultHead: Partial<Citizen> = {
  name: '',
  age: 45,
  gender: 'Male',
  bloodGroup: 'O+',
  maritalStatus: 'Married',
  phone: '',
  educationStage: 'High School (Class 8-10 / SSLC)',
  classOrYear: 'Course Completed / Graduated',
  islamicEducation: 'Madrassa High School (Class 5-10)',
  isPravasi: false,
  pravasiCountry: 'United Arab Emirates (UAE)',
  jobCategory: 'Daily Wage / Coolie / Construction',
  specificJob: '',
  healthCondition: 'None (Healthy)',
  healthConditionOther: '',
  specialSkills: 'None',
  specialSkillsOther: '',
};

const createEmptyMember = (): Partial<Citizen> => ({
  name: '',
  age: 20,
  gender: 'Male',
  relationToHead: 'Son',
  bloodGroup: 'Unknown / Not Tested',
  maritalStatus: 'Single / Unmarried',
  phone: '',
  educationStage: 'High School (Class 8-10 / SSLC)',
  classOrYear: 'Class 10 (SSLC Candidate)',
  islamicEducation: 'Madrassa High School (Class 5-10)',
  isPravasi: false,
  pravasiCountry: 'United Arab Emirates (UAE)',
  jobCategory: 'Student',
  specificJob: '',
  healthCondition: 'None (Healthy)',
  healthConditionOther: '',
  specialSkills: 'None',
  specialSkillsOther: '',
});

export default function HouseFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: HouseFormModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: House Info State
  const [houseNo, setHouseNo] = useState(initialData?.houseNo || '');
  const [houseName, setHouseName] = useState(initialData?.houseName || '');
  const [ward, setWard] = useState(initialData?.ward || WARDS[0]);
  const [economicStatus, setEconomicStatus] = useState(
    initialData?.economicStatus || ECONOMIC_STATUS_OPTIONS[0]
  );
  const [houseOwnership, setHouseOwnership] = useState(
    initialData?.houseOwnership || HOUSE_OWNERSHIP_OPTIONS[0]
  );

  // Initialize Vehicle Counts
  const [vehicles, setVehicles] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    VEHICLE_TYPES.forEach((vt) => {
      counts[vt.label] = 0;
    });
    if (initialData?.vehicles) {
      initialData.vehicles.forEach((v) => {
        counts[v.type] = v.count;
      });
    }
    return counts;
  });

  // Step 2: Head of House State
  const existingHead = initialData?.members?.find((m) => m.isHead);
  const [head, setHead] = useState<Partial<Citizen>>(existingHead || defaultHead);

  // Step 3: Members State
  const existingMembers = (initialData?.members || []).filter((m) => !m.isHead);
  const [members, setMembers] = useState<Partial<Citizen>[]>(existingMembers);

  if (!isOpen) return null;

  const handleVehicleCountChange = (typeLabel: string, delta: number) => {
    setVehicles((prev) => {
      const current = prev[typeLabel] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [typeLabel]: next };
    });
  };

  const handleAddMember = () => {
    setMembers((prev) => [...prev, createEmptyMember()]);
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof Citizen, value: any) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    setError('');

    // Validations
    if (!houseNo.trim()) {
      setStep(1);
      setError('Please provide a House Number.');
      return;
    }
    if (!houseName.trim()) {
      setStep(1);
      setError('Please provide a House / Family Name.');
      return;
    }
    if (!head.name?.trim()) {
      setStep(2);
      setError('Please provide the Head of House name.');
      return;
    }

    setLoading(true);

    try {
      const formattedVehicles: VehicleCount[] = Object.entries(vehicles)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      const payload = {
        house: {
          houseNo: houseNo.trim(),
          houseName: houseName.trim(),
          ward,
          economicStatus,
          houseOwnership,
          vehicles: formattedVehicles,
        },
        head,
        members,
      };

      const url = initialData?._id
        ? `/api/houses/${initialData._id}`
        : '/api/houses';
      const method = initialData?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save house entry');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit House Record' : 'New House Entry'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {step} of 3 • {step === 1 ? 'House Info' : step === 2 ? 'Head of Family' : 'Family Members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-950/60 p-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`py-2 px-1 text-center rounded-xl flex items-center justify-center gap-1 transition-all ${
              step === 1
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>1. House</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-2 px-1 text-center rounded-xl flex items-center justify-center gap-1 transition-all ${
              step === 2
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>2. Head</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-2 px-1 text-center rounded-xl flex items-center justify-center gap-1 transition-all ${
              step === 3
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Members ({members.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1: HOUSE DETAILS ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    House Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12/450 or 45B"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    House / Family Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Baitul Noor (Veliyil House)"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ward (Govt. Ward)
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Economic Status
                  </label>
                  <select
                    value={economicStatus}
                    onChange={(e) => setEconomicStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ECONOMIC_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    House Ownership
                  </label>
                  <select
                    value={houseOwnership}
                    onChange={(e) => setHouseOwnership(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {HOUSE_OWNERSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Vehicle Counter Section */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Vehicles Owned & Count
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Specify the number of vehicles in this household
                </p>

                <div className="space-y-2.5">
                  {VEHICLE_TYPES.map((vt) => {
                    const count = vehicles[vt.label] || 0;
                    return (
                      <div
                        key={vt.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                      >
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {vt.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleVehicleCountChange(vt.label, -1)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVehicleCountChange(vt.label, 1)}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: HEAD OF HOUSE ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                <span>Entering details for the primary Head of the Household</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Head Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibrahim Kutty V.P."
                    value={head.name || ''}
                    onChange={(e) => setHead({ ...head, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={head.age || ''}
                    onChange={(e) => setHead({ ...head, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={head.gender || 'Male'}
                    onChange={(e) => setHead({ ...head, gender: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={head.bloodGroup || 'O+'}
                    onChange={(e) => setHead({ ...head, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={head.maritalStatus || 'Married'}
                    onChange={(e) => setHead({ ...head, maritalStatus: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {MARITAL_STATUS_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9847112233"
                  value={head.phone || ''}
                  onChange={(e) => setHead({ ...head, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Education Stage & Class/Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    General Education Stage
                  </label>
                  <select
                    value={head.educationStage || EDUCATION_STAGES[0]}
                    onChange={(e) => setHead({ ...head, educationStage: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {EDUCATION_STAGES.map((ed) => (
                      <option key={ed} value={ed}>
                        {ed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class / Year / Status
                  </label>
                  <select
                    value={head.classOrYear || CLASS_YEAR_OPTIONS[0]}
                    onChange={(e) => setHead({ ...head, classOrYear: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CLASS_YEAR_OPTIONS.map((cy) => (
                      <option key={cy} value={cy}>
                        {cy}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Islamic Education */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Islamic / Religious Education
                </label>
                <select
                  value={head.islamicEducation || ISLAMIC_EDUCATION_OPTIONS[0]}
                  onChange={(e) => setHead({ ...head, islamicEducation: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {ISLAMIC_EDUCATION_OPTIONS.map((ie) => (
                    <option key={ie} value={ie}>
                      {ie}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pravasi Status */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Is Pravasi (NRI / Working Abroad / Other State)?
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHead({ ...head, isPravasi: true })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        head.isPravasi
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHead({ ...head, isPravasi: false })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        !head.isPravasi
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {head.isPravasi && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pravasi Country / Location
                    </label>
                    <select
                      value={head.pravasiCountry || PRAVASI_COUNTRIES[0]}
                      onChange={(e) => setHead({ ...head, pravasiCountry: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {PRAVASI_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Category
                  </label>
                  <select
                    value={head.jobCategory || JOB_CATEGORIES[0]}
                    onChange={(e) => setHead({ ...head, jobCategory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {JOB_CATEGORIES.map((jc) => (
                      <option key={jc} value={jc}>
                        {jc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Job Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, Shop Manager"
                    value={head.specificJob || ''}
                    onChange={(e) => setHead({ ...head, specificJob: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Health / Chronic Illness with Dynamic "Other" */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Health / Chronic Illness
                </label>
                <select
                  value={head.healthCondition || HEALTH_CONDITIONS[0]}
                  onChange={(e) => setHead({ ...head, healthCondition: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {HEALTH_CONDITIONS.map((hc) => (
                    <option key={hc} value={hc}>
                      {hc}
                    </option>
                  ))}
                </select>

                {head.healthCondition === 'Other' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      Specify Other Health Condition:
                    </label>
                    <input
                      type="text"
                      placeholder="Please specify illness or medical requirement..."
                      value={head.healthConditionOther || ''}
                      onChange={(e) => setHead({ ...head, healthConditionOther: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Special Skills with Dynamic "Other" */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Special Skills / Talents
                </label>
                <select
                  value={head.specialSkills || SPECIAL_SKILLS[0]}
                  onChange={(e) => setHead({ ...head, specialSkills: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SPECIAL_SKILLS.map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>

                {head.specialSkills === 'Other' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      Specify Other Special Skill / Interest:
                    </label>
                    <input
                      type="text"
                      placeholder="Please specify special talent or skill..."
                      value={head.specialSkillsOther || ''}
                      onChange={(e) => setHead({ ...head, specialSkillsOther: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: FAMILY MEMBERS ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Family Members List
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add other household members (Spouse, Children, Parents, etc.)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    No additional family members added yet.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Click &quot;Add Member&quot; above to add family members.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Member</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Member #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Member's full name"
                            value={member.name || ''}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Relation to Head
                          </label>
                          <select
                            value={member.relationToHead || RELATION_OPTIONS[2]}
                            onChange={(e) => handleMemberChange(index, 'relationToHead', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {RELATION_OPTIONS.filter((r) => r !== 'Self (Head)').map((rel) => (
                              <option key={rel} value={rel}>
                                {rel}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={member.age || ''}
                            onChange={(e) => handleMemberChange(index, 'age', Number(e.target.value))}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Gender
                          </label>
                          <select
                            value={member.gender || 'Male'}
                            onChange={(e) => handleMemberChange(index, 'gender', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {GENDER_OPTIONS.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Blood Group
                          </label>
                          <select
                            value={member.bloodGroup || 'Unknown / Not Tested'}
                            onChange={(e) => handleMemberChange(index, 'bloodGroup', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {BLOOD_GROUPS.map((bg) => (
                              <option key={bg} value={bg}>
                                {bg}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Marital Status
                          </label>
                          <select
                            value={member.maritalStatus || 'Single / Unmarried'}
                            onChange={(e) => handleMemberChange(index, 'maritalStatus', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {MARITAL_STATUS_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Education Stage
                          </label>
                          <select
                            value={member.educationStage || EDUCATION_STAGES[3]}
                            onChange={(e) => handleMemberChange(index, 'educationStage', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {EDUCATION_STAGES.map((ed) => (
                              <option key={ed} value={ed}>
                                {ed}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Class / Course Status
                          </label>
                          <select
                            value={member.classOrYear || CLASS_YEAR_OPTIONS[9]}
                            onChange={(e) => handleMemberChange(index, 'classOrYear', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {CLASS_YEAR_OPTIONS.map((cy) => (
                              <option key={cy} value={cy}>
                                {cy}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Islamic Education */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Islamic / Religious Education
                        </label>
                        <select
                          value={member.islamicEducation || ISLAMIC_EDUCATION_OPTIONS[0]}
                          onChange={(e) => handleMemberChange(index, 'islamicEducation', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {ISLAMIC_EDUCATION_OPTIONS.map((ie) => (
                            <option key={ie} value={ie}>
                              {ie}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Contact Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 9847112233"
                          value={member.phone || ''}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Pravasi Status */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            Is Pravasi (NRI / Working Abroad / Other State)?
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleMemberChange(index, 'isPravasi', true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                member.isPravasi
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMemberChange(index, 'isPravasi', false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                !member.isPravasi
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>

                        {member.isPravasi && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Pravasi Country / Location
                            </label>
                            <select
                              value={member.pravasiCountry || PRAVASI_COUNTRIES[0]}
                              onChange={(e) => handleMemberChange(index, 'pravasiCountry', e.target.value)}
                              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                              {PRAVASI_COUNTRIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Job Category
                          </label>
                          <select
                            value={member.jobCategory || JOB_CATEGORIES[10]}
                            onChange={(e) => handleMemberChange(index, 'jobCategory', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            {JOB_CATEGORIES.map((jc) => (
                              <option key={jc} value={jc}>
                                {jc}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Specific Job Title / Role
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Accountant, Student"
                            value={member.specificJob || ''}
                            onChange={(e) => handleMemberChange(index, 'specificJob', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Health with Dynamic Other */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Health / Chronic Illness
                        </label>
                        <select
                          value={member.healthCondition || HEALTH_CONDITIONS[0]}
                          onChange={(e) => handleMemberChange(index, 'healthCondition', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {HEALTH_CONDITIONS.map((hc) => (
                            <option key={hc} value={hc}>
                              {hc}
                            </option>
                          ))}
                        </select>

                        {member.healthCondition === 'Other' && (
                          <div className="pt-1">
                            <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                              Specify Other Health Condition:
                            </label>
                            <input
                              type="text"
                              placeholder="Describe illness or medical requirement..."
                              value={member.healthConditionOther || ''}
                              onChange={(e) => handleMemberChange(index, 'healthConditionOther', e.target.value)}
                              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Special Skills with Dynamic Other */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Special Skills / Talents
                        </label>
                        <select
                          value={member.specialSkills || SPECIAL_SKILLS[0]}
                          onChange={(e) => handleMemberChange(index, 'specialSkills', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {SPECIAL_SKILLS.map((sk) => (
                            <option key={sk} value={sk}>
                              {sk}
                            </option>
                          ))}
                        </select>

                        {member.specialSkills === 'Other' && (
                          <div className="pt-1">
                            <label className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                              Specify Other Special Skill / Interest:
                            </label>
                            <input
                              type="text"
                              placeholder="Describe special skill..."
                              value={member.specialSkillsOther || ''}
                              onChange={(e) => handleMemberChange(index, 'specialSkillsOther', e.target.value)}
                              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 rounded-b-3xl">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && (!houseNo.trim() || !houseName.trim())) {
                  setError('Please fill in House Number and House Name.');
                  return;
                }
                if (step === 2 && !head.name?.trim()) {
                  setError('Please fill in the Head of House name.');
                  return;
                }
                setError('');
                setStep((s) => (s + 1) as any);
              }}
              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'Save Changes' : 'Submit House Entry'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
