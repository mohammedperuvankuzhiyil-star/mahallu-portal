'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Home,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [showSkipped, setShowSkipped] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPreviewData(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls') && !selected.name.endsWith('.csv')) {
        setError('Please select a valid Excel file (.xlsx or .xls).');
        return;
      }
      setFile(selected);
    }
  };

  const handleInspectPreview = async () => {
    if (!file) {
      setError('Please choose an Excel file first.');
      return;
    }

    try {
      setPreviewLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to inspect Excel file.');
        return;
      }

      setPreviewData(data);
    } catch (e: any) {
      console.error(e);
      setError('Network error while reading file. Please check file format.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !previewData.allNewHouses) return;

    try {
      setImportLoading(true);
      setError('');

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          housesToImport: previewData.allNewHouses,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to complete import.');
        return;
      }

      onSuccess(data.message || `Successfully imported ${previewData.newHousesCount} houses!`);
      onClose();
    } catch (e: any) {
      console.error(e);
      setError('Error saving imported records to database.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/import/template';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Bulk Excel Data Import
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safely upload committee census records into the portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Safety Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">100% Safe Append Guarantee</span>
              <span className="opacity-90">
                This upload will only append new houses. Any houses already entered by volunteers will be automatically identified and preserved untouched.
              </span>
            </div>
          </div>

          {/* Template Download Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Step 1: Use Standard Excel Template
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Download pre-formatted template with sample families and field guide
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* File Picker Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Step 2: Select Filled Excel File (.xlsx)
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {file ? file.name : 'Click to select or drop Excel file here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB selected`
                  : 'Supports Microsoft Excel (.xlsx)'}
              </p>
            </div>

            {file && !previewData && (
              <button
                type="button"
                onClick={handleInspectPreview}
                disabled={previewLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {previewLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Inspect &amp; Validate File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 3: Inspection Preview Box */}
          {previewData && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 3: Verification Preview
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {previewData.totalRowsDetected} rows parsed
                </span>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                    Total Houses
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {previewData.totalHousesDetected}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                    New to Import
                  </span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {previewData.newHousesCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-center">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">
                    Skipped (Existing)
                  </span>
                  <span className="text-lg font-black text-amber-700 dark:text-amber-400">
                    {previewData.skippedHousesCount}
                  </span>
                </div>
              </div>

              {/* Sample Detected Families Preview */}
              {previewData.sampleNewHouses && previewData.sampleNewHouses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    Sample Houses Ready to Add:
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {previewData.sampleNewHouses.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            #{item.houseNo} - {item.houseName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Head: {item.headName} ({item.headAge} yrs) • {item.membersCount} family members
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          {item.ward}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped Houses Accordion */}
              {previewData.skippedHousesCount > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSkipped(!showSkipped)}
                    className="w-full p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{previewData.skippedHousesCount} houses skipped to protect volunteer records</span>
                    </span>
                    {showSkipped ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSkipped && (
                    <div className="p-3 bg-white dark:bg-slate-900 text-xs space-y-1.5 max-h-36 overflow-y-auto">
                      {previewData.skippedHouses.map((s: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>#{s.houseNo}</strong> ({s.houseName}) &mdash; {s.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {previewData && (
            <button
              type="button"
              disabled={importLoading || previewData.newHousesCount === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
            >
              {importLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm &amp; Import {previewData.newHousesCount} Houses ({previewData.totalMembersToImport} Members)
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
