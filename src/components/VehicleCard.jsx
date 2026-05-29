export default function VehicleCard({ vehicle: v, services, done, onClick, onArchive }) {
  const fmtDateLocal = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";

  const isFinished = done === services.length && services.length > 0;

  return (
    <div
      onClick={onClick}
      className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-[18px] cursor-pointer hover:border-neutral-750 transition-all hover:bg-neutral-900/10 group relative"
    >
      {isFinished && onArchive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Deseja ocultar o veículo ${v.plate} da tela? (Os dados permanecerão salvos no banco)`)) {
              onArchive(v.id);
            }
          }}
          className="absolute top-3 right-3 bg-[#0a0a0a] hover:bg-red-950/20 text-neutral-500 hover:text-red-400 border border-neutral-850 hover:border-red-900/20 w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] cursor-pointer transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          title="Ocultar Veículo"
        >
          ✕
        </button>
      )}

      <div className="flex justify-between items-start mb-3.5 pr-6">
        <div className="bg-[#141414] border border-neutral-800/80 rounded-md px-2.5 py-1 text-xs text-neutral-400 tracking-[0.15em]">
          {v.plate}
        </div>
        <div className="text-[10px] text-neutral-600">
          {fmtDateLocal(v.created_at)}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-neutral-200 font-semibold text-[15px] group-hover:text-white transition-colors">
          {v.brand} {v.model}
        </div>
        <div className="text-neutral-600 text-xs mt-0.5">
          {v.year} · {v.color}
        </div>
      </div>

      <div className="border-t border-neutral-900/80 pt-3 flex justify-between items-center text-xs">
        <div>
          <div className="text-neutral-400 font-medium">{v.owner_name}</div>
          <div className="text-neutral-600 text-[11px]">{v.owner_phone || "Sem telefone"}</div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-neutral-600">Serviços</div>
          <div className={`text-xs font-semibold ${
            done === services.length && services.length > 0 ? "text-[#34d980]" : "text-neutral-400"
          }`}>
            {done}/{services.length}
          </div>
        </div>
      </div>
    </div>
  );
}
