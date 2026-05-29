export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-300 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all ${className}`}
    />
  );
}
