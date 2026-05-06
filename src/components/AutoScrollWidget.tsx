'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
    onClose: () => void
}

export default function AutoScrollWidget({ onClose }: Props) {
    const [running, setRunning] = useState(false)
    const [speed, setSpeed] = useState(3)
    const rafRef = useRef<number | null>(null)
    const speedRef = useRef(speed)
    const remainder = useRef(0)
    const [maxScrollY, setMaxScrollY] = useState(0)
    useEffect(() => { speedRef.current = speed }, [speed])

    const stop = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        remainder.current = 0
    }, [])

    useEffect(() => {
        function updateMaxScroll() {
            setMaxScrollY(document.documentElement.scrollHeight - document.documentElement.clientHeight)
        }
        updateMaxScroll()
        window.addEventListener('resize', updateMaxScroll)
        return () => window.removeEventListener('resize', updateMaxScroll)
    }, [])

    useEffect(() => {
        if (!running) { stop(); return }

        function tick() {
            remainder.current += speedRef.current * 0.15
            const px = Math.floor(remainder.current)
            if (px > 0) {
                window.scrollBy(0, px)
                remainder.current -= px
                // stop when the page can no longer scroll down
                if (window.scrollY === maxScrollY) {
                    setRunning(false)
                    return
                }
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)

        return stop
    }, [running, stop, maxScrollY])

    // stop on unmount
    useEffect(() => stop, [stop])

    return (
        <div
            className="fixed bottom-8 right-4 sm:right-8 z-[1000] bg-surface border border-border flex flex-col gap-3 p-4 min-w-[230px]"
            style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}
        >
            {/* Header */}
            {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Auto Scroll</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '1.2rem', lineHeight: 1, padding: '0 2px' }}
          title="Fechar"
        >
          ×
        </button>
      </div> */}

            {/* Speed */}
            <div className="flex gap-1.5 items-center">
                <div className="flex flex-col gap-1.5 w-4/5">
                    <div className="flex justify-between items-center">
                        <span className="text-[0.78rem] font-semibold text-muted uppercase tracking-[0.06em]">
                            Velocidade
                        </span>
                        <span className="text-[0.8rem] font-bold text-accent min-w-[16px] text-right">
                            {speed}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        step={1}
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full cursor-pointer"
                        style={{ accentColor: 'var(--accent)' }}
                    />
                    <div className="flex justify-between text-[0.7rem] text-faint">
                        <span>Devagar</span>
                        <span>Rápido</span>
                    </div>
                </div>

                {/* Play / Pause */}
                <button
                    onClick={() => setRunning((r) => !r)}
                    className={`${running ? 'btn-danger' : 'btn-accent'} flex items-center gap-1`}
                >
                    {running ? (
                        <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                            Pausar
                        </>
                    ) : (
                        <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Iniciar
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
