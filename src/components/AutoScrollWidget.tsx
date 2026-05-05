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
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 1000,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-lg)',
                padding: '1rem 1.25rem',
                minWidth: 230,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
            }}
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
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '80%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Velocidade
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', minWidth: 16, textAlign: 'right' }}>
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
                        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                        <span>Devagar</span>
                        <span>Rápido</span>
                    </div>
                </div>

                {/* Play / Pause */}
                <button
                    onClick={() => setRunning((r) => !r)}
                    className={running ? 'btn-danger' : 'btn-accent'}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
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
