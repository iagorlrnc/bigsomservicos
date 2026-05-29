export default function FormField({ label, children, required }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] text-neutral-500 mb-1.5 tracking-wider uppercase font-semibold">
        {label}{required && <span className="text-neutral-600"> *</span>}
      </label>
      {children}
    </div>
  );
}
