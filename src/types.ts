export type QualityProfile = { id: 'light' | 'standard' | 'high'; name: string; description: string; crf: number; preset: string; audioBitrate: string }
export const qualityProfiles: QualityProfile[] = [
  { id: 'light', name: 'Leve', description: 'Arquivo menor para compartilhar', crf: 26, preset: 'veryfast', audioBitrate: '128k' },
  { id: 'standard', name: 'Médio padrão', description: 'Equilíbrio entre imagem e tamanho', crf: 22, preset: 'medium', audioBitrate: '160k' },
  { id: 'high', name: 'Alto', description: 'Mais detalhes, conversão mais demorada', crf: 18, preset: 'slow', audioBitrate: '192k' },
]
