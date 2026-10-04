export default function ProfileFormField({ label, name, type = 'text', value, onChange, options, min, max, step, hint }) {
  return <div className="field">
    <label htmlFor={name}>{label}</label>
    {type === 'select' ? <select id={name} name={name} value={value} onChange={onChange} required>
      <option value="" disabled>Select {label.toLowerCase()}</option>
      {options.map((option) => <option value={option.value ?? option} key={option.value ?? option}>{option.label ?? option}</option>)}
    </select> : type === 'boolean' ? <select id={name} name={name} value={value} onChange={onChange} required>
      <option value="" disabled>Select yes or no</option><option value="true">Yes</option><option value="false">No</option>
    </select> : <input id={name} name={name} type={type} value={value} onChange={onChange} min={min} max={max} step={step} required />}
    {hint && <span className="field-hint">{hint}</span>}
  </div>
}
