export default function ChipSelector({ options, value, onChange, single = false }) {
  const toggle = (opt) => {
    if (single) {
      onChange(opt);
      return;
    }
    const arr = Array.isArray(value) ? value : [];
    if (arr.includes(opt)) {
      onChange(arr.filter((v) => v !== opt));
    } else {
      onChange([...arr, opt]);
    }
  };

  const isActive = (opt) =>
    single ? value === opt : Array.isArray(value) && value.includes(opt);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`px-3.5 py-1.5 border-[1.5px] rounded-[20px] text-[0.8rem] cursor-pointer transition-all duration-150 select-none ${
            isActive(opt)
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 text-slate-500 bg-white hover:border-blue-600 hover:text-blue-600'
          }`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
