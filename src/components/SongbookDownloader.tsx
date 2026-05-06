'use client'

import { useMemo } from 'react'
import { usePDF } from '@react-pdf/renderer'
import SongbookPdfDocument, { SongbookPdfConfig } from './SongbookPdfDocument'
import { Cifra } from '@/types/cifra'

interface Props {
  cifras: Cifra[]
  config: SongbookPdfConfig
}

export default function SongbookDownloader({ cifras, config }: Props) {
  const ids = cifras.map((c) => c.id + c.transpose + c.capo + JSON.stringify(c.lineColors ?? {}) + JSON.stringify(c.lineStyles ?? {})).join(',')

  // Memoize so usePDF only regenerates when content actually changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doc = useMemo(() => <SongbookPdfDocument cifras={cifras} config={config} />, [ids, config.orientation, config.fontSize, config.columns])

  const [instance] = usePDF({ document: doc })

  const filename = `compilacao-${cifras.length}-musicas.pdf`

  if (instance.loading) {
    return (
      <button disabled className="btn-accent" style={{ opacity: 0.6, cursor: 'wait' }}>
        Gerando PDF...
      </button>
    )
  }

  if (!instance.url) return null

  return (
    <a href={instance.url} download={filename} className="btn-accent" style={{ textDecoration: 'none' }}>
      ↓ Baixar Compilação PDF
    </a>
  )
}
