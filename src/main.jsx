import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const DAY = 86400000
const QUICK_AMOUNTS = [200, 250, 350, 500]

const iconPaths = {
  droplet: <><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/><path d="M9.2 15.2a3.1 3.1 0 0 0 2.5 1.7"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  glass: <><path d="M7 3h10l-1.2 17H8.2L7 3Z"/><path d="M8 8h8"/></>,
  moon: <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.2 8.2 0 1 0 11.2 11.2Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  chevronLeft: <path d="m15 18-6-6 6-6"/>,
  chevronRight: <path d="m9 18 6-6-6-6"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></>,
  target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></>,
  sparkles: <><path d="m12 3 1.1 3.2L16 7.5l-2.9 1.3L12 12l-1.1-3.2L8 7.5l2.9-1.3L12 3Z"/><path d="m19 13 .7 2.2 2.3.8-2.3.8L19 19l-.7-2.2L16 16l2.3-.8L19 13ZM5 14l.8 2.3L8 17l-2.2.7L5 20l-.8-2.3L2 17l2.2-.7L5 14Z"/></>
}

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

const dateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const sameDate = (a, b) => dateKey(a) === dateKey(b)

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem('aqua-data'))
    if (stored?.logs) return stored
  } catch {}
  const now = new Date()
  const key = dateKey(now)
  return {
    goal: 2500,
    logs: {
      [key]: [
        { id: 1, amount: 350, time: '08:30' },
        { id: 2, amount: 250, time: '10:15' },
        { id: 3, amount: 400, time: '12:40' },
        { id: 4, amount: 250, time: '15:05' }
      ]
    }
  }
}

function App() {
  const [data, setData] = useState(loadData)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [amount, setAmount] = useState(250)
  const [page, setPage] = useState('today')
  const [dark, setDark] = useState(() => localStorage.getItem('aqua-theme') === 'dark')
  const [showGoal, setShowGoal] = useState(false)
  const [toast, setToast] = useState('')

  const key = dateKey(selectedDate)
  const logs = data.logs[key] || []
  const total = logs.reduce((sum, item) => sum + item.amount, 0)
  const percent = Math.min(100, Math.round((total / data.goal) * 100))
  const remaining = Math.max(0, data.goal - total)

  useEffect(() => {
    localStorage.setItem('aqua-data', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('aqua-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const week = useMemo(() => {
    const day = selectedDate.getDay() || 7
    const monday = new Date(selectedDate.getTime() - (day - 1) * DAY)
    return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY))
  }, [key])

  function addWater(value = amount) {
    const numeric = Math.max(50, Math.min(2000, Number(value) || 250))
    const now = new Date()
    const time = sameDate(selectedDate, now)
      ? now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : '12:00'
    const newLog = { id: Date.now(), amount: numeric, time }
    setData(prev => ({ ...prev, logs: { ...prev.logs, [key]: [...(prev.logs[key] || []), newLog] } }))
    setToast(`Добавлено ${numeric} мл`)
  }

  function removeLog(id) {
    setData(prev => ({ ...prev, logs: { ...prev.logs, [key]: (prev.logs[key] || []).filter(item => item.id !== id) } }))
  }

  function changeDay(delta) {
    setSelectedDate(new Date(selectedDate.getTime() + delta * DAY))
  }

  function setGoal(goal) {
    setData(prev => ({ ...prev, goal }))
    setShowGoal(false)
    setToast('Дневная цель обновлена')
  }

  const dayTitle = sameDate(selectedDate, new Date())
    ? 'Сегодня'
    : selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="droplet" size={23} strokeWidth={2.2}/></span><span>Aqua</span></div>
        <nav>
          <button className={page === 'today' ? 'active' : ''} onClick={() => setPage('today')}><Icon name="home"/><span>Сегодня</span></button>
          <button className={page === 'stats' ? 'active' : ''} onClick={() => setPage('stats')}><Icon name="chart"/><span>Статистика</span></button>
          <button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}><Icon name="history"/><span>История</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setShowGoal(true)}><Icon name="settings"/><span>Настройки</span></button>
          <div className="profile">
            <div className="avatar">Р</div>
            <div><strong>Роман</strong><small>Будьте здоровы!</small></div>
          </div>
        </div>
      </aside>

      <main>
        <header>
          <div><p className="eyebrow">Трекер воды</p><h1>{page === 'today' ? 'Добрый день, Роман!' : page === 'stats' ? 'Ваша статистика' : 'История воды'}</h1></div>
          <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Сменить тему"><Icon name={dark ? 'sun' : 'moon'} size={19}/></button>
        </header>

        {page !== 'today' && <DatePanel week={week} selectedDate={selectedDate} setSelectedDate={setSelectedDate} changeDay={changeDay} />}
        {page === 'today' && <TodayPage total={total} goal={data.goal} percent={percent} remaining={remaining} amount={amount} setAmount={setAmount} addWater={addWater} logs={logs} removeLog={removeLog} dayTitle={dayTitle} openGoal={() => setShowGoal(true)} calendar={<DatePanel week={week} selectedDate={selectedDate} setSelectedDate={setSelectedDate} changeDay={changeDay} />} />}
        {page === 'stats' && <StatsPage data={data} selectedDate={selectedDate} />}
        {page === 'history' && <HistoryPage data={data} goal={data.goal} />}
      </main>

      {showGoal && <GoalModal goal={data.goal} onSave={setGoal} onClose={() => setShowGoal(false)} />}
      {toast && <div className="toast"><Icon name="check" size={18}/>{toast}</div>}
    </div>
  )
}

