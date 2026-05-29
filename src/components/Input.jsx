export default function Input({
  className = "",
  type = "text",
  onChange,
  value,
  phone,
  ...props
}) {
  const isPhone = phone || type === "phone"

  const formatPhone = (digits) => {
    if (!digits) return ""
    const d = digits
    if (d.length <= 2) return `(${d}`
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
  }

  const handleChange = (e) => {
    if (!isPhone) {
      return onChange && onChange(e)
    }

    const raw = e.target.value || ""
    const digits = raw.replace(/\D/g, "").slice(0, 11)
    const formatted = formatPhone(digits)
    // emulate event shape
    onChange && onChange({ target: { value: formatted } })
  }

  const inputProps = {
    ...props,
    onChange: handleChange,
    value,
    className: `w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg text-neutral-300 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all ${className}`,
  }

  if (isPhone) {
    inputProps.inputMode = "numeric"
    inputProps.pattern = "[0-9]*"
    inputProps.type = "text"
  } else {
    inputProps.type = type
  }

  return <input {...inputProps} />
}
