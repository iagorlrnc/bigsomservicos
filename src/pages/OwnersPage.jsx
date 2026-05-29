import { useNavigate } from 'react-router-dom';

export default function OwnersPage({ vehicles, services }) {
  const navigate = useNavigate();
  const owners = [
    ...new Map(
      vehicles.map(v => [
        v.owner_name,
        {
          name: v.owner_name,
          phone: v.owner_phone,
          vehicles: vehicles.filter(vv => vv.owner_name === v.owner_name)
        }
      ])
    ).values()
  ];

  const fmtCurrency = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="text-white text-2xl font-semibold mb-1">Proprietários</h1>
      <p className="text-neutral-500 text-xs mb-6">{owners.length} proprietários cadastrados</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners.map((o, i) => {
          const allServices = o.vehicles.flatMap(v => services.filter(s => s.vehicle_id === v.id));
          const totalValue = allServices.reduce((a, s) => a + s.value, 0);
          return (
            <div key={i} className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 hover:border-neutral-850 transition-colors">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#141414] border border-neutral-850 flex items-center justify-center text-neutral-300 font-bold text-sm">
                  {o.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-neutral-200 font-semibold text-sm leading-snug">{o.name}</div>
                  <div className="text-neutral-600 text-xs mt-0.5">{o.phone || "Sem telefone"}</div>
                </div>
              </div>

              <div className="border-t border-neutral-950 pt-3">
                <div className="space-y-1">
                  {o.vehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/veiculos/${v.plate.replace("-", "").toUpperCase()}`)}
                      className="flex justify-between items-center w-full bg-transparent border-none py-1.5 px-0.5 cursor-pointer text-xs text-neutral-450 hover:text-white transition-colors text-left"
                    >
                      <span className="font-medium">{v.brand} {v.model}</span>
                      <span className="text-neutral-600 tracking-wider text-[10px] uppercase bg-neutral-950/65 border border-neutral-900 px-1.5 py-0.5 rounded">{v.plate}</span>
                    </button>
                  ))}
                </div>

                {totalValue > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-950 flex justify-between items-center text-xs">
                    <span className="text-neutral-600 font-semibold tracking-wider uppercase text-[10px]">TOTAL GASTO</span>
                    <span className="text-amber-550 font-bold text-sm">{fmtCurrency(totalValue)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {owners.length === 0 && (
          <div className="col-span-full text-center py-20 text-neutral-600 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl">
            Nenhum proprietário encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
