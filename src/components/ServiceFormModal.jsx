import { useState } from 'react';
import ModalOverlay from './ModalOverlay';
import FormField from './FormField';
import Input from './Input';

const SERVICE_TYPES = ["Instalação de Som", "Troca de Alto Falantes", "Instalação Multimídia", "Insulfilm", "Elétrica Automotiva", "LED Automotivo", "Outro"];

export default function ServiceFormModal({ onClose, onSave, collaborators = [] }) {
  const [form, setForm] = useState({ name: "", description: "", value: "", responsible: "", status: "aguardando" });
  const ok = form.name && form.value;

  const handleSubmit = () => {
    if (!ok) return;
    onSave({
      ...form,
      value: parseFloat(form.value)
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-5 sm:p-7 w-full max-w-[480px] max-h-[calc(100vh-3rem)] overflow-y-auto animate-scale-up">
        <div className="flex justify-between items-center mb-5.5">
          <h2 className="text-white text-lg font-semibold">Novo Serviço</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white cursor-pointer text-2xl font-light">×</button>
        </div>

        <FormField label="Tipo de Serviço" required>
          <select
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-300 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all"
          >
            <option value="">Selecione...</option>
            {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        <FormField label="Descrição">
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes do serviço..." />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Valor (R$)" required>
            <Input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0.00" type="number" />
          </FormField>
          <FormField label="Responsável">
            <select
              value={form.responsible}
              onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-350 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all"
            >
              <option value="">Selecione...</option>
              {collaborators.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} {c.role ? `(${c.role})` : ""}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-neutral-800 text-neutral-450 hover:bg-neutral-900/50 hover:text-white rounded-lg py-2.5 cursor-pointer text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!ok}
            className={`flex-[2] rounded-lg py-2.5 text-xs font-semibold transition-all ${
              ok
                ? "bg-white text-black hover:bg-neutral-200 cursor-pointer"
                : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
            }`}
          >
            Adicionar Serviço
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
