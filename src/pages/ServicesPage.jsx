import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { statusConfig } from "../components/statusConfig"

export default function ServicesPage({
  vehicles,
  services,
  updateService,
  addToast,
}) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")

  const filtered =
    filter === "all" ? services : services.filter((s) => s.status === filter)
  const getVehicle = (id) => vehicles.find((v) => v.id === id)

  const handleToggle = async (svc) => {
    const done = svc.status === "finalizado"
    try {
      await updateService(svc.id, {
        status: done ? "em_andamento" : "finalizado",
        completed_at: done ? null : new Date().toISOString(),
      })
      addToast(
        done ? "Serviço reaberto" : "Serviço finalizado! ✓",
        done ? "info" : "success",
      )
    } catch (err) {
      console.error(err)
      addToast("Erro ao atualizar serviço.", "error")
    }
  }

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-")
  const fmtCurrency = (v) =>
    `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

  return (
    <div>
      <h1 className="text-white text-2xl font-semibold mb-1">Serviços</h1>
      <p className="text-neutral-500 text-xs mb-6">
        {services.length} serviços no total
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1.5 scrollbar-thin">
        {[
          { key: "all", label: "Todos" },
          ...Object.entries(statusConfig).map(([k, v]) => ({
            key: k,
            label: v.label,
          })),
        ].map((f) => {
          const isActive = filter === f.key
          const count =
            f.key === "all"
              ? services.length
              : services.filter((s) => s.status === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white border-white text-black font-semibold shadow-md"
                  : "bg-[#0d0d0d] border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800"
              }`}
            >
              {f.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Services Table */}
      <div className="bg-[#0d0d0d] border border-neutral-900 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-950/60 bg-[#0a0a0a]/55">
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider hidden sm:table-cell">
                  Responsável
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider hidden md:table-cell">
                  Data
                </th>
                <th className="px-5 py-3.5 text-[10px] text-neutral-600 font-bold uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950/30 text-xs">
              {filtered.map((s) => {
                const v = getVehicle(s.vehicle_id)
                const cfg = statusConfig[s.status] || statusConfig.aguardando
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-neutral-900/10 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="text-neutral-250 font-semibold">
                        {s.name}
                      </div>
                      <div
                        className="text-neutral-500 text-[11px] mt-0.5 max-w-[240px] truncate"
                        title={s.description}
                      >
                        {s.description}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {v ? (
                        <button
                          onClick={() =>
                            navigate(
                              `/veiculos/${v.plate.replace("-", "").toUpperCase()}`,
                            )
                          }
                          className="bg-transparent text-left border-none p-0 cursor-pointer text-neutral-450 hover:text-white transition-colors"
                        >
                          <div className="font-semibold">
                            {v.brand} {v.model}
                          </div>
                          <div className="text-neutral-650 text-[10px] tracking-wider mt-0.5 uppercase">
                            {v.plate}
                          </div>
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-4 text-neutral-500 font-medium hidden sm:table-cell">
                      {s.responsible || "-"}
                    </td>
                    <td className="px-5 py-4 text-amber-500 font-bold">
                      {fmtCurrency(s.value)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] ${cfg.bgClass}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 font-medium hidden md:table-cell">
                      {fmtDate(s.completed_at || s.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggle(s)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all ${
                          s.status === "finalizado"
                            ? "bg-[#0a3d1f] border-emerald-500/20 text-[#34d980] hover:bg-emerald-900/15"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200"
                        }`}
                      >
                        {s.status === "finalizado" ? "✓ Feito" : "Finalizar"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-neutral-600 text-xs">
            Nenhum serviço encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
