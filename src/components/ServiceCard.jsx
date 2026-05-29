export const statusConfig = {
  finalizado: { label: "Finalizado", bgClass: "bg-emerald-950/20 border-emerald-500/20 text-emerald-400", colorClass: "text-emerald-400", dotClass: "bg-emerald-400" },
  em_andamento: { label: "Em Andamento", bgClass: "bg-lime-950/20 border-lime-500/20 text-lime-400", colorClass: "text-lime-400", dotClass: "bg-lime-400" },
  aguardando: { label: "Aguardando", bgClass: "bg-amber-950/20 border-amber-500/20 text-amber-500", colorClass: "text-amber-500", dotClass: "bg-amber-500" },
};

export default function ServiceCard({ service: s, onToggle }) {
  const done = s.status === "finalizado";
  const cfg = statusConfig[s.status] || statusConfig.aguardando;
  
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";
  const fmtCurrency = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className={`border rounded-xl p-[18px] transition-all ${
      done 
        ? "bg-[#080808]/90 border-emerald-950/60 opacity-80" 
        : "bg-[#0d0d0d] border-neutral-900"
    }`}>
      <div className="flex items-start gap-3.5">
        <button 
          onClick={() => onToggle(s)} 
          className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
            done 
              ? "bg-[#0a3d1f] border-emerald-400 text-emerald-400" 
              : "bg-transparent border-neutral-800 hover:border-neutral-600 text-transparent"
          }`}
        >
          ✓
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <div className={`font-semibold text-sm transition-all ${
                done ? "text-neutral-600 line-through" : "text-neutral-200"
              }`}>
                {s.name}
              </div>
              <div className="text-neutral-500 text-xs mt-1 leading-relaxed">
                {s.description}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-[15px] font-bold font-serif ${
                done ? "text-[#34d980]" : "text-amber-500"
              }`}>
                {fmtCurrency(s.value)}
              </div>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md border text-[10px] ${cfg.bgClass}`}>
                <span className={`w-1 h-1 rounded-full ${cfg.dotClass}`} />
                <span>{cfg.label}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-3 flex-wrap text-[11px] text-neutral-600">
            {s.responsible && <span className="flex items-center gap-1">👤 {s.responsible}</span>}
            {s.completed_at && <span className="text-[#34d980] flex items-center gap-1">✓ Finalizado em {fmtDate(s.completed_at)}</span>}
            {!s.completed_at && <span className="flex items-center gap-1">Criado em {fmtDate(s.created_at)}</span>}
            {s.notes && <span className="italic text-neutral-600">"{s.notes}"</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
