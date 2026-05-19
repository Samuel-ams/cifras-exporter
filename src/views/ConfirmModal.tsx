'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ConfirmState = {
  message: string
  resolve: (value: boolean) => void
} | null

const ConfirmContext = createContext<(message: string) => Promise<boolean>>(async () => false)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(null)

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ message, resolve })
    })
  }, [])

  function handleConfirm() {
    state?.resolve(true)
    setState(null)
  }

  function handleCancel() {
    state?.resolve(false)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCancel}
        >
          <div
            className="bg-surface border border-border rounded-(--radius) p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[0.95rem] font-medium mb-6 leading-relaxed">{state.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={handleCancel} className="btn-ghost">
                Cancelar
              </button>
              <button onClick={handleConfirm} className="btn-danger">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
