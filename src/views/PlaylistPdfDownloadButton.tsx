'use client'

import PdfDownloadButton, { PdfConfig } from './PdfDownloadButton'
import SongbookPdfDocument from './SongbookPdfDocument'
import { Cifra } from '@/models/cifra'

interface Props {
  cifras: Cifra[]
  playlistName: string
}

export default function PlaylistPdfDownloadButton({ cifras, playlistName }: Props) {
  const filename = playlistName.replace(/[/\\:*?"<>|]/g, '_').concat('.pdf')

  const docKey = cifras
    .map((c) => c.id + c.transpose + c.capo + JSON.stringify(c.lineColors ?? {}) + JSON.stringify(c.lineStyles ?? {}))
    .join(',')

  const renderDocument = (config: PdfConfig) => (
    <SongbookPdfDocument cifras={cifras} config={config} />
  )

  return <PdfDownloadButton filename={filename} docKey={docKey} renderDocument={renderDocument} />
}
