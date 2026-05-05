'use client'

import { useEffect } from 'react'
import { usePDF } from '@react-pdf/renderer'
import SongbookPdfDocument, { SongbookPdfConfig } from './SongbookPdfDocument'
import { Cifra } from '@/types/cifra'

interface Props {
  cifras: Cifra[]
  config: SongbookPdfConfig
}

export default function SongbookDownloader({ cifras, config }: Props) {
  const doc = <SongbookPdfDocument cifras={cifras} config={config} />
  const [instance, update] = usePDF({ document: doc })

  const ids = cifras.map((c) => c.id + c.transpose + c.capo + JSON.stringify(c.lineColors ?? {}) + JSON.stringify(c.lineStyles ?? {})).join(',')

  useEffect(() => {
    update(<SongbookPdfDocument cifras={cifras} config={config} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, config.orientation, config.fontSize, config.columns])

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
