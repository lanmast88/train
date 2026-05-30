import { useState, useEffect } from 'react'
import { db } from '../db'
import { format, subDays, subMonths } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'

const PERIODS = [
  { label: '1 мес', months: 1 },
  { label: '3 мес', months: 3 },
  { label: '6 мес', months: 6 },
  { label: 'Всё', months: 0 },
]

const MEASUREMENTS = [
  { key: 'weight', label: 'Вес', unit: 'кг', color: '#3b82f6' },
  { key: 'chest', label: 'Грудь', unit: 'см', color: '#8b5cf6' },
  { key: 'waist', label: 'Талия', unit: 'см', color: '#06b6d4' },
  { key: 'hips', label: 'Бёдра', unit: 'см', color: '#ec4899' },
  { key: 'leftArm', label: 'Рука (лев.)', unit: 'см', color: '#f59e0b' },
  { key: 'rightArm', label: 'Рука (пр.)', unit: 'см', color: '#f59e0b' },
  { key: 'leftLeg', label: 'Нога (лев.)', unit: 'см', color: '#10b981' },
  { key: 'rightLeg', label: 'Нога (пр.)', unit: 'см', color: '#10b981' },
]

export default function Progress() {
  const [tab, setTab] = useState('body')
  const [period, setPeriod] = useState(1)
  const [bodyLogs, setBodyLogs] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('weight')
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [exerciseData, setExerciseData] = useState([])

  useEffect(() => {
    loadBodyLogs()
  }, [period])

  useEffect(() => {
    db.exercises.orderBy('name').toArray().then(exs => {
      setExercises(exs)
      if (exs.length > 0) setSelectedExercise(exs[0].id)
    })
  }, [])

  useEffect(() => {
    if (selectedExercise) loadExerciseProgress()
  }, [selectedExercise, period])

  async function loadBodyLogs() {
    let data
    if (period > 0) {
      const from = format(subMonths(new Date(), period), 'yyyy-MM-dd')
      data = await db.bodyLogs.where('date').aboveOrEqual(from).sortBy('date')
    } else {
      data = await db.bodyLogs.orderBy('date').toArray()
    }
    setBodyLogs(data)
  }

  async function loadExerciseProgress() {
    let workouts
    if (period > 0) {
      const from = format(subMonths(new Date(), period), 'yyyy-MM-dd')
      workouts = await db.workouts.where('date').aboveOrEqual(from).sortBy('date')
    } else {
      workouts = await db.workouts.orderBy('date').toArray()
    }
    const points = []
    workouts.forEach(w => {
      const ex = w.exercises?.find(e => e.exerciseId === selectedExercise)
      if (!ex) return
      const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0))
      const maxReps = Math.max(...ex.sets.map(s => s.reps || 0))
      const volume = ex.sets.reduce((s, set) => s + (set.reps || 0) * (set.weight || 0), 0)
      points.push({ date: w.date, maxWeight, maxReps, volume, label: format(new Date(w.date), 'd MMM', { locale: ru }) })
    })
    setExerciseData(points)
  }

  const metric = MEASUREMENTS.find(m => m.key === selectedMetric) || MEASUREMENTS[0]
  const bodyData = bodyLogs
    .filter(l => l[selectedMetric] != null)
    .map(l => ({ value: l[selectedMetric], label: format(new Date(l.date), 'd MMM', { locale: ru }), date: l.date }))

  const firstVal = bodyData[0]?.value
  const lastVal = bodyData[bodyData.length - 1]?.value
  const diff = firstVal != null && lastVal != null ? (lastVal - firstVal).toFixed(1) : null

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold text-white">Прогресс</h2>

      <div className="flex bg-slate-800 rounded-xl p-1">
        {[['body', 'Тело'], ['workout', 'Упражнения']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map(p => (
          <button
            key={p.months}
            onClick={() => setPeriod(p.months)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 ${period === p.months ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {tab === 'body' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MEASUREMENTS.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap shrink-0 ${selectedMetric === m.key ? 'text-white font-medium' : 'text-slate-500'}`}
                style={selectedMetric === m.key ? { backgroundColor: m.color + '33', color: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>

          {diff !== null && (
            <div className="flex gap-2">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <p className="text-slate-400 text-xs">Начало</p>
                <p className="text-white font-bold">{firstVal} {metric.unit}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <p className="text-slate-400 text-xs">Сейчас</p>
                <p className="text-white font-bold">{lastVal} {metric.unit}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                <p className="text-slate-400 text-xs">Изменение</p>
                <p className={`font-bold ${parseFloat(diff) < 0 ? 'text-emerald-400' : parseFloat(diff) > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                  {parseFloat(diff) > 0 ? '+' : ''}{diff} {metric.unit}
                </p>
              </div>
            </div>
          )}

          {bodyData.length > 1 ? (
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-slate-300 font-semibold mb-3">{metric.label}</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bodyData}>
                  <defs>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: metric.color }}
                    formatter={v => [`${v} ${metric.unit}`, metric.label]}
                  />
                  <Area type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} fill="url(#bodyGrad)" dot={{ fill: metric.color, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-6">Нужно минимум 2 записи для графика</p>
          )}
        </>
      )}

      {tab === 'workout' && (
        <>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Упражнение</label>
            <select
              value={selectedExercise || ''}
              onChange={e => setSelectedExercise(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
            >
              {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {exerciseData.length > 1 ? (
            <div className="flex flex-col gap-3">
              <ChartBlock title="Максимальный вес (кг)" data={exerciseData} dataKey="maxWeight" color="#8b5cf6" unit="кг" />
              <ChartBlock title="Макс. повторения" data={exerciseData} dataKey="maxReps" color="#3b82f6" unit="повт." />
              <ChartBlock title="Объём (кг)" data={exerciseData} dataKey="volume" color="#10b981" unit="кг" />
            </div>
          ) : (
            <p className="text-slate-400 text-center py-6">Нужно минимум 2 тренировки с этим упражнением</p>
          )}
        </>
      )}
    </div>
  )
}

function ChartBlock({ title, data, dataKey, color, unit }) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
      <p className="text-slate-300 font-semibold mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color }}
            formatter={v => [`${v} ${unit}`]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
