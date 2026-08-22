import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Play, CheckCircle, Activity, ChevronRight, CornerDownRight } from 'lucide-react';
import { getReconAnalysis, getTransactionDetails } from './api';

const STATES = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
  ERROR: 'ERROR'
};

const LOADING_STEPS = [
  "Transaction loaded",
  "Payment events loaded",
  "Settlement record loaded",
  "Timeline reconstructed",
  "Anomalies detected",
  "Causal relationships evaluated",
  "Root cause identified"
];

const formatTimeWithMs = (timestamp) => {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
};

function App() {
  const [appState, setAppState] = useState(STATES.INITIAL);
  const [txId, setTxId] = useState('');
  const [reconData, setReconData] = useState(null);
  const [txDetails, setTxDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const handleDemoClick = () => {
    setTxId('TXN-C02E7F14');
  };

  const startRecon = async (e) => {
    e.preventDefault();
    if (!txId.trim()) return;

    setAppState(STATES.LOADING);
    setLoadingStep(0);
    setErrorMsg('');

    try {
      // Parallel API calls
      const [recon, tx] = await Promise.all([
        getReconAnalysis(txId.trim()),
        getTransactionDetails(txId.trim())
      ]);

      // Fake quick loading steps for visual feedback
      for (let i = 1; i <= LOADING_STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 300));
        setLoadingStep(i);
      }

      setReconData(recon);
      setTxDetails(tx);
      setAppState(STATES.RESULT);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Transaction not found or RECON API unavailable.');
      setAppState(STATES.ERROR);
    }
  };

  const renderIcon = (severity, status) => {
    if (status === 'SUCCESS' && severity === 'INFO') return <CheckCircle2 className="text-green-500" size={18} />;
    if (status === 'FAILED' && severity === 'ERROR') return <XCircle className="text-red-500" size={18} />;
    if (status === 'FAILED' && severity === 'CRITICAL') return <XCircle className="text-red-600" size={18} />;
    if (severity === 'WARNING') return <AlertTriangle className="text-amber-500" size={18} />;
    return <Activity className="text-gray-400" size={18} />;
  };

  if (appState === STATES.INITIAL || appState === STATES.ERROR) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-xl w-full text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <ShieldAlert size={80} className="text-blue-500" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-widest mb-4 uppercase text-blue-50">RECON</h1>
          <h2 className="text-xl font-medium text-blue-300 mb-2 uppercase tracking-widest">Incident Reconstruction Engine</h2>
          <p className="text-navy-300 mb-10 text-gray-400">"Reconstruct the failure. Trace the evidence. Identify the root cause."</p>
          
          {appState === STATES.ERROR && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={startRecon} className="bg-navy-800 p-6 rounded-xl border border-navy-700 shadow-2xl">
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Enter Transaction ID (e.g. TXN-C02E7F14)"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 text-white px-4 py-4 rounded-lg focus:outline-none focus:border-blue-500 text-center font-mono text-lg transition-colors"
              />
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                Reconstruct Incident <ArrowRight size={20} />
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Demo transaction:</span>
            <button onClick={handleDemoClick} className="font-mono text-blue-400 hover:text-blue-300 border-b border-dashed border-blue-400/50">
              TXN-C02E7F14
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === STATES.LOADING) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-navy-800 rounded-xl p-8 border border-navy-700 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-3 uppercase tracking-wider">
            <Activity className="animate-pulse" />
            Analyzing Transaction
          </h2>
          <div className="space-y-4">
            {LOADING_STEPS.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${idx < loadingStep ? 'opacity-100' : 'opacity-20'}`}>
                {idx < loadingStep ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-navy-600" />
                )}
                <span className={idx < loadingStep ? 'text-gray-200' : 'text-gray-500'}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (appState === STATES.RESULT && reconData && txDetails) {
    const { causal_derivation, incident_analysis, root_cause, evidence, confidence, recommendation } = reconData;
    const { root_upstream_anomaly, downstream_consequences, healthy_precursors } = incident_analysis;

    return (
      <div className="min-h-screen bg-gray-100 font-sans pb-20">
        
        {/* Header */}
        <header className="bg-navy-900 text-white sticky top-0 z-50 shadow-lg border-b border-navy-700">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ShieldAlert size={32} className="text-blue-400" />
              <div>
                <h1 className="text-xl font-bold tracking-widest uppercase">RECON</h1>
                <p className="text-xs text-navy-300 tracking-widest uppercase">Incident Reconstruction Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                <span className="text-sm font-semibold tracking-wide text-green-400 uppercase">Root Cause Identified</span>
              </div>
              <div className="bg-navy-800 px-4 py-2 rounded border border-navy-700 font-mono text-sm">
                {reconData.transaction_id}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Transaction ID</p>
                <p className="font-mono text-gray-900">{txDetails.transaction_id}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount</p>
                <p className="font-medium text-gray-900 font-mono">₹{txDetails.amount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Payer</p>
                <p className="font-mono text-gray-900 text-sm truncate">{txDetails.payer_account_id}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Currency</p>
                <p className="font-medium text-gray-900">{txDetails.currency}</p>
              </div>
            </div>

            {/* Upstream Anomaly Visual */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
                <AlertTriangle size={24} className="text-red-500" />
                <h3 className="text-red-700 font-bold uppercase tracking-wider text-lg">Upstream Anomaly Detected</h3>
              </div>
              <div className="p-6">
                <h4 className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide mb-6">
                  {root_upstream_anomaly ? root_upstream_anomaly.event_type.replace(/_/g, ' ') : "No Anomaly"}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Expected Receiver</p>
                    <p className="font-mono text-green-700 font-medium text-lg">{causal_derivation.expected_destination || "N/A"}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Actual Settlement Destination</p>
                    <p className="font-mono text-red-600 font-medium text-lg">{causal_derivation.actual_destination || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Root Cause */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" />
                    Root Cause Identified
                  </h3>
                  <p className="text-gray-600 mt-2 font-medium">{root_cause}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-blue-800">{confidence}</p>
                  </div>
                </div>
              </div>
              
              <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Supporting Evidence</h4>
              <ul className="space-y-3">
                {evidence && evidence.length > 0 ? evidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                )) : (
                  <li className="text-gray-500 italic">No automated evidence returned.</li>
                )}
              </ul>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4">
              <div className="bg-blue-100 rounded-full p-2 h-max shrink-0">
                <Play className="text-blue-600" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 uppercase tracking-wide mb-1">Recommendation</h4>
                <p className="text-blue-800">{recommendation}</p>
              </div>
            </div>

          </div>

          {/* Right Column (Graph + Timeline) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Causal Graph */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Causal Relationship Graph</h3>
              
              <div className="space-y-2">
                {/* Precursor placeholder node */}
                <div className="flex flex-col items-center">
                  <div className="border border-green-200 bg-green-50 px-4 py-2 rounded-lg text-green-700 text-xs font-bold w-full text-center shadow-sm">
                    Precursor Events OK
                  </div>
                  <div className="h-6 w-px bg-gray-300 my-1"></div>
                </div>

                {/* Root Anomaly Node */}
                {root_upstream_anomaly && (
                  <>
                    <div className="flex flex-col items-center w-full mt-2 mb-2">
                      <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Upstream Anomaly</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="border-2 border-red-400 bg-red-50 px-4 py-3 rounded-lg text-red-700 text-sm font-bold w-full text-center shadow-md relative">
                        {root_upstream_anomaly.event_type}
                        <span className="absolute -right-2 -top-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">ROOT</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Downstream nodes */}
                {downstream_consequences.length > 0 && (
                  <div className="flex flex-col items-center w-full mt-4 mb-2">
                    <span className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">Downstream Consequences</span>
                  </div>
                )}
                {downstream_consequences.map((evt, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-gray-300 my-1 flex items-center justify-center">
                        <CornerDownRight size={14} className="text-gray-400 ml-4" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="border border-amber-200 bg-amber-50 px-4 py-2 rounded-lg text-amber-800 text-xs font-bold w-full text-center shadow-sm">
                        {evt.event_type}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Chronological Timeline</h3>
              <div className="space-y-5">
                {[...healthy_precursors, root_upstream_anomaly, ...downstream_consequences].filter(Boolean).map((evt, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-0.5 shrink-0">
                      {renderIcon(evt.severity, evt.status)}
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-wide ${evt === root_upstream_anomaly ? 'text-red-600' : 'text-gray-700'}`}>
                          {evt.event_type}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded">
                          {formatTimeWithMs(evt.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    );
  }

  return null;
}

export default App;
