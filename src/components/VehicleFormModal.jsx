import { useState } from "react"
import ModalOverlay from "./ModalOverlay"
import FormField from "./FormField"
import Input from "./Input"

export default function VehicleFormModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    plate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    owner_name: "",
    owner_phone: "",
  })

  const formatPlate = (val) => {
    const clean = val
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 7)
    if (clean.length > 3) return clean.slice(0, 3) + "-" + clean.slice(3)
    return clean
  }

  const handlePlate = (raw) => {
    const plate = formatPlate(raw)
    setForm((f) => ({ ...f, plate }))
  }

  const ok =
    form.plate &&
    form.brand &&
    form.model &&
    form.year &&
    form.color &&
    form.owner_name

  const handleSubmit = () => {
    if (!ok) return
    onSave(form)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-[#0d0d0d] border border-neutral-900 rounded-2xl p-5 sm:p-7 w-full max-w-[520px] max-h-[calc(100vh-3rem)] overflow-y-auto animate-scale-up">
        <div className="flex justify-between items-center mb-5.5">
          <h2 className="text-white text-lg font-semibold">
            Cadastrar Veículo
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white cursor-pointer text-2xl font-light"
          >
            ×
          </button>
        </div>

        <FormField label="Placa do Veículo" required>
          <div>
            <Input
              value={form.plate}
              onChange={(e) => handlePlate(e.target.value)}
              placeholder="ABC-1234"
              className="tracking-[0.2em] uppercase text-sm"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Marca" required>
            <Input
              value={form.brand}
              onChange={(e) =>
                setForm((f) => ({ ...f, brand: e.target.value }))
              }
              placeholder="Toyota"
            />
          </FormField>
          <FormField label="Modelo" required>
            <Input
              value={form.model}
              onChange={(e) =>
                setForm((f) => ({ ...f, model: e.target.value }))
              }
              placeholder="Corolla"
            />
          </FormField>
          <FormField label="Ano" required>
            <Input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              placeholder="2021"
              type="number"
            />
          </FormField>
          <FormField label="Cor" required>
            <Input
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
              placeholder="Prata"
            />
          </FormField>
        </div>

        <div className="border-t border-neutral-900 pt-4 mt-2">
          <p className="text-[11px] text-neutral-500 font-semibold tracking-wider uppercase mb-3">
            DADOS DO PROPRIETÁRIO
          </p>
          <FormField label="Nome do Proprietário" required>
            <Input
              value={form.owner_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, owner_name: e.target.value }))
              }
              placeholder="João da Silva"
            />
          </FormField>
          <FormField label="Telefone">
            <Input
              value={form.owner_phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, owner_phone: e.target.value }))
              }
              type="phone"
              placeholder="(63) 99999-0000"
            />
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
            Salvar Veículo
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}
