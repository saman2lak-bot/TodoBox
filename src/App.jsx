import { useEffect, useRef, useState } from 'react'
import { sounds, soundSettings } from './sounds.js'

const STORAGE_KEY = 'todo-app.tasks'

const uid = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const PlusIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const PencilIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14" />
  </svg>
)

const CheckIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 13 4 4L19 7" />
  </svg>
)

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [muted, setMuted] = useState(false)
  const editInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    soundSettings.muted = muted
  }, [muted])

  useEffect(() => {
    if (editingId !== null) editInputRef.current?.focus()
  }, [editingId])

  function addTask(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    setTasks([...tasks, { id: uid(), text: value, done: false }])
    setText('')
    sounds.add()
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    sounds.toggle(!tasks.find((t) => t.id === id)?.done)
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id))
    if (editingId === id) setEditingId(null)
    sounds.delete()
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditText(task.text)
  }

  function saveEdit() {
    if (editingId === null) return
    const value = editText.trim()
    if (value) {
      setTasks(tasks.map((t) => (t.id === editingId ? { ...t, text: value } : t)))
      sounds.edit()
    }
    setEditingId(null)
    setEditText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText('')
  }

  const remaining = tasks.filter((t) => !t.done).length
  const done = tasks.length - remaining
  const faNum = (n) => n.toLocaleString('fa-IR')

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-200 via-sky-100 to-indigo-200 px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">📝 لیست کارها</h1>
            <p className="mt-1 text-sm text-slate-500">
              افزودن، ویرایش و حذف — هر کدام با صدای خودش!
            </p>
          </div>
          <button
            onClick={() => setMuted((m) => !m)}
            title={muted ? 'روشن کردن صدا' : 'بی‌صدا کردن'}
            aria-label={muted ? 'روشن کردن صدا' : 'بی‌صدا کردن'}
            className="rounded-full bg-white/70 p-2.5 text-lg shadow-sm transition hover:scale-105 hover:bg-white"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </header>

        <div className="rounded-3xl bg-white p-5 shadow-xl shadow-indigo-200/60">
          <form onSubmit={addTask} className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="چه کاری باید انجام بشه؟"
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon />
              افزودن
            </button>
          </form>

          {tasks.length === 0 ? (
            <p className="py-10 text-center text-slate-400">
              هنوز کاری اضافه نشده — اولین کارت را بنویس! ✨
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="animate-pop-in flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 transition hover:bg-slate-100"
                >
                  {editingId === task.id ? (
                    <>
                      <input
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        onBlur={saveEdit}
                        className="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={saveEdit}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                      >
                        ذخیره
                      </button>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancelEdit}
                        className="shrink-0 rounded-lg bg-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-300"
                      >
                        لغو
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleTask(task.id)}
                        aria-label={task.done ? 'برداشتن تیک' : 'علامت‌گذاری به‌عنوان انجام‌شده'}
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          task.done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <CheckIcon />
                      </button>
                      <span
                        onDoubleClick={() => startEdit(task)}
                        title="برای ویرایش دوبار کلیک کن"
                        className={`min-w-0 flex-1 truncate ${
                          task.done ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => startEdit(task)}
                        aria-label="ویرایش"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        aria-label="حذف"
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {tasks.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
              <span>{faNum(remaining)} کار باقی مانده</span>
              <span>{faNum(done)} کار انجام شده</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
