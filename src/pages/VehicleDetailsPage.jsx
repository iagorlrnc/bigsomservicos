import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServiceCard, { statusConfig } from '../components/ServiceCard';
import ServiceFormModal from '../components/ServiceFormModal';

export default function VehicleDetailsPage({ vehicles, services, updateService, addService, addToast, collaborators }) {
  const { plate } = useParams();
  const navigate = useNavigate();
  const [showServiceForm, setShowServiceForm] = useState(false);

  const vehicle = vehicles.find(
    v => v.plate.replace("-", "").toUpperCase() === plate?.replace("-", "").toUpperCase()
  );

  if (!vehicle) {
    return (
      <div>
        <button
          onClick={() => navigate("/veiculos")}
          className="bg-transparent border border-transparent text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-semibold cursor-pointer mb-5 block"
        >
          ← Voltar
        </button>
        <div className="text-neutral-500 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 text-center">
          Veículo com a placa "{plate}" não encontrado.
        </div>
      </div>
    );
  }

  const vServices = services.filter(s => s.vehicle_id === vehicle.id);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";
  const fmtCurrency = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const handleToggle = async (svc) => {
    const isFinished = svc.status === "finalizado";
    try {
      await updateService(svc.id, {
        status: isFinished ? "em_andamento" : "finalizado",
        completed_at: isFinished ? null : new Date().toISOString()
      });
      addToast(isFinished ? "Serviço reaberto" : "Serviço finalizado! ✓", isFinished ? "info" : "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao atualizar serviço.", "error");
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/veiculos")}
        className="bg-transparent border border-transparent text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-semibold cursor-pointer mb-5 block"
      >
        ← Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-7">
        {/* Info Card */}
        <div className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="bg-[#141414] border border-neutral-850 rounded-lg px-3 py-1.5 text-neutral-350 text-sm tracking-widest font-semibold flex-shrink-0">
              {vehicle.plate}
            </div>
            <div>
              <h2 className="text-white text-base font-bold leading-tight">{vehicle.brand} {vehicle.model}</h2>
              <p className="text-neutral-500 text-xs mt-0.5">{vehicle.year} · {vehicle.color}</p>
            </div>
          </div>
          
          <div className="border-t border-neutral-950 pt-4 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mb-1">PROPRIETÁRIO</div>
                <div className="text-neutral-350 font-medium truncate">{vehicle.owner_name}</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mb-1">TELEFONE</div>
                <div className="text-neutral-350 font-medium truncate">{vehicle.owner_phone || "Sem telefone"}</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mb-1">ENTRADA</div>
                <div className="text-neutral-350 font-medium truncate">{fmtDate(vehicle.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Summary Card */}
        <div className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5">
          <div className="text-[10px] text-neutral-650 font-semibold uppercase tracking-wider mb-3">RESUMO DOS SERVIÇOS</div>
          
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = vServices.filter(s => s.status === key).length;
              return (
                <div key={key} className="bg-neutral-950/60 border border-neutral-900 rounded-lg p-2.5">
                  <div className={`text-xl font-bold ${cfg.colorClass}`}>{count}</div>
                  <div className="text-[10px] text-neutral-650 mt-1 font-semibold uppercase tracking-wide">{cfg.label}</div>
                </div>
              );
            })}
          </div>
          
          <div className="pt-4 border-t border-neutral-950 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-neutral-650 font-semibold uppercase tracking-wide">TOTAL ORÇADO</div>
              <div className="text-xl font-bold text-amber-500 mt-0.5">
                {fmtCurrency(vServices.reduce((a, s) => a + s.value, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-sm font-semibold">Serviços ({vServices.length})</h2>
        <button
          onClick={() => setShowServiceForm(true)}
          className="bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
        >
          + Adicionar Serviço
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {vServices.map(svc => (
          <ServiceCard key={svc.id} service={svc} onToggle={handleToggle} />
        ))}
        {vServices.length === 0 && (
          <div className="text-center py-16 text-neutral-600 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl">
            Nenhum serviço cadastrado para este veículo.
          </div>
        )}
      </div>

      {showServiceForm && (
        <ServiceFormModal
          vehicleId={vehicle.id}
          collaborators={collaborators}
          onClose={() => setShowServiceForm(false)}
          onSave={async (s) => {
            try {
              await addService({
                ...s,
                vehicle_id: vehicle.id,
              });
              setShowServiceForm(false);
              addToast("Serviço adicionado!", "success");
            } catch (err) {
              console.error(err);
              addToast("Erro ao adicionar serviço.", "error");
            }
          }}
        />
      )}
    </div>
  );
}
