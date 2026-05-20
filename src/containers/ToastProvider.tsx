import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'

type ToastType = 'success' | 'error'

type Toast = {
  id: number
  message: string
  type: ToastType
  exiting?: boolean
}

type ToastContextType = {
  createToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation on mount
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    if (toast.exiting) {
      setVisible(false)
      const timer = setTimeout(() => onRemove(toast.id), 300)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [toast.exiting, toast.id, onRemove])

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 min-h-12 rounded-md shadow-lg text-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      } ${
        toast.type === 'success' ? 'bg-green-600 text-white dark:bg-green-500' : 'bg-red-600 text-white dark:bg-red-500'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="[&::first-letter]:uppercase">{toast.message}</span>
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const createToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
    }, 5000)
  }, [])

  const handleRemove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={useMemo(() => ({ createToast }), [createToast])}>
      {children}
      <div className="fixed top-24 right-4 sm:right-8 space-y-2 z-[200]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={handleRemove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
