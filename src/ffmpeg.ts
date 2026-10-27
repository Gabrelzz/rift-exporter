import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { QualityProfile } from './types'

const CORE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
export type ConversionResult = { blob: Blob; outputName: string }

export class VideoConverter {
  private ffmpeg: FFmpeg | null = null
  private loaded = false

  async convert(file: File, profile: QualityProfile, onProgress: (value: number) => void): Promise<ConversionResult> {
    const ffmpeg = await this.getFFmpeg(onProgress)
    const safeBaseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '_') || 'replay'
    const inputName = `input-${Date.now()}.webm`
    const outputName = `${safeBaseName}.mp4`
    await ffmpeg.writeFile(inputName, await fetchFile(file))
    try {
      await ffmpeg.exec(['-fflags', '+genpts', '-i', inputName, '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264', '-preset', profile.preset, '-crf', String(profile.crf), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', profile.audioBitrate, '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero', outputName])
      const data = await ffmpeg.readFile(outputName)
      const bytes = data instanceof Uint8Array ? new Uint8Array(data) : new TextEncoder().encode(data)
      return { blob: new Blob([bytes], { type: 'video/mp4' }), outputName }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha inesperada durante a conversão.'
      if (/Unknown encoder|libx264|aac/i.test(message)) throw new Error('Este build do FFmpeg.wasm não oferece H.264/AAC. Tente recarregar a página; se persistir, use um navegador atualizado.')
      throw error
    } finally { await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]) }
  }

  cancel() { this.ffmpeg?.terminate(); this.ffmpeg = null; this.loaded = false }

  private async getFFmpeg(onProgress: (value: number) => void) {
    if (!this.ffmpeg) { this.ffmpeg = new FFmpeg(); this.ffmpeg.on('progress', ({ progress }) => onProgress(Math.max(0, Math.min(1, progress)))) }
    if (!this.loaded) {
      await this.ffmpeg.load({ coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'), wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm') })
      this.loaded = true
    }
    return this.ffmpeg
  }
}

