export default function Toast({ toasts, remove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5">
      {toasts.map(t => {
        let bgClass = "bg-neutral-900 border-neutral-800 text-white";
        let iconColor = "text-neutral-400";
        let icon = "ℹ";
        
        if (t.type === "success") {
          bgClass = "bg-[#0a3d1f] border-[#34d980]/40 text-white";
          iconColor = "text-[#34d980]";
          icon = "✓";
        } else if (t.type === "error") {
          bgClass = "bg-[#3d0a0a] border-[#d93434]/40 text-white";
          iconColor = "text-[#d93434]";
          icon = "✗";
        }
        
        return (
          <div
            key={t.id}
            className={`border px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 min-w-[260px] animate-slide-in-right ${bgClass}`}
          >
            <span className={`font-semibold ${iconColor}`}>
              {icon}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors text-lg font-light ml-2"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
