import { useState, useEffect } from 'react'
import { db } from '../db'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Scale, Dumbbell, TrendingUp, Calendar } from 'lucide-react'

export default function Dashboard({ onNavigate }) {
  const [lastBody, setLastBody] = useState(null)
  const [lastWorkout, setLastWorkout] = useState(null)
  const [weekWorkouts, setWeekWorkouts] = useState(0)

  useEffect(() => {
    async function load() {
      const body = await db.bodyLogs.orderBy('date').last()
      setLastBody(body)
      const workout = await db.workouts.orderBy('date').last()
      setLastWorkout(workout)
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
      const count = await db.workouts.where('date').aboveOrEqual(weekAgo).count()
      setWeekWorkouts(count)
    }
    load()
  }, [])

  const today = format(new Date(), 'd MMMM', { locale: ru })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-slate-400 text-sm">{today}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Привет 👋</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Scale size={20} />}
          label="Вес"
          value={lastBody ? `${lastBody.weight} кг` : '—'}
          sub={lastBody ? format(new Date(lastBody.date), 'd MMM', { locale: ru }) : 'Нет данных'}
          color="blue"
        />
        <StatCard
          icon={<Calendar size={20} />}
          label="Тренировок"
          value={weekWorkouts}
          sub="за 7 дней"
          color="violet"
        />
      </div>

      <div className="flex flex-col gap-3">
        <ActionCard
          icon={<Dumbbell size={22} />}
          title="Записать тренировку"
          desc="Упражнения, подходы, веса"
          onClick={() => onNavigate('workout-new')}
          color="violet"
        />
        <ActionCard
          icon={<Scale size={22} />}
          title="Замеры тела"
          desc="Вес и обхваты"
          onClick={() => onNavigate('body')}
          color="blue"
        />
        <ActionCard
          icon={<TrendingUp size={22} />}
          title="Прогресс"
          desc="Графики и история"
          onClick={() => onNavigate('progress')}
          color="emerald"
        />
      </div>

      {lastWorkout && (
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Последняя тренировка</p>
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-white font-semibold">{lastWorkout.name || 'Тренировка'}</p>
            <p className="text-slate-400 text-sm mt-0.5">
              {format(new Date(lastWorkout.date), 'd MMMM yyyy', { locale: ru })} · {lastWorkout.exercises?.length || 0} упр.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return (
    <div className={`rounded-2xl p-4 border ${colors[color]}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label} · {sub}</p>
    </div>
  )
}

function ActionCard({ icon, title, desc, onClick, color }) {
  const colors = {
    blue: 'text-blue-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
  }
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 text-left active:scale-[0.98] transition-transform"
    >
      <span className={`${colors[color]}`}>{icon}</span>
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </button>
  )
}
