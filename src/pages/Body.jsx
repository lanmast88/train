import { useState, useEffect } from 'react'
import { db } from '../db'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'

const MEASUREMENTS = [
  { key: 'chest', label: 'Грудь' },
  { key: 'waist', label: 'Талия' },
  { key: 'hips', label: 'Бёдра' },
  { key: 'leftArm', label: 'Рука (лев.)' },
  { key: 'rightArm', label: 'Рука (пр.)' },
  { key: 'leftLeg', label: 'Нога (лев.)' },
  { key: 'rightLeg', label: 'Нога (пр.)' },
]

export default function Body() {
  const [logs, setLogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), weight: '', chest: '', waist: '', hips: '', leftArm: '', rightArm: '', leftLeg: '', rightLeg: '' })
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    const data = await db.bodyLogs.orderBy('date').reverse().toArray()
    setLogs(data)
  }

  async function save() {
    if (!form.weight && !form.chest && !form.waist) return
    const entry = { date: form.date }
    if (form.weight) entry.weight = parseFloat(form.weight)
    MEASUREMENTS.forEach(({ key }) => {
      if (form[key]) entry[key] = parseFloat(form[key])
    })
    await db.bodyLogs.add(entry)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), weight: '', chest: '', waist: '', hips: '', leftArm: '', rightArm: '', leftLeg: '', rightLeg: '' })
    setShowForm(false)
    loadLogs()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Замеры тела</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-medium active:opacity-80"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3">
          <FormField label="Дата" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
          <FormField label="Вес (кг)" type="number" placeholder="70.5" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Обхваты (см)</p>
          <div className="grid grid-cols-2 gap-2">
            {MEASUREMENTS.map(({ key, label }) => (
              <FormField key={key} label={label} type="number" placeholder="0" value={form[key]} onChange={v => setForm(f => ({ ...f, [key]: v }))} />
            ))}
          </div>
          <button onClick={save} className="bg-blue-600 text-white rounded-xl py-3 font-semibold active:opacity-80">Сохранить</button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {logs.length === 0 && (
          <p className="text-slate-400 text-center py-8">Нет записей. Добавьте первый замер!</p>
        )}
        {logs.map(log => (
          <div key={log.id} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="text-left">
                <p className="text-white font-semibold">{format(new Date(log.date), 'd MMMM yyyy', { locale: ru })}</p>
                <p className="text-slate-400 text-sm">{log.weight ? `${log.weight} кг` : ''}</p>
              </div>
              {expandedId === log.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {expandedId === log.id && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {log.weight && <MeasRow label="Вес" value={`${log.weight} кг`} />}
                {MEASUREMENTS.map(({ key, label }) =>
                  log[key] ? <MeasRow key={key} label={label} value={`${log[key]} см`} /> : null
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FormField({ label, type, placeholder, value, onChange }) {
  return (
    <div>
      <label className="text-slate-400 text-xs mb-1 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
      />
    </div>
  )
}

function MeasRow({ label, value }) {
  return (
    <div className="bg-slate-700/40 rounded-xl px-3 py-2">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  )
}
