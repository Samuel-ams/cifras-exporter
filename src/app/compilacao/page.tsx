'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cifra } from '@/types/cifra'
import { getAllCifras, getCifra } from '@/lib/storage'
import { PdfOrientation, PdfColumns } from '@/components/PdfDocument'
import { SongbookPdfConfig } from '@/components/SongbookPdfDocument'

const SongbookDownloader = dynamic(() => import('@/components/SongbookDownloader'), { ssr: false })

type Tab = 'musicas' | 'config'

export default function CompilaPage() {
  const router = useRouter()
  const [allCifras, setAllCifras] = useState<Cifra[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<Tab>('musicas')
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState<SongbookPdfConfig>({
    orientation: 'portrait',
    fontSize: 10,
    columns: 1,
  })

  useEffect(() => { setAllCifras(getAllCifras()) }, [])

  const selectedCifras = selected.map((id) => getCifra(id)).filter(Boolean) as Cifra[]

  const filteredCifras = allCifras.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.title.toLowerCase().includes(q) || c.artist.toLowerCase().includes(q)
  })

  function toggle(id: string) {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setSelected((s) => { const n = [...s]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n })
  }

  function moveDown(idx: number) {
    setSelected((s) => { if (idx >= s.length - 1) return s; const n = [...s]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n })
  }

  function patchConfig<K extends keyof SongbookPdfConfig>(key: K, val: SongbookPdfConfig[K]) {
    setConfig((c) => ({ ...c, [key]: val }))
  }

  const FONT_SIZES = [8, 9, 10, 11, 12, 14] as const
  const COLUMNS: PdfColumns[] = [1, 2, 3]

  return (
    <div className="fade-up">
      <button
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Minhas Cifras
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
            Compilação
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Junte 2 ou mais cifras e exporte um PDF único.
          </p>
        </div>
        {selectedCifras.length >= 2 && (
          <SongbookDownloader cifras={selectedCifras} config={config} />
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 10, width: 'fit-content' }}>
        {(['musicas', 'config'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '0.4rem 1.1rem', fontSize: '0.85rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s ease' }}
            className={tab === t ? 'tab-active' : 'tab-inactive'}
          >
            {t === 'musicas' ? `Músicas ${selected.length > 0 ? `(${selected.length})` : ''}` : 'PDF & Layout'}
          </button>
        ))}
      </div>

      {tab === 'musicas' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: all cifras */}
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Biblioteca ({allCifras.length})
            </p>
            <input
              type="search"
              placeholder="Buscar por título ou artista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field"
              style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
            />
            {allCifras.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Nenhuma cifra salva.{' '}
                <Link href="/nova" style={{ color: 'var(--accent)' }}>Adicionar</Link>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredCifras.length === 0 && search && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Nenhum resultado para &ldquo;{search}&rdquo;.</p>
              )}
              {filteredCifras.map((c) => {
                const isIn = selected.includes(c.id)
                return (
                  <div
                    key={c.id}
                    className="surface"
                    style={{
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      borderColor: isIn ? 'var(--accent)' : undefined,
                      background: isIn ? 'color-mix(in srgb, var(--accent) 6%, var(--surface))' : undefined,
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => toggle(c.id)}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 6, border: '1.5px solid', flexShrink: 0,
                      borderColor: isIn ? 'var(--accent)' : 'var(--border)',
                      background: isIn ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.75rem',
                    }}>
                      {isIn && '✓'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.artist || '—'}</p>
                    </div>
                    <Link
                      href={`/cifra/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginLeft: 'auto', color: 'var(--text-faint)', fontSize: '0.78rem', textDecoration: 'none', flexShrink: 0 }}
                      title="Editar cifra"
                    >
                      ✎
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: order */}
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Ordem na compilação
            </p>
            {selected.length === 0 ? (
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-faint)',
                  fontSize: '0.85rem',
                }}
              >
                Selecione músicas na biblioteca
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selected.map((id, idx) => {
                  const c = getCifra(id)
                  if (!c) return null
                  return (
                    <div
                      key={id}
                      className="surface"
                      style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                      <span style={{ fontWeight: 800, color: 'var(--text-faint)', fontSize: '0.85rem', width: 20, textAlign: 'center', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.artist || '—'}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? 'var(--text-faint)' : 'var(--text-muted)', fontSize: '0.7rem', padding: '1px 4px' }}
                        >▲</button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === selected.length - 1}
                          style={{ background: 'none', border: 'none', cursor: idx === selected.length - 1 ? 'default' : 'pointer', color: idx === selected.length - 1 ? 'var(--text-faint)' : 'var(--text-muted)', fontSize: '0.7rem', padding: '1px 4px' }}
                        >▼</button>
                      </div>
                      <button
                        onClick={() => toggle(id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '1rem', lineHeight: 1, flexShrink: 0, padding: '0 2px' }}
                        title="Remover"
                      >×</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'config' && (
        <div className="surface" style={{ padding: '1.5rem', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Configurações do PDF
          </p>

          {/* Orientation */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.625rem' }}>Orientação</label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {(['portrait', 'landscape'] as PdfOrientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => patchConfig('orientation', o)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 10, border: '1.5px solid',
                    borderColor: config.orientation === o ? 'var(--accent)' : 'var(--border)',
                    background: config.orientation === o ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.orientation === o ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ display: 'block', border: '1.5px solid currentColor', borderRadius: 2, width: o === 'portrait' ? 16 : 24, height: o === 'portrait' ? 24 : 16 }} />
                  {o === 'portrait' ? 'Retrato' : 'Paisagem'}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.625rem' }}>
              Tamanho da fonte — <span style={{ color: 'var(--accent)' }}>{config.fontSize}pt</span>
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => patchConfig('fontSize', s)}
                  style={{
                    padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid',
                    borderColor: config.fontSize === s ? 'var(--accent)' : 'var(--border)',
                    background: config.fontSize === s ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.fontSize === s ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: config.fontSize === s ? 700 : 500,
                    transition: 'all 0.15s ease', minWidth: 40, textAlign: 'center',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.625rem' }}>Colunas por página</label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {COLUMNS.map((c) => (
                <button
                  key={c}
                  onClick={() => patchConfig('columns', c)}
                  style={{
                    flex: 1, padding: '0.75rem 0.5rem', borderRadius: 10, border: '1.5px solid',
                    borderColor: config.columns === c ? 'var(--accent)' : 'var(--border)',
                    background: config.columns === c ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.columns === c ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ display: 'flex', gap: 3 }}>
                    {Array.from({ length: c }).map((_, i) => (
                      <span key={i} style={{ display: 'block', width: c === 1 ? 16 : c === 2 ? 9 : 6, height: 20, border: '1.5px solid currentColor', borderRadius: 1 }} />
                    ))}
                  </span>
                  {c === 1 ? '1 coluna' : `${c} colunas`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA when songs selected */}
      {selectedCifras.length >= 2 && (
        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {selectedCifras.length} músicas selecionadas
          </span>
          <SongbookDownloader cifras={selectedCifras} config={config} />
        </div>
      )}
    </div>
  )
}
