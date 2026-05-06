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
        className="bg-transparent border-none cursor-pointer text-muted text-[0.82rem] p-0 mb-5 flex items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Minhas Cifras
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[1.6rem] font-extrabold tracking-[-0.03em] mb-0.5">
            Compilação
          </h1>
          <p className="text-muted text-[0.85rem]">
            Junte 2 ou mais cifras e exporte um PDF único.
          </p>
        </div>
        {selectedCifras.length >= 2 && (
          <SongbookDownloader cifras={selectedCifras} config={config} />
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-surface2 p-1 rounded-[10px] w-fit">
        {(['musicas', 'config'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-[1.1rem] py-1.5 text-sm border-none cursor-pointer transition-all duration-150 ${tab === t ? 'tab-active' : 'tab-inactive'}`}
          >
            {t === 'musicas' ? `Músicas ${selected.length > 0 ? `(${selected.length})` : ''}` : 'PDF & Layout'}
          </button>
        ))}
      </div>

      {tab === 'musicas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: all cifras */}
          <div>
            <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              Biblioteca ({allCifras.length})
            </p>
            <input
              type="search"
              placeholder="Buscar por título ou artista…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field mb-3 text-sm"
            />
            {allCifras.length === 0 && (
              <div className="text-muted text-sm">
                Nenhuma cifra salva.{' '}
                <Link href="/nova" className="text-accent">Adicionar</Link>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {filteredCifras.length === 0 && search && (
                <p className="text-sm text-faint">Nenhum resultado para &ldquo;{search}&rdquo;.</p>
              )}
              {filteredCifras.map((c) => {
                const isIn = selected.includes(c.id)
                return (
                  <div
                    key={c.id}
                    className="surface p-3 px-4 flex items-center gap-3 cursor-pointer transition-all duration-150"
                    style={{
                      borderColor: isIn ? 'var(--accent)' : undefined,
                      background: isIn ? 'color-mix(in srgb, var(--accent) 6%, var(--surface))' : undefined,
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
                    <div className="min-w-0">
                      <p className="font-semibold text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis">{c.title}</p>
                      <p className="text-[0.78rem] text-muted whitespace-nowrap overflow-hidden text-ellipsis">{c.artist || '—'}</p>
                    </div>
                    <Link
                      href={`/cifra/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-faint text-[0.78rem] no-underline shrink-0"
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
            <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] mb-3">
              Ordem na compilação
            </p>
            {selected.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-(--radius) py-10 px-4 text-center text-faint text-sm">
                Selecione músicas na biblioteca
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selected.map((id, idx) => {
                  const c = getCifra(id)
                  if (!c) return null
                  return (
                    <div
                      key={id}
                      className="surface p-3 px-4 flex items-center gap-3"
                    >
                      <span className="font-extrabold text-faint text-[0.85rem] w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis">{c.title}</p>
                        <p className="text-[0.78rem] text-muted">{c.artist || '—'}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          className="bg-transparent border-none text-[0.7rem] px-1 py-px cursor-pointer disabled:text-faint disabled:cursor-default text-muted"
                        >▲</button>
                        <button
                          onClick={() => moveDown(idx)}
                          disabled={idx === selected.length - 1}
                          className="bg-transparent border-none text-[0.7rem] px-1 py-px cursor-pointer disabled:text-faint disabled:cursor-default text-muted"
                        >▼</button>
                      </div>
                      <button
                        onClick={() => toggle(id)}
                        className="bg-transparent border-none cursor-pointer text-danger text-base leading-none shrink-0 px-0.5"
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
        <div className="surface p-6 max-w-120 flex flex-col gap-6">
          <p className="text-[0.78rem] font-bold text-muted uppercase tracking-[0.08em] m-0">
            Configurações do PDF
          </p>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2.5">Orientação</label>
            <div className="flex gap-2.5">
              {(['portrait', 'landscape'] as PdfOrientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => patchConfig('orientation', o)}
                  className="flex-1 p-3 rounded-[10px] flex flex-col items-center gap-2 cursor-pointer text-sm font-semibold transition-all duration-150"
                  style={{
                    border: '1.5px solid',
                    borderColor: config.orientation === o ? 'var(--accent)' : 'var(--border)',
                    background: config.orientation === o ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.orientation === o ? 'var(--accent)' : 'var(--text-muted)',
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
            <label className="block text-sm font-semibold text-text mb-2.5">
              Tamanho da fonte — <span className="text-accent">{config.fontSize}pt</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => patchConfig('fontSize', s)}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all duration-150 min-w-10 text-center"
                  style={{
                    border: '1.5px solid',
                    borderColor: config.fontSize === s ? 'var(--accent)' : 'var(--border)',
                    background: config.fontSize === s ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.fontSize === s ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: config.fontSize === s ? 700 : 500,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2.5">Colunas por página</label>
            <div className="flex gap-2.5">
              {COLUMNS.map((c) => (
                <button
                  key={c}
                  onClick={() => patchConfig('columns', c)}
                  className="flex-1 py-3 px-2 rounded-[10px] flex flex-col items-center gap-2 cursor-pointer text-sm font-semibold transition-all duration-150"
                  style={{
                    border: '1.5px solid',
                    borderColor: config.columns === c ? 'var(--accent)' : 'var(--border)',
                    background: config.columns === c ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-2)',
                    color: config.columns === c ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  <span className="flex gap-1">
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

      {selectedCifras.length >= 2 && (
        <div className="mt-8 flex items-center gap-4 justify-end">
          <span className="text-sm text-muted">
            {selectedCifras.length} músicas selecionadas
          </span>
          <SongbookDownloader cifras={selectedCifras} config={config} />
        </div>
      )}
    </div>
  )
}