function DatePanel({ week, selectedDate, setSelectedDate, changeDay }) {
  return <section className="date-panel">
    <button className="arrow" onClick={() => changeDay(-1)}><Icon name="chevronLeft"/></button>
    <div className="week-strip">
      {week.map((date, index) => {
        const selected = sameDate(date, selectedDate)
        return <button key={dateKey(date)} className={selected ? 'selected' : ''} onClick={() => setSelectedDate(date)}>
          <span>{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][index]}</span>
          <strong>{date.getDate()}</strong>
          {sameDate(date, new Date()) && <i />}
        </button>
      })}
    </div>
    <button className="arrow" onClick={() => changeDay(1)}><Icon name="chevronRight"/></button>
  </section>
}

function TodayPage({ total, goal, percent, remaining, amount, setAmount, addWater, logs, removeLog, dayTitle, openGoal, calendar }) {
  return <div className="dashboard-grid">
    <section className="card progress-card">
      <div className="card-head"><div><p className="eyebrow">Ваш прогресс</p><h2>{dayTitle}</h2></div><button className="goal-button" onClick={openGoal}><Icon name="target" size={17}/>{(goal / 1000).toFixed(1)} л</button></div>
      <div className="progress-content">
        <div className="water-ring" style={{ '--progress': `${percent * 3.6}deg` }}>
          <div className="ring-inner">
            <Icon name="droplet" size={29} strokeWidth={1.6}/>
            <strong>{percent}%</strong><span>выполнено</span>
          </div>
        </div>
        <div className="progress-info">
          <p>Выпито сегодня</p>
          <div className="big-number">{(total / 1000).toFixed(total % 1000 ? 2 : 1).replace('.', ',')} <span>л</span></div>
          <div className="goal-line"><span>Цель</span><strong>{(goal / 1000).toFixed(1).replace('.', ',')} л</strong></div>
          <div className="remaining"><span className="tiny-drop"><Icon name="droplet" size={15}/></span><span>{remaining ? `Осталось ${remaining} мл` : 'Цель достигнута!'}</span></div>
        </div>
      </div>
    </section>

    {calendar}

    <section className="card add-card">
      <div className="card-head"><div><p className="eyebrow">Новая запись</p><h2>Добавить воду</h2></div><span className="glass-icon"><Icon name="glass" size={22}/></span></div>
      <div className="amount-input"><button onClick={() => setAmount(Math.max(50, amount - 50))}>−</button><label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} /><span>мл</span></label><button onClick={() => setAmount(Math.min(2000, Number(amount) + 50))}>+</button></div>
      <div className="quick-row">{QUICK_AMOUNTS.map(value => <button key={value} className={Number(amount) === value ? 'active' : ''} onClick={() => setAmount(value)}>{value} мл</button>)}</div>
      <button className="primary-button" onClick={() => addWater()}><Icon name="plus" size={19}/>Добавить воду</button>
      <p className="tip"><Icon name="sparkles" size={15}/> Регулярные небольшие порции усваиваются лучше</p>
    </section>

    <section className="card log-card">
      <div className="card-head"><div><p className="eyebrow">Сегодня</p><h2>Последние записи</h2></div><span className="record-count">{logs.length} {plural(logs.length, ['запись','записи','записей'])}</span></div>
      <div className="log-list">
        {logs.length ? [...logs].reverse().slice(0, 5).map((log, index) => <div className="log-item" key={log.id}>
          <span className="log-drop"><Icon name="droplet" size={18}/></span>
          <div><strong>{log.amount} мл</strong><small>{log.time}</small></div>
          {index === 0 && <span className="latest">Последняя</span>}
          <button className="delete" onClick={() => removeLog(log.id)} aria-label="Удалить"><Icon name="trash" size={17}/></button>
        </div>) : <div className="empty-state"><Icon name="droplet" size={30}/><p>Пока нет записей</p><span>Добавьте первый стакан воды</span></div>}
      </div>
    </section>
  </div>
}

