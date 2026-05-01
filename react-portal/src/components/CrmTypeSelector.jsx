import { CRM_TYPES } from '../api/constants';

export default function CrmTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CRM_TYPES.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`relative border-2 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 bg-white hover:border-blue-600 hover:bg-blue-50 ${
            value === opt.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {value === opt.value && (
            <span className="absolute top-1.5 right-2 w-[18px] h-[18px] bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center">✓</span>
          )}
          <div className="text-3xl mb-2">{opt.icon}</div>
          <div className="text-[0.8rem] font-semibold text-slate-800">{opt.label}</div>
          <div className="text-[0.7rem] text-slate-500 mt-0.5">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}
