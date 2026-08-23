import React, { useState, useEffect, useRef } from 'react';
import { Search, Activity, AlertCircle, XCircle, CheckCircle, Clock, Store, ShieldCheck, RotateCcw } from 'lucide-react';
import { getTransaction, getEvents, getSettlement, getRefund, getBankCase } from './api';
import { MaskedValue } from './MaskedValue';

const TERMINAL_STATUSES = ['REFUNDED', 'SUCCESS', 'FAILED', 'COMPLETED'];

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [txData, setTxData] = useState(null);
  const [settlementData, setSettlementData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [refundData, setRefundData] = useState(null);
  const [bankCaseData, setBankCaseData] = useState(null);

  // Keep a stable ref to the active transaction ID so the poll interval always uses the right one
  const activeTxId = useRef(null);
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // Fetch the optional refund + bank-case without breaking if they 404
  const fetchOptionalData = async (txId) => {
    const [refundResult, bankResult] = await Promise.allSettled([
      getRefund(txId),
      getBankCase(txId),
    ]);
    if (refundResult.status === 'fulfilled') setRefundData(refundResult.value);
    if (bankResult.status === 'fulfilled')  setBankCaseData(bankResult.value);
  };

  // Poll: re-fetch tx + events + optional data every 1.5 s while still pending
  const startPolling = (txId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!activeTxId.current) { stopPolling(); return; }
      try {
        const [tx, events] = await Promise.all([
          getTransaction(txId),
          getEvents(txId),
        ]);
        setTxData(tx);
        setEventsData(events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        await fetchOptionalData(txId);
        if (TERMINAL_STATUSES.includes(tx.status)) stopPolling();
      } catch (_) {
        stopPolling();
      }
    }, 1500);
  };

  // Cleanup on unmount
  useEffect(() => () => stopPolling(), []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const txId = searchInput.trim();

    stopPolling();
    activeTxId.current = txId;
    setLoading(true);
    setError('');
    setTxData(null);
    setSettlementData(null);
    setEventsData([]);
    setRefundData(null);
    setBankCaseData(null);

    try {
      const [tx, events, settlement] = await Promise.all([
        getTransaction(txId),
        getEvents(txId),
        getSettlement(txId),
      ]);

      setTxData(tx);
      setEventsData(events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      setSettlementData(settlement);

      await fetchOptionalData(txId);

      // Start polling only if still in a non-terminal state
      if (!TERMINAL_STATUSES.includes(tx.status)) {
        startPolling(txId);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Transaction not found or incomplete data available.');
    } finally {
      setLoading(false);
    }
  };

  const renderEventIcon = (status, severity) => {
    if (status === 'SUCCESS' && severity === 'INFO') return <CheckCircle className="text-green-500 bg-white" size={24} />;
    if (status === 'FAILED' && severity === 'ERROR') return <XCircle className="text-red-500 bg-white" size={24} />;
    if (status === 'FAILED' && severity === 'CRITICAL') return <XCircle className="text-red-600 bg-white" size={24} />;
    if (severity === 'WARNING') return <AlertCircle className="text-amber-500 bg-white" size={24} />;
    return <Activity className="text-gray-400 bg-white" size={24} />;
  };

  const isRefunded = txData?.status === 'REFUNDED';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — unchanged */}
      <header className="bg-navy-900 text-white shadow-md border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store size={28} className="text-blue-400" />
            <div>
              <h1 className="text-xl font-bold tracking-wider">RECON MERCHANT</h1>
              <p className="text-xs text-blue-200 tracking-wide uppercase">Transaction &amp; Settlement Monitor</p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter TXN ID (e.g. TXN-DC305164)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="px-4 py-2 bg-navy-800 border border-navy-700 text-white rounded-lg focus:outline-none focus:border-blue-400 text-sm w-64"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!txData && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg mb-6">Enter a transaction ID to monitor settlement status.</p>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center max-w-sm w-full">
              <h4 className="text-gray-900 font-medium mb-2">Development Helper</h4>
              <p className="text-sm text-gray-500 mb-4 text-center">Use the transaction generated in Milestone 2 (RECON PAY).</p>
            </div>
          </div>
        )}

        {txData && settlementData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

            {/* Left Column: Status & Comparison */}
            <div className="lg:col-span-2 space-y-6">

              {/* Primary Status Banner — unchanged */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <XCircle size={56} className="text-red-500" />
                    <div>
                      <h2 className="text-2xl font-bold text-red-700 uppercase tracking-wide">Payment Not Received</h2>
                      <p className="text-red-500 font-medium text-lg">₹0 Received</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-gray-500 text-sm">Expected</span>
                    <span className="font-semibold text-gray-900 text-lg">₹{txData.amount.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm mt-2">Status</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded mt-1 ${
                      isRefunded
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {txData.status}
                    </span>
                  </div>
                </div>

                {/* Warning Alert — unchanged */}
                <div className="p-5 bg-amber-50 border-t border-b border-amber-100 flex items-start gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-amber-800 text-sm font-medium">
                    Payment capture was successful, but the settlement destination does not match the expected merchant account.{' '}
                    <span className="block mt-1 font-normal text-amber-700 text-xs">Note: This is a simulated hackathon transaction. No real money was transferred.</span>
                  </p>
                </div>
              </div>

              {/* Account Comparison — unchanged */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4">Settlement Mismatch Detected</h3>
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Expected Receiver</p>
                    <MaskedValue value={txData.expected_receiver_account_id} type="account" className="text-lg text-green-700" />
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-red-100 p-3 rounded-full text-red-600 font-bold border-2 border-red-200 shadow-sm">VS</div>
                  </div>
                  {/* Actual */}
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase">Actual Routed</div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Actual Settlement Destination</p>
                    <MaskedValue value={settlementData.actual_account_id} type="account" className="text-lg text-red-600 line-through decoration-red-400" />
                  </div>
                </div>
              </div>

              {/* Transaction Metadata — unchanged */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                  <MaskedValue value={txData.transaction_id} type="transaction" className="text-gray-900" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">{new Date(txData.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payer Reference</p>
                  <MaskedValue value={txData.payer_account_id} type="account" className="text-gray-900" />
                </div>
              </div>

              {/* ── NEW: Refund & Recovery section ─────────────────────────────── */}
              {isRefunded && (
                <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
                  {/* Section header */}
                  <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center gap-3">
                    <RotateCcw size={20} className="text-green-600" />
                    <h3 className="text-base font-bold text-green-800 uppercase tracking-wider">Refund &amp; Recovery</h3>
                    <span className="ml-auto flex items-center gap-1.5 bg-green-100 border border-green-300 text-green-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      <ShieldCheck size={11} />
                      Resolved by RECON
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Refund Status */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Refund Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle size={18} className="text-green-600 shrink-0" />
                        <span className="font-bold text-green-800 text-sm">
                          {refundData?.status ?? 'REFUND_COMPLETED'}
                        </span>
                      </div>
                    </div>

                    {/* Refund Amount */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Refund Amount</p>
                      <p className="font-bold text-gray-900 text-lg mt-1">
                        ₹{(refundData?.amount ?? txData.amount).toLocaleString()}
                      </p>
                    </div>

                    {/* Payer (masked) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Payer</p>
                      <MaskedValue
                        value={refundData?.payer_account_id ?? txData.payer_account_id}
                        type="account"
                        className="text-gray-900 text-sm mt-1"
                      />
                    </div>

                    {/* Transaction (masked) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Transaction</p>
                      <MaskedValue
                        value={txData.transaction_id}
                        type="transaction"
                        className="text-gray-900 text-sm mt-1"
                      />
                    </div>

                    {/* Bank Action */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Bank Action</p>
                      <p className="font-semibold text-gray-800 text-sm mt-1 uppercase tracking-wide">
                        {bankCaseData?.status
                          ? bankCaseData.status.replace(/_/g, ' ')
                          : 'CASE FORWARDED TO BANK'}
                      </p>
                    </div>

                    {/* Root Cause */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Root Cause</p>
                      <p className="font-semibold text-red-700 text-sm mt-1 uppercase tracking-wide">
                        {bankCaseData?.reason
                          ? bankCaseData.reason.replace(/_/g, ' ')
                          : 'ACCOUNT ROUTING MISMATCH'}
                      </p>
                    </div>

                    {/* Recovery Action — full-width */}
                    <div className="sm:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-600 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Recovery Action</p>
                        <p className="font-semibold text-green-800 text-sm uppercase tracking-wide">
                          PAYMENT REFUNDED TO PAYER
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
              {/* ── END Refund & Recovery ──────────────────────────────────────── */}

            </div>

            {/* Right Column: Timeline — unchanged + now shows all events incl. RECON/refund */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-gray-400" />
                  Event Timeline
                </h3>

                <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                  {eventsData.map((evt, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className="relative z-10 flex items-center justify-center mt-1 shrink-0">
                        {renderEventIcon(evt.status, evt.severity)}
                      </div>
                      <div className="flex-1 pb-1 border-b border-gray-50 last:border-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{evt.event_type.replace(/_/g, ' ')}</h4>
                          <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                            {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </span>
                        </div>
                        <p className={`text-sm ${evt.severity === 'CRITICAL' || evt.severity === 'ERROR' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {evt.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
