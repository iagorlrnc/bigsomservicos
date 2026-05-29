import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import bigsomLogo from "../public/assets/bigsomlogo.png"

export default function CollaboratorPage({
  vehicles,
  services,
  updateService,
  addToast,
  collaboratorName,
}) {
  const { logout } = useAuth()
  const { plate } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [serviceView, setServiceView] = useState("all")

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout()
      } else {
        sessionStorage.clear()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      sessionStorage.clear()
      window.location.reload()
    }
  }

  // Filtrar veículos que possuem pelo menos um serviço cadastrado
  const assignedServices = collaboratorName
    ? services.filter((s) => s.responsible === collaboratorName)
    : []

  const visibleServices =
    serviceView === "assigned" ? assignedServices : services

  const vehiclesWithServices = vehicles.filter((v) => {
    const vServices = visibleServices.filter((s) => s.vehicle_id === v.id)
    return vServices.length > 0
  })

  // Filtrar por busca (placa, modelo, marca)
  const filteredVehicles = vehiclesWithServices.filter(
    (v) =>
      v.plate.toUpperCase().includes(search.toUpperCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()),
  )

  const handleServiceToggle = async (svc) => {
    const isFinished = svc.status === "finalizado"
    try {
      await updateService(svc.id, {
        status: isFinished ? "em_andamento" : "finalizado",
        completed_at: isFinished ? null : new Date().toISOString(),
      })
      addToast(
        isFinished
          ? "Serviço retornado para execução"
          : "Serviço concluído com sucesso! ✓",
        isFinished ? "info" : "success",
      )
    } catch (err) {
      console.error(err)
      addToast("Erro ao atualizar o status do serviço.", "error")
    }
  }

  // Encontrar o veículo ativo com base na placa presente na URL
  const activeVehicle = plate
    ? vehicles.find(
        (v) =>
          v.plate.replace("-", "").toUpperCase() ===
          plate.replace("-", "").toUpperCase(),
      )
    : null
  const activeServices = activeVehicle
    ? visibleServices.filter((s) => s.vehicle_id === activeVehicle.id)
    : []

  const totalCount = services.length
  const assignedCount = assignedServices.length

  const handleSelectVehicle = (v) => {
    const cleanPlate = v.plate.replace("-", "").toUpperCase()
    navigate(`/colaborador/${cleanPlate}`)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ccc] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-[#080808] border-b border-neutral-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src={bigsomLogo}
            alt="BigSom"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">
              BIGSOM
            </h1>
            <p className="text-[#34d980] text-[10px] uppercase font-semibold tracking-wider">
              Colaborador
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-neutral-500 hover:text-red-400 border border-neutral-850 hover:border-red-900/30 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Sair ⎋
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-4 sm:p-5 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left column: Vehicles list */}
        <section
          className={`space-y-4 ${activeVehicle ? "hidden md:block" : "block"}`}
        >
          <div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setServiceView("all")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  serviceView === "all"
                    ? "bg-white border-white text-black"
                    : "bg-[#0d0d0d] border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800"
                }`}
              >
                Total ({totalCount})
              </button>
              <button
                onClick={() => setServiceView("assigned")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  serviceView === "assigned"
                    ? "bg-white border-white text-black"
                    : "bg-[#0d0d0d] border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800"
                }`}
              >
                Atribuídos ({assignedCount})
              </button>
            </div>
            <h2 className="text-white font-semibold text-sm mb-1">
              Veículos em Manutenção
            </h2>
            <p className="text-neutral-500 text-xs">
              {serviceView === "assigned"
                ? "Mostrando apenas os serviços atribuídos a você."
                : "Selecione um veículo para ver e marcar os serviços."}
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, marca ou modelo..."
            className="w-full bg-[#0d0d0d] border border-neutral-900 focus:border-neutral-750 focus:ring-1 focus:ring-neutral-750 rounded-xl text-neutral-350 px-4 py-3 text-xs outline-none transition-all placeholder:text-neutral-600"
          />

          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredVehicles.map((v) => {
              const vServices = visibleServices.filter(
                (s) => s.vehicle_id === v.id,
              )
              const doneCount = vServices.filter(
                (s) => s.status === "finalizado",
              ).length
              const totalCount = vServices.length

              const isSelected = activeVehicle && activeVehicle.id === v.id

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVehicle(v)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-neutral-900/40 border-neutral-700"
                      : "bg-[#0d0d0d] border-neutral-900 hover:border-neutral-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#141414] border border-neutral-800 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider text-neutral-300">
                          {v.plate}
                        </span>
                        <span className="text-neutral-200 font-semibold text-sm">
                          {v.brand} {v.model}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-[11px] mt-1.5">
                        Proprietário:{" "}
                        <span className="text-neutral-400 font-medium">
                          {v.owner_name}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-bold ${
                          doneCount === totalCount
                            ? "text-[#34d980]"
                            : "text-amber-500"
                        }`}
                      >
                        {doneCount}/{totalCount}
                      </div>
                      <span className="text-[9px] text-neutral-600 uppercase font-bold tracking-wider">
                        Serviços
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12 text-neutral-650 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl">
                Nenhum veículo encontrado ou com serviços visíveis.
              </div>
            )}
          </div>
        </section>

        {/* Right column: Checklist details */}
        <section
          className={`bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-5 sticky top-24 space-y-4 ${activeVehicle ? "block" : "hidden md:block"}`}
        >
          {activeVehicle ? (
            <>
              <div>
                <button
                  onClick={() => navigate("/colaborador")}
                  className="md:hidden bg-transparent border-none text-neutral-500 hover:text-white font-semibold text-xs py-1 px-0 mb-3 cursor-pointer flex items-center gap-1"
                >
                  ← Voltar para lista de veículos
                </button>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#141414] border border-neutral-800 px-2.5 py-0.5 rounded text-[11px] tracking-wider font-semibold text-neutral-300">
                    {activeVehicle.plate}
                  </span>
                  <h3 className="text-white font-bold text-base">
                    {activeVehicle.brand} {activeVehicle.model}
                  </h3>
                </div>
                <p className="text-neutral-500 text-xs">
                  Marque ou desmarque os serviços realizados abaixo:
                </p>
              </div>

              <div className="divide-y divide-neutral-950/40 space-y-2 pt-2">
                {activeServices.map((svc) => {
                  const done = svc.status === "finalizado"
                  return (
                    <div
                      key={svc.id}
                      onClick={() => handleServiceToggle(svc)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        done
                          ? "bg-emerald-950/10 border-emerald-900/30 opacity-75"
                          : "bg-neutral-950/40 border-neutral-900 hover:border-neutral-850"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        readOnly
                        className="w-4.5 h-4.5 accent-emerald-500 cursor-pointer rounded border-neutral-800 bg-neutral-900"
                      />
                      <div className="flex-1">
                        <div
                          className={`text-xs font-semibold ${
                            done
                              ? "text-neutral-600 line-through"
                              : "text-neutral-200"
                          }`}
                        >
                          {svc.name}
                        </div>
                        {svc.description && (
                          <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                            {svc.description}
                          </div>
                        )}
                        {svc.responsible && (
                          <div className="text-[9px] text-neutral-600 uppercase font-semibold mt-1">
                            Resp: {svc.responsible}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-neutral-600 text-xs">
              Selecione um veículo ao lado para visualizar a lista de serviços a
              serem executados.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