function StatsPage({ data, selectedDate }) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(selectedDate.getTime() - (6 - i) * DAY))
  const totals = days.map(day => (data.logs[dateKey(day)] || []).reduce((s, x) => s + x.amount, 0))
  const average = Math.round(totals.reduce((a, b) => a + b, 0) / 7)
  const completed = totals.filter(v => v >= data.goal).length
  return <div className="stats-page">
    <div className="stat-cards">
      <div className="card mini-stat"><span className="stat-icon"><Icon name="droplet"/></span><div><small>В среднем</small><strong>{average} мл</strong><p>за последние 7 дней</p></div></div>
      <div className="card mini-stat"><span className="stat-icon warm"><Icon name="target"/></span><div><small>Цель выполнена</small><strong>{completed} из 7</strong><p>дней на этой неделе</p></div></div>
    </div>
    <section className="card chart-card"><div className="card-head"><div><p className="eyebrow">Динамика</p><h2>Последние 7 дней</h2></div><span className="goal-caption">Цель: {data.goal} мл</span></div>
      <div className="chart"><div className="goal-rule" style={{ bottom: `${Math.min(88, data.goal / 32)}%` }}><span>Цель</span></div>{days.map((day, i) => <div className="bar-column" key={dateKey(day)}><div className="bar-wrap"><div className="bar" style={{ height: `${Math.max(3, Math.min(100, totals[i] / 32))}%` }}><span>{totals[i] || ''}</span></div></div><small>{day.toLocaleDateString('ru-RU', { weekday: 'short' })}</small></div>)}</div>
    </section>
  </div>
}

function HistoryPage({ data, goal }) {
  const entries = Object.entries(data.logs).sort(([a], [b]) => b.localeCompare(a))
  return <section className="card history-card"><div className="card-head"><div><p className="eyebrow">Все данные</p><h2>История потребления</h2></div></div>
    <div className="history-list">{entries.map(([date, logs]) => { const total = logs.reduce((s, x) => s + x.amount, 0); return <div className="history-row" key={date}><div className="history-date"><strong>{new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</strong><small>{logs.length} {plural(logs.length, ['приём','приёма','приёмов'])}</small></div><div className="history-bar"><i style={{ width: `${Math.min(100, total / goal * 100)}%` }}/></div><strong>{total} мл</strong><span className={total >= goal ? 'status done' : 'status'}>{total >= goal ? 'Цель выполнена' : `${Math.round(total / goal * 100)}%`}</span></div>})}</div>
  </section>
}

function GoalModal({ goal, onSave, onClose }) {
  const [value, setValue] = useState(goal)
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}><span className="modal-icon"><Icon name="target" size={27}/></span><h2>Дневная цель</h2><p>Выберите комфортное количество воды на день</p><div className="goal-options">{[1500, 2000, 2500, 3000].map(v => <button key={v} className={Number(value) === v ? 'active' : ''} onClick={() => setValue(v)}>{v / 1000} л</button>)}</div><label className="custom-goal">Своя цель<input type="number" value={value} onChange={e => setValue(e.target.value)} /><span>мл</span></label><button className="primary-button" onClick={() => onSave(Math.max(500, Number(value) || 2500))}>Сохранить</button><button className="text-button" onClick={onClose}>Отмена</button></div></div>
}

function plural(number, words) {
  const n = Math.abs(number) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return words[2]
  if (n1 > 1 && n1 < 5) return words[1]
  if (n1 === 1) return words[0]
  return words[2]
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
