import { useState } from 'react';
import FormField from '../components/FormField';
import Input from '../components/Input';
import ModalOverlay from '../components/ModalOverlay';

export default function CollaboratorsPage({ 
  collaborators, 
  addCollaborator, 
  approveCollaborator, 
  rejectCollaborator, 
  addToast 
}) {
  const [showForm, setShowForm] = useState(false);
  const [showPendingList, setShowPendingList] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({});

  const approvedCollaborators = collaborators.filter(c => c.approved !== false);
  const pendingCollaborators = collaborators.filter(c => c.approved === false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      await addCollaborator({ name, role, phone });
      addToast("Colaborador cadastrado!", "success");
      setName("");
      setRole("");
      setPhone("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      addToast("Erro ao cadastrar colaborador.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id, r) => {
    setSelectedRoles(prev => ({ ...prev, [id]: r }));
  };

  const handleApprove = async (id) => {
    const userRole = selectedRoles[id] || "colaborador";
    try {
      await approveCollaborator(id, userRole);
      addToast(`Acesso liberado como ${userRole === "admin" ? "Administrador" : "Colaborador"}!`, "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao aprovar colaborador.", "error");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Deseja realmente rejeitar e excluir esta solicitação?")) {
      try {
        await rejectCollaborator(id);
        addToast("Solicitação excluída.", "info");
      } catch (err) {
        console.error(err);
        addToast("Erro ao rejeitar solicitação.", "error");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Funcionários</h1>
          <p className="text-neutral-500 text-xs mt-1">{approvedCollaborators.length} funcionários cadastrados</p>
        </div>
        
        <div className="flex gap-2.5">
          <button
            onClick={() => setShowPendingList(true)}
            className={`font-semibold text-xs px-4.5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2.5 border ${
              pendingCollaborators.length > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                : "bg-transparent border-neutral-900 hover:bg-neutral-900 text-neutral-500"
            }`}
          >
            <span>Pendentes</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center justify-center ${
              pendingCollaborators.length > 0 ? "bg-amber-500 text-black" : "bg-neutral-900 text-neutral-600"
            }`}>
              {pendingCollaborators.length}
            </span>
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-black hover:bg-neutral-250 font-semibold text-xs px-4.5 py-2.5 rounded-lg transition-all cursor-pointer"
          >
            + Novo Funcionário
          </button>
        </div>
      </div>

      {/* Grid de colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvedCollaborators.map((c) => (
          <div key={c.id} className="bg-[#0d0d0d] border border-neutral-900 rounded-xl p-5 hover:border-neutral-850 transition-colors flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#141414] border border-neutral-850 flex items-center justify-center text-neutral-300 font-bold text-sm">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-neutral-200 font-semibold text-sm leading-snug flex items-center gap-2">
                <span>{c.name}</span>
                {c.user_role === "admin" && (
                  <span className="bg-neutral-900 border border-neutral-800 text-neutral-500 text-[8px] font-bold uppercase px-1 rounded">Admin</span>
                )}
              </div>
              <div className="text-[#34d980] text-[10px] uppercase font-semibold tracking-wider mt-0.5">{c.role || "Membro da equipe"}</div>
              <div className="text-neutral-650 text-xs mt-1">{c.phone || "Sem telefone"}</div>
            </div>
          </div>
        ))}
        {approvedCollaborators.length === 0 && (
          <div className="col-span-full text-center py-20 text-neutral-650 text-xs bg-[#0d0d0d] border border-neutral-900 rounded-xl">
            Nenhum colaborador ativo cadastrado.
          </div>
        )}
      </div>

      {/* Modal de cadastro novo */}
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-5 sm:p-7 w-full max-w-[420px] max-h-[calc(100vh-3rem)] overflow-y-auto animate-scale-up space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-white text-lg font-semibold">Novo Funcionário</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white cursor-pointer text-2xl font-light">×</button>
            </div>

            <FormField label="Nome Completo" required>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Marcos Souza" required />
            </FormField>

            <FormField label="Cargo / Função">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-350 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all"
              >
                <option value="">Selecione...</option>
                <option value="Mecânico">Mecânico</option>
                <option value="Eletricista">Eletricista</option>
                <option value="Instalador">Instalador</option>
                <option value="Auxiliar">Auxiliar</option>
                <option value="Gerente">Gerente</option>
              </select>
            </FormField>

            <FormField label="Telefone">
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(63) 99999-0000" />
            </FormField>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-transparent border border-neutral-800 text-neutral-450 hover:bg-neutral-900/50 hover:text-white rounded-lg py-2.5 cursor-pointer text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name}
                className={`flex-[2] rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  name && !loading
                    ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                    : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
                }`}
              >
                {loading ? "Salvando..." : "Salvar Funcionário"}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Modal de solicitações pendentes */}
      {showPendingList && (
        <ModalOverlay onClose={() => setShowPendingList(false)}>
          <div className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-5 sm:p-7 w-full max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto animate-scale-up space-y-4">
            <div className="flex justify-between items-center mb-1">
              <div>
                <h2 className="text-white text-lg font-semibold">Solicitações Pendentes</h2>
                <p className="text-neutral-500 text-xs mt-0.5">Defina o papel do usuário e libere o acesso ao painel.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPendingList(false)} 
                className="text-neutral-550 hover:text-white cursor-pointer text-2xl font-light outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 pt-2 max-h-[50vh] overflow-y-auto pr-1">
              {pendingCollaborators.map((c) => {
                const selectedRole = selectedRoles[c.id] || "colaborador";
                return (
                  <div key={c.id} className="bg-[#070707] border border-neutral-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-amber-500 font-bold text-xs flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-neutral-250 font-semibold text-xs truncate">{c.name}</div>
                        <div className="text-neutral-600 text-[10px] mt-0.5 truncate">{c.email}</div>
                        {c.phone && <div className="text-neutral-650 text-[10px] mt-0.5">{c.phone}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <select
                        value={selectedRole}
                        onChange={(e) => handleRoleChange(c.id, e.target.value)}
                        className="bg-[#0d0d0d] border border-neutral-800 rounded-lg text-neutral-350 px-2.5 py-1.5 text-[11px] outline-none focus:border-neutral-700 transition-all"
                      >
                        <option value="colaborador">Colaborador</option>
                        <option value="admin">Administrador</option>
                      </select>
                      
                      <button
                        onClick={() => handleApprove(c.id)}
                        className="bg-white hover:bg-neutral-200 text-black text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Aprovar
                      </button>
                      
                      <button
                        onClick={() => handleReject(c.id)}
                        className="bg-transparent border border-neutral-850 text-neutral-500 hover:text-red-400 hover:border-red-900/30 text-[11px] px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                        title="Rejeitar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingCollaborators.length === 0 && (
                <div className="text-center py-12 text-neutral-650 text-xs">
                  Nenhuma solicitação pendente.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPendingList(false)}
                className="bg-transparent border border-neutral-850 hover:bg-neutral-900 text-neutral-450 px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
