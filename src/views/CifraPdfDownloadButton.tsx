'use client'

import PdfDownloadButton, { PdfConfig } from './PdfDownloadButton'
import PdfDocument from './PdfDocument'
import { Cifra } from '@/models/cifra'

interface Props {
  cifra: Cifra
}

export default function CifraPdfDownloadButton({ cifra }: Props) {
  const filename = [cifra.title, cifra.artist]
    .filter(Boolean)
    .join(' - ')
    .replace(/[/\\:*?"<>|]/g, '_')
    .concat('.pdf')

  const docKey = [
    cifra.id, cifra.title, cifra.artist, cifra.tone,
    cifra.capo, cifra.transpose, cifra.rawText,
    JSON.stringify(cifra.lineColors ?? {}),
    JSON.stringify(cifra.lineStyles ?? {}),
  ].join(':')

  const renderDocument = (config: PdfConfig) => (
    <PdfDocument cifra={cifra} {...config} />
  )

  return <PdfDownloadButton filename={filename} docKey={docKey} renderDocument={renderDocument} />
}
