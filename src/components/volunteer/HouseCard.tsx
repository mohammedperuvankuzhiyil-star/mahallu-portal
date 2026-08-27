'use client';

import React from 'react';
import { House } from '@/types';
import { Home, Users, Edit3, Phone, Car, MapPin, Tag } from 'lucide-react';

interface HouseCardProps {
  house: House;
  onEdit: (house: House) => void;
}

export default function HouseCard({ house, onEdit }: HouseCardProps) {
  const head = house.members?.find((m) => m.isHead);
  const totalMembers = house.members?.length || 0;
  const isBpl = house.economicStatus.toLowerCase().includes('bpl') || house.economicStatus.toLowerCase().includes('yellow') || house.economicStatus.toLowerCase().includes('priority');

  const totalVehicles = (house.vehicles || []).reduce((acc, v) => acc + (v.count || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Header with House No, Name, and Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                #{house.houseNo}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isBpl
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
              }`}>
                {house.economicStatus.split(' ')[0]}
              </span>
            </div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1">
              {house.houseName}
            </h3>
          </div>
        </div>

        {/* Quick Edit Button */}
        <button
          onClick={() => onEdit(house)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      {/* House & Family Details Grid */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
            Head of Family:
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
            {head?.name || 'N/A'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
            Ward:
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-500" />
            {house.ward}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
            Contact:
          </span>
          {head?.phone ? (
            <a
              href={`tel:${head.phone}`}
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {head.phone}
            </a>
          ) : (
            <span className="text-slate-400">N/A</span>
          )}
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
            Family Size:
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      {/* Vehicles info preview */}
      {totalVehicles > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Vehicles: {(house.vehicles || []).filter(v => v.count > 0).map(v => `${v.count} ${v.type.split(' ')[0]}`).join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
