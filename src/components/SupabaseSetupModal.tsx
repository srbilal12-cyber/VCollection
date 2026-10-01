import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Code,
  Send,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_SETUP_SQL,
  checkSupabaseSchema,
  SchemaDiagnostics,
  syncOrderToSupabase,
  supabase
} from '../lib/supabase';
import { Order } from '../types';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [diagnostics, setDiagnostics] = useState<SchemaDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testOrderSuccess, setTestOrderSuccess] = useState<string | null>(null);
  const [testOrderError, setTestOrderError] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await checkSupabaseSchema();
      setDiagnostics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
      setTestOrderSuccess(null);
      setTestOrderError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTestOrder = async () => {
    setIsSendingTest(true);
    setTestOrderSuccess(null);
    setTestOrderError(null);

    const testOrder: Order = {
      id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: [],
      subtotal: 6500,
      discount: 0,
      shipping: 200,
      dropShippingFee: 200,
      codFee: 100,
      total: 6800,
      status: 'pending',
      trackingNumber: `TCS-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
      courierName: 'TCS Express Pakistan',
      expectedDeliveryDate: '2-4 Business Days',
      deliveryTimeSlot: '2:00 PM - 6:00 PM',
      deliveryNotes: 'Test order sent from Atelier Setup Assistant to verify Supabase backend storage.',
      shippingAddress: {
        fullName: 'Bilal (Store Owner Test)',
        email: 'srbilal12@gmail.com',
        phone: '+92 300 1234567',
        street: 'Main Boulevard, Gulberg III',
        city: 'Lahore',
        postalCode: '54000',
        country: 'Pakistan',
      },
      paymentMethod: 'cod',
      estimatedDelivery: '2-4 Business Days',
    };

    const res = await syncOrderToSupabase(testOrder);
    setIsSendingTest(false);

    if (res.success) {
      setTestOrderSuccess(`Success! Test Order #${testOrder.id} has been saved to your Supabase "orders" table! Check your Supabase Table Editor.`);
      runDiagnostics();
    } else {
      setTestOrderError(res.error || 'Failed to save order. Please make sure the SQL table has been created.');
    }
  };

  const allTablesReady = diagnostics?.ordersTableExists && diagnostics?.profilesTableExists;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12151e] border border-gold-subtle rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Top Gold Accent */}
        <div className="absolute top-0 inset-x-0 gold-foil-line" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                  Supabase Cloud Setup & Diagnostics
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                  {SUPABASE_PROJECT_ID}
                </span>
              </div>
              <h3 className="font-serif text-lg text-white">
                Connect & View Data in Supabase Table Editor
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Diagnostic Status Box */}
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Live Supabase Schema Status:
              </h4>
              <button
                type="button"
                onClick={runDiagnostics}
                disabled={isLoading}
                className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-Check Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Orders Table */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                diagnostics?.ordersTableExists
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {diagnostics?.ordersTableExists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>Table: <strong>public.orders</strong></span>
                </div>
                <span className="font-mono text-[10px]">
                  {diagnostics?.ordersTableExists ? '✓ Ready' : '❌ Not Created'}
                </span>
              </div>

              {/* Profiles Table */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${
                diagnostics?.profilesTableExists
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {diagnostics?.profilesTableExists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>Table: <strong>public.profiles</strong></span>
                </div>
                <span className="font-mono text-[10px]">
                  {diagnostics?.profilesTableExists ? '✓ Ready' : '❌ Not Created'}
                </span>
              </div>
            </div>

            {!allTablesReady && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Why data isn't showing in Supabase yet:</span>
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  In Supabase, new projects start without database tables. You must run the 1-click SQL script below in your Supabase SQL Editor to create the <strong>orders</strong> and <strong>profiles</strong> tables and allow public inserts.
                </p>
              </div>
            )}
          </div>

          {/* Setup Guide Steps */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-[#d4af37] font-bold">
              3-Step Solution: Create Tables in Supabase (Takes 30 seconds)
            </h4>

            {/* Step 1 */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-bold flex items-center justify-center text-[11px]">1</span>
                  <span>Copy Database Setup SQL Script:</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:brightness-110 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              {/* Collapsible/Scrollable SQL Preview */}
              <div className="relative">
                <pre className="p-3 bg-black/70 border border-white/10 rounded-lg text-[11px] font-mono text-zinc-300 max-h-36 overflow-y-auto leading-relaxed select-all">
                  {SUPABASE_SETUP_SQL}
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-bold flex items-center justify-center text-[11px]">2</span>
                  <span>Open Supabase SQL Editor & Run:</span>
                </span>
                <p className="text-[11px] text-zinc-400">
                  Paste the copied script into Supabase SQL Editor and click the green <strong>"RUN"</strong> button.
                </p>
              </div>

              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all shrink-0"
              >
                <span>Open Supabase SQL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black font-bold flex items-center justify-center text-[11px]">3</span>
                  <span>Test Supabase Live Insertion:</span>
                </span>
                <p className="text-[11px] text-zinc-400">
                  After running the SQL script in Supabase, click below to send a live test order to verify it appears in your Table Editor.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendTestOrder}
                disabled={isSendingTest}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all shrink-0 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Sending...' : 'Send Test Order'}</span>
              </button>
            </div>
          </div>

          {/* Test Order Results */}
          {testOrderSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{testOrderSuccess}</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Go to <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`} target="_blank" rel="noopener noreferrer" className="text-[#d4af37] underline">Supabase Table Editor</a> and click on the <strong>orders</strong> table to see the row!
              </p>
            </div>
          )}

          {testOrderError && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Insert Failed:</span>
              </div>
              <p className="font-mono text-[11px] text-rose-300">{testOrderError}</p>
              <p className="text-[11px] text-zinc-400 pt-1">
                Follow Step 1 and Step 2 above to create the tables in your Supabase SQL Editor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
          >
            <span>Open Supabase Table Editor</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
