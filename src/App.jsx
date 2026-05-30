import { useState, useEffect } from 'react'
import { seedExercises } from './db'
import Dashboard from './pages/Dashboard'
import Body from './pages/Body'
import Workouts from './pages/Workouts'
import WorkoutNew from './pages/WorkoutNew'
import WorkoutDetail from './pages/WorkoutDetail'
import Progress from './pages/Progress'
import { Home, Scale, Dumbbell, TrendingUp } from 'lucide-react'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [pageParam, setPageParam] = useState(null)

  useEffect(() => { seedExercises() }, [])

  function navigate(target, param) {
    setPage(target)
    setPageParam(param ?? null)
  }

  return (
    <div className="flex flex-col min-h-[100svh] bg-slate-950 max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'body' && <Body />}
        {page === 'workouts' && <Workouts onNavigate={navigate} />}
        {page === 'workout-new' && <WorkoutNew onNavigate={navigate} />}
        {page === 'workout-edit' && <WorkoutNew onNavigate={navigate} editId={pageParam} />}
        {page === 'workout-detail' && <WorkoutDetail id={pageParam} onNavigate={navigate} />}
        {page === 'progress' && <Progress />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 flex pb-safe">
        <NavItem icon={<Home size={22} />} label="Главная" active={page === 'dashboard'} onClick={() => navigate('dashboard')} />
        <NavItem icon={<Scale size={22} />} label="Тело" active={page === 'body'} onClick={() => navigate('body')} />
        <NavItem icon={<Dumbbell size={22} />} label="Тренировки" active={['workouts', 'workout-new', 'workout-edit', 'workout-detail'].includes(page)} onClick={() => navigate('workouts')} />
        <NavItem icon={<TrendingUp size={22} />} label="Прогресс" active={page === 'progress'} onClick={() => navigate('progress')} />
      </nav>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${active ? 'text-violet-400' : 'text-slate-500'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
