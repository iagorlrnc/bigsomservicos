import { statusConfig } from "./statusConfig"

export default function ServiceCard({
  service: s,
  onToggle,
  onEdit,
  onDelete,
}) {
  const done = s.status === "finalizado"
  const cfg = statusConfig[s.status] || statusConfig.aguardando

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-")
  const fmtCurrency = (v) =>
    `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

  return (
    <div
      className={`border rounded-xl p-[18px] transition-all ${
        done
          ? "bg-[#080808]/90 border-emerald-950/60 opacity-80"
          : "bg-[#0d0d0d] border-neutral-900"
      }`}
    >
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
              <div
                className={`font-semibold text-sm transition-all ${
                  done ? "text-neutral-600 line-through" : "text-neutral-200"
                }`}
              >
                {s.name}
              </div>
              <div className="text-neutral-500 text-xs mt-1 leading-relaxed">
                {s.description}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(s)}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:text-white"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(s)}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all bg-[#3b1111] border-red-900/30 text-red-300 hover:bg-red-950/30 hover:text-red-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}

              <div className="text-right flex-shrink-0">
                <div
                  className={`text-[15px] font-bold font-serif ${
                    done ? "text-[#34d980]" : "text-amber-500"
                  }`}
                >
                  {fmtCurrency(s.value)}
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md border text-[10px] ${cfg.bgClass}`}
                >
                  <span className={`w-1 h-1 rounded-full ${cfg.dotClass}`} />
                  <span>{cfg.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-3 flex-wrap text-[11px] text-neutral-600">
            {s.responsible && (
              <span className="flex items-center gap-1">
                👤 {s.responsible}
              </span>
            )}
            {s.completed_at && (
              <span className="text-[#34d980] flex items-center gap-1">
                ✓ Finalizado em {fmtDate(s.completed_at)}
              </span>
            )}
            {!s.completed_at && (
              <span className="flex items-center gap-1">
                Criado em {fmtDate(s.created_at)}
              </span>
            )}
            {s.notes && (
              <span className="italic text-neutral-600">"{s.notes}"</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
