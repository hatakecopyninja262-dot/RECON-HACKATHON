import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskSensitive } from './utils/maskSensitive';

/**
 * MaskedValue
 * Renders a sensitive value masked by default with an optional Reveal toggle.
 *
 * Props:
 *   value       {string}  — The actual (unmasked) value. Never sent masked to API.
 *   type        {string}  — Mask type: 'transaction' | 'account' | 'generic' etc.
 *   showReveal  {boolean} — Whether to show the Reveal/Hide toggle button (default true)
 *   className   {string}  — Optional extra classes on the wrapper
 */
export function MaskedValue({ value, type = 'generic', showReveal = true, className = '' }) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return <span className={`font-mono text-gray-400 ${className}`}>—</span>;

  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="font-mono tracking-wide">
        {revealed ? value : maskSensitive(value, type)}
      </span>
      {showReveal && (
        <button
          onClick={() => setRevealed(r => !r)}
          title={revealed ? 'Hide sensitive value' : 'Reveal sensitive value'}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-200 border border-indigo-500/30 rounded px-1.5 py-0.5 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
        >
          {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      )}
    </span>
  );
}

export default MaskedValue;
