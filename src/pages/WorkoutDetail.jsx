import { useState, useEffect } from 'react'
import { db } from '../db'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft } from 'lucide-react'

export default function WorkoutDetail({ id, onNavigate }) {
  const [workout, setWorkout] = useState(null)

  useEffect(() => {
    if (id) db.workouts.get(id).then(setWorkout)
  }, [id])

  if (!workout) return <div className="p-4 text-slate-400">Загрузка...</div>

  const totalVolume = workout.exercises?.reduce((sum, ex) =>
    sum + ex.sets.reduce((s, set) => s + (set.reps || 0) * (set.weight || 0), 0), 0) || 0

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <button onClick={() => onNavigate('workouts')} className="text-slate-400 active:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold">{workout.name || 'Тренировка'}</p>
          <p className="text-slate-400 text-sm">{format(new Date(workout.date), 'd MMMM yyyy', { locale: ru })}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="Упражнений" value={workout.exercises?.length || 0} />
          <StatChip label="Подходов" value={workout.exercises?.reduce((s, e) => s + e.sets.length, 0) || 0} />
          <StatChip label="Объём (кг)" value={totalVolume.toLocaleString('ru')} />
        </div>

        {workout.exercises?.map((ex, i) => (
          <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50">
              <p className="text-white font-semibold">{ex.name}</p>
              <p className="text-slate-400 text-xs">{ex.category}</p>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              <div className="grid grid-cols-3 text-xs text-slate-500 px-1">
                <span>#</span><span>Повт.</span><span>Вес</span>
              </div>
              {ex.sets.map((set, si) => (
                <div key={si} className="grid grid-cols-3 text-sm">
                  <span className="text-slate-500">{si + 1}</span>
                  <span className="text-white">{set.reps ?? '—'}</span>
                  <span className="text-white">{set.weight != null ? `${set.weight} кг` : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatChip({ label, value }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-center">
      <p className="text-white font-bold">{value}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  )
}
