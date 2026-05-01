import { useRef } from 'react';

export default function OtpInput({ length = 6, value, onChange }) {
  const inputs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[idx] = val;
    onChange(next.join(''));
    if (val && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (paste) {
      onChange(paste.padEnd(length, '').slice(0, length));
      inputs.current[Math.min(paste.length, length - 1)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-left my-6" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          className="w-[52px] h-[56px] text-center text-2xl font-bold border-2 border-slate-200 rounded-lg outline-none transition-[border-color] duration-200 focus:border-blue-600 focus:ring-[3px] focus:ring-blue-500/10 font-[inherit]"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
