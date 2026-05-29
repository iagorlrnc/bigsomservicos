import { useNavigate } from "react-router-dom"

const SERVICE_TYPES = [
  "Instalação de Som",
  "Troca de Alto Falantes",
  "Instalação Multimídia",
  "Insulfilm",
  "Elétrica Automotiva",
  "LED Automotivo",
  "Outro",
]

export default function DashboardPage({
  vehicles,
  services,
  dashboardServices,
}) {
  const navigate = useNavigate()
  const statsServices = dashboardServices || services
  const finalized = statsServices.filter(
    (s) => s.status === "finalizado",
  ).length
  const inProgress = statsServices.filter(
    (s) => s.status === "em_andamento",
  ).length
  const totalRevenue = statsServices
    .filter((s) => s.status === "finalizado")
    .reduce((acc, s) => acc + s.value, 0)

  const recentVehicles = [...vehicles]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const fmtCurrency = (v) =>
    `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`

  const stats = [
    {
      label: "Veículos Cadastrados",
      value: vehicles.length,
      icon: "◈",
      colorClass: "text-white",
    },
    {
      label: "Serviços Finalizados",
      value: finalized,
      icon: "✓",
      colorClass: "text-[#34d980]",
    },
    {
      label: "Em Andamento",
      value: inProgress,
      icon: "↻",
      colorClass: "text-lime-400",
    },
    {
      label: "Faturamento Total",
      value: fmtCurrency(totalRevenue),
      icon: "R$",
      colorClass: "text-amber-500",
    },
  ]

  const statusConfig = {
    finalizado: {
      label: "Finalizado",
      colorClass: "text-[#34d980]",
      barBg: "bg-[#34d980]",
    },
    em_andamento: {
      label: "Em Andamento",
      colorClass: "text-lime-400",
      barBg: "bg-lime-400",
    },
    aguardando: {
      label: "Aguardando",
      colorClass: "text-amber-500",
      barBg: "bg-amber-500",
    },
  }

  const topServices = SERVICE_TYPES.map((name) => ({
    name,
    count: statsServices.filter((service) => service.name === name).length,
  }))
    .filter((service) => service.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))

  return (
    <div>
      <h1 className="text-white text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-neutral-500 text-xs mb-7">Visão geral</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 hover:border-neutral-850 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase">
                {s.label}
              </span>
              <span className={`text-base font-bold ${s.colorClass}`}>
                {s.icon}
              </span>
            </div>
            <div className={`text-2xl font-bold ${s.colorClass}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Vehicles */}
        <div className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-sm font-semibold">
              Últimos Veículos
            </h3>
            <button
              onClick={() => navigate("/veiculos")}
              className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs cursor-pointer"
            >
              Ver todos →
            </button>
          </div>
          <div className="divide-y divide-neutral-950">
            {recentVehicles.map((v) => {
              const vServices = statsServices.filter(
                (s) => s.vehicle_id === v.id,
              )
              const done = vServices.filter(
                (s) => s.status === "finalizado",
              ).length
              return (
                <div
                  key={v.id}
                  onClick={() =>
                    navigate(
                      `/veiculos/${v.plate.replace("-", "").toUpperCase()}`,
                    )
                  }
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-neutral-900/10 transition-colors rounded-lg px-1.5 -mx-1.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#141414] border border-neutral-800 flex items-center justify-center text-[10px] font-semibold text-neutral-450 tracking-wider">
                    {v.plate.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-200 text-xs font-semibold truncate">
                      {v.brand} {v.model}
                    </div>
                    <div className="text-neutral-500 text-[10px] truncate">
                      {v.plate} · {v.owner_name}
                    </div>
                  </div>
                  <div
                    className={`text-[11px] font-semibold ${
                      done === vServices.length && vServices.length > 0
                        ? "text-[#34d980]"
                        : "text-neutral-500"
                    }`}
                  >
                    {done}/{vServices.length}
                  </div>
                </div>
              )
            })}
            {recentVehicles.length === 0 && (
              <div className="text-center py-10 text-neutral-600 text-xs">
                Nenhum veículo cadastrado.
              </div>
            )}
          </div>
        </div>

        {/* Service Status Chart */}
        <div className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">
              Status dos Serviços
            </h3>
            <div className="space-y-3.5">
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = statsServices.filter(
                  (s) => s.status === key,
                ).length
                const pct = statsServices.length
                  ? Math.round((count / statsServices.length) * 100)
                  : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-neutral-400 font-medium">
                        {cfg.label}
                      </span>
                      <span className={`font-semibold ${cfg.colorClass}`}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cfg.barBg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-950">
            <h3 className="text-white text-sm font-semibold mb-3">
              Top Serviços
            </h3>
            <div className="divide-y divide-neutral-950/40">
              {topServices.length > 0 ? (
                topServices.slice(0, 4).map((service, i) => (
                  <div
                    key={service.name}
                    className="flex justify-between items-center py-2 text-xs"
                  >
                    <span className="text-neutral-500 font-medium">
                      {i + 1}º {service.name}
                    </span>
                    <span className="text-neutral-300 font-bold bg-[#141414] border border-neutral-800 rounded px-1.5 py-0.5 text-[10px]">
                      {service.count}x
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-neutral-600 text-xs">
                  Nenhum serviço cadastrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
