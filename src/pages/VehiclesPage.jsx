import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';

export default function VehiclesPage({ vehicles, services, addToast, addVehicle, archiveVehicle }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "finalizado" | "em_andamento"
  const [showForm, setShowForm] = useState(false);

  const filtered = vehicles.filter(v => {
    const matchesSearch = 
      v.plate.toUpperCase().includes(search.toUpperCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const vSvcs = services.filter(s => s.vehicle_id === v.id);
    const doneCount = vSvcs.filter(s => s.status === "finalizado").length;
    const isFinished = vSvcs.length > 0 && doneCount === vSvcs.length;

    if (filter === "finalizado") return isFinished;
    if (filter === "em_andamento") return !isFinished;
    return true; // "all"
  });

  const totalVehiclesCount = vehicles.length;
  const finishedCount = vehicles.filter(v => {
    const vSvcs = services.filter(s => s.vehicle_id === v.id);
    return vSvcs.length > 0 && vSvcs.every(s => s.status === "finalizado");
  }).length;
  const inProgressCount = totalVehiclesCount - finishedCount;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Veículos</h1>
          <p className="text-neutral-500 text-xs mt-1">{vehicles.length} veículos cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black hover:bg-neutral-250 font-semibold text-xs px-4.5 py-2.5 rounded-lg transition-all cursor-pointer self-start sm:self-auto"
        >
          + Novo Veículo
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por placa, marca, modelo ou proprietário..."
        className="w-full bg-[#0d0d0d] border border-neutral-900 focus:border-neutral-750 focus:ring-1 focus:ring-neutral-750 rounded-xl text-neutral-350 px-4 py-3.5 text-xs outline-none transition-all mb-4 placeholder:text-neutral-600"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: "Todos", count: totalVehiclesCount },
          { key: "finalizado", label: "Finalizado", count: finishedCount },
          { key: "em_andamento", label: "Em andamento", count: inProgressCount }
        ].map(t => {
          const isActive = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "bg-white border-white text-black font-semibold shadow-md"
                  : "bg-[#0d0d0d] border-neutral-900 text-neutral-500 hover:text-neutral-350 hover:border-neutral-850"
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center justify-center ${
                isActive ? "bg-neutral-200 text-black" : "bg-neutral-950 text-neutral-600"
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => {
          const vSvcs = services.filter(s => s.vehicle_id === v.id);
          const done = vSvcs.filter(s => s.status === "finalizado").length;
          return (
            <VehicleCard
              key={v.id}
              vehicle={v}
              services={vSvcs}
              done={done}
              onArchive={archiveVehicle}
              onClick={() => navigate(`/veiculos/${v.plate.replace("-", "").toUpperCase()}`)}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-neutral-600 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl">
            Nenhum veículo encontrado para a busca.
          </div>
        )}
      </div>

      {showForm && (
        <VehicleFormModal
          onClose={() => setShowForm(false)}
          onSave={async (v) => {
            try {
              await addVehicle(v);
              setShowForm(false);
              addToast("Veículo cadastrado!", "success");
            } catch (err) {
              console.error(err);
              addToast("Erro ao cadastrar veículo.", "error");
            }
          }}
        />
      )}
    </div>
  );
}
