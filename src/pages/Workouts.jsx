import { useState, useEffect } from 'react'
import { db } from '../db'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Plus, ChevronRight, Trash2, Pencil } from 'lucide-react'

export default function Workouts({ onNavigate }) {
  const [workouts, setWorkouts] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const data = await db.workouts.orderBy('date').reverse().toArray()
    setWorkouts(data)
  }

  async function remove(id) {
    if (confirm('Удалить тренировку?')) {
      await db.workouts.delete(id)
      load()
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Тренировки</h2>
        <button
          onClick={() => onNavigate('workout-new')}
          className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-2 rounded-xl text-sm font-medium active:opacity-80"
        >
          <Plus size={16} /> Новая
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {workouts.length === 0 && (
          <p className="text-slate-400 text-center py-8">Нет тренировок. Добавьте первую!</p>
        )}
        {workouts.map(w => (
          <div key={w.id} className="bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <button
              onClick={() => onNavigate('workout-detail', w.id)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="text-left">
                <p className="text-white font-semibold">{w.name || 'Тренировка'}</p>
                <p className="text-slate-400 text-sm">
                  {format(new Date(w.date), 'd MMMM yyyy', { locale: ru })} · {w.exercises?.length || 0} упр.
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {w.exercises?.map(e => e.name).join(', ')}
                </p>
              </div>
              <ChevronRight size={18} className="text-slate-500 shrink-0" />
            </button>
            <div className="flex border-t border-slate-700/50">
              <button
                onClick={() => onNavigate('workout-edit', w.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-400 text-sm active:text-white"
              >
                <Pencil size={14} /> Изменить
              </button>
              <div className="w-px bg-slate-700/50" />
              <button
                onClick={() => remove(w.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-400 text-sm active:text-red-400"
              >
                <Trash2 size={14} /> Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
