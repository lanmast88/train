import { useState, useEffect } from 'react'
import { db } from '../db'
import { format } from 'date-fns'
import { Plus, Trash2, ChevronLeft, Check, Search } from 'lucide-react'

export default function WorkoutNew({ onNavigate, editId }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [exercises, setExercises] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    db.exercises.orderBy('name').toArray().then(setAllExercises)
    if (editId) {
      db.workouts.get(editId).then(w => {
        if (w) {
          setName(w.name || '')
          setDate(w.date)
          setExercises(w.exercises || [])
        }
      })
    }
  }, [editId])

  function addExercise(ex) {
    setExercises(prev => [...prev, { exerciseId: ex.id, name: ex.name, category: ex.category, sets: [{ reps: '', weight: '' }] }])
    setShowPicker(false)
    setSearch('')
  }

  function addSet(exIdx) {
    setExercises(prev => prev.map((e, i) => i === exIdx ? { ...e, sets: [...e.sets, { reps: '', weight: '' }] } : e))
  }

  function removeSet(exIdx, setIdx) {
    setExercises(prev => prev.map((e, i) => i === exIdx ? { ...e, sets: e.sets.filter((_, si) => si !== setIdx) } : e))
  }

  function updateSet(exIdx, setIdx, field, val) {
    setExercises(prev => prev.map((e, i) => i === exIdx
      ? { ...e, sets: e.sets.map((s, si) => si === setIdx ? { ...s, [field]: val } : s) }
      : e
    ))
  }

  function removeExercise(exIdx) {
    setExercises(prev => prev.filter((_, i) => i !== exIdx))
  }

  async function save() {
    const workout = {
      name: name || 'Тренировка',
      date,
      exercises: exercises.map(e => ({
        ...e,
        sets: e.sets.map(s => ({
          reps: s.reps ? parseInt(s.reps) : null,
          weight: s.weight ? parseFloat(s.weight) : null,
        }))
      }))
    }
    if (editId) {
      await db.workouts.update(editId, workout)
    } else {
      await db.workouts.add(workout)
    }
    onNavigate('workouts')
  }

  const filtered = allExercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  return (
    <div className="flex flex-col min-h-[calc(100svh-64px)]">
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <button onClick={() => onNavigate('workouts')} className="text-slate-400 active:text-white">
          <ChevronLeft size={24} />
        </button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Название тренировки"
          className="flex-1 bg-transparent text-white text-lg font-semibold outline-none placeholder-slate-600"
        />
        <button onClick={save} className="bg-violet-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-1 active:opacity-80">
          <Check size={16} /> Готово
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Дата</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
          />
        </div>

        {exercises.map((ex, exIdx) => (
          <div key={exIdx} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div>
                <p className="text-white font-semibold">{ex.name}</p>
                <p className="text-slate-400 text-xs">{ex.category}</p>
              </div>
              <button onClick={() => removeExercise(exIdx)} className="text-slate-500 active:text-red-400">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2">
              <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 text-xs text-slate-400 px-1">
                <span>#</span><span>Повт.</span><span>Вес (кг)</span><span></span>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 items-center">
                  <span className="text-slate-500 text-sm text-center">{setIdx + 1}</span>
                  <input
                    type="number"
                    placeholder="12"
                    value={set.reps}
                    onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    className="bg-slate-700 border border-slate-600/50 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-violet-500 text-center"
                  />
                  <input
                    type="number"
                    placeholder="60"
                    value={set.weight}
                    onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                    className="bg-slate-700 border border-slate-600/50 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-violet-500 text-center"
                  />
                  <button onClick={() => removeSet(exIdx, setIdx)} className="text-slate-600 active:text-red-400 flex justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSet(exIdx)}
                className="text-violet-400 text-sm py-1.5 active:opacity-70 flex items-center gap-1"
              >
                <Plus size={14} /> Добавить подход
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-700 rounded-2xl py-4 text-slate-400 active:border-violet-500 active:text-violet-400 transition-colors"
        >
          <Plus size={20} /> Добавить упражнение
        </button>
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col" onClick={() => setShowPicker(false)}>
          <div className="mt-auto bg-slate-900 rounded-t-3xl max-h-[80svh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5">
                <Search size={16} className="text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Поиск упражнения..."
                  className="flex-1 bg-transparent text-white outline-none text-sm placeholder-slate-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {Object.entries(grouped).map(([cat, exs]) => (
                <div key={cat}>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-2 py-2">{cat}</p>
                  {exs.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="w-full text-left px-3 py-3 rounded-xl text-white active:bg-slate-800"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
