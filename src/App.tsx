import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Film, LoaderCircle, RotateCcw, ShieldCheck, Upload, X } from 'lucide-react'
import { VideoConverter } from './ffmpeg'
import { qualityProfiles, type QualityProfile } from './types'

type Status = 'idle' | 'ready' | 'converting' | 'done' | 'error'
const formatBytes = (bytes: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, style: 'unit', unit: bytes < 1_000_000 ? 'kilobyte' : 'megabyte', unitDisplay: 'short' }).format(bytes < 1_000_000 ? bytes / 1_000 : bytes / 1_000_000)

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<QualityProfile>(qualityProfiles[1])
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const converterRef = useRef(new VideoConverter())
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url) }, [result])

  const selectFile = (candidate: File | undefined) => {
    if (!candidate) return
    if (!candidate.name.toLowerCase().endsWith('.webm') && candidate.type !== 'video/webm') { setError('Escolha um arquivo WEBM para continuar.'); setStatus('error'); return }
    if (result) URL.revokeObjectURL(result.url)
    setResult(null); setError(''); setFile(candidate); setProgress(0); setStatus('ready')
  }
  const convert = async () => {
    if (!file) return
    setStatus('converting'); setError(''); setProgress(0)
    try {
      const converted = await converterRef.current.convert(file, profile, setProgress)
      const url = URL.createObjectURL(converted.blob)
      setResult({ url, name: converted.outputName, size: converted.blob.size }); setProgress(1); setStatus('done')
    } catch (caught) {
      setStatus('error'); const message = caught instanceof Error ? caught.message : 'Não foi possível converter este arquivo.'
      setError(message.includes('abort') ? 'Conversão cancelada.' : message)
    }
  }
  const cancel = () => { converterRef.current.cancel(); setStatus('ready'); setProgress(0) }
  const reset = () => { converterRef.current.cancel(); if (result) URL.revokeObjectURL(result.url); setFile(null); setResult(null); setError(''); setProgress(0); setStatus('idle') }

  return <main>
    <header className="topbar"><div className="brand"><span className="brand-mark"><Film size={19} /></span>Rift <strong>Exporter</strong></div><span className="privacy"><ShieldCheck size={16} /> Seus vídeos não saem do dispositivo</span></header>
    <section className="hero"><p className="eyebrow">CONVERSOR LOCAL PARA LEAGUE OF LEGENDS</p><h1>Seu replay em MP4.<br /><i>Pronto para compartilhar.</i></h1><p>Converta arquivos WEBM com áudio sincronizado, sem enviar seu vídeo para nenhum servidor.</p></section>
    <section className="workspace" aria-label="Conversor de vídeo">
      <div className="panel"><div className="section-heading"><span>01</span><div><h2>Selecione o replay</h2><p>Arquivos WEBM processados diretamente no navegador.</p></div></div>
        {!file ? <label className="dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); selectFile(event.dataTransfer.files[0]) }}><input ref={inputRef} type="file" accept="video/webm,.webm" onChange={event => selectFile(event.target.files?.[0])} /><Upload size={28} /><strong>Arraste seu arquivo WEBM aqui</strong><span>ou clique para procurar no computador</span></label> : <div className="selected-file"><div className="file-icon"><Film size={23} /></div><div><strong>{file.name}</strong><span>{formatBytes(file.size)} · WEBM</span></div>{status !== 'converting' && <button className="icon-button" onClick={reset} aria-label="Remover arquivo"><X size={19} /></button>}</div>}
      </div>
      <div className="panel"><div className="section-heading"><span>02</span><div><h2>Defina a qualidade</h2><p>O perfil é aplicado durante a conversão.</p></div></div><div className="profiles">{qualityProfiles.map(option => <button key={option.id} className={`profile ${profile.id === option.id ? 'active' : ''}`} disabled={status === 'converting'} onClick={() => setProfile(option)}><strong>{option.name}</strong><span>{option.description}</span><small>CRF {option.crf} · {option.preset} · AAC {option.audioBitrate.replace('k', ' kb/s')}</small></button>)}</div></div>
      <div className="action-area">
        {(status === 'ready' || status === 'error') && <button className="primary-button" disabled={!file} onClick={convert}><Film size={19} /> Converter para MP4</button>}
        {status === 'converting' && <><div className="progress-label"><LoaderCircle className="spin" size={18} /> Convertendo localmente <strong>{Math.round(progress * 100)}%</strong></div><div className="progress"><span style={{ width: `${progress * 100}%` }} /></div><button className="text-button" onClick={cancel}>Cancelar conversão</button></>}
        {status === 'done' && result && <div className="success"><CheckCircle2 size={22} /><div><strong>MP4 pronto para baixar</strong><span>Tamanho final: {formatBytes(result.size)} · H.264/AAC*</span></div><a className="download-button" href={result.url} download={result.name}><Download size={18} /> Baixar MP4</a><button className="icon-button" onClick={reset} aria-label="Converter outro vídeo"><RotateCcw size={18} /></button></div>}
        {status === 'error' && <p className="error"><AlertCircle size={18} /> {error}</p>}
      </div>
      {result && <div className="preview"><div className="section-heading"><span>03</span><div><h2>Prévia do resultado</h2><p>Confira o arquivo antes de compartilhar.</p></div></div><video controls src={result.url} /></div>}
    </section>
    <section className="notes"><div><h3>Privacidade por padrão</h3><p>O processamento usa FFmpeg.wasm no seu navegador. Não há upload, conta ou armazenamento de replays.</p></div><div><h3>Sobre arquivos grandes</h3><p>A conversão usa memória do navegador e pode exigir bastante do computador. Para replays longos ou grandes, feche outras abas e use um navegador atualizado. O tamanho real é exibido somente após a conversão.</p></div><div><h3>Compatibilidade</h3><p>O resultado usa H.264 e AAC quando esses codecs estão disponíveis no build carregado. O áudio e vídeo mantêm sua relação temporal durante a conversão.</p></div></section>
    <footer>* A disponibilidade de H.264/AAC depende do build do FFmpeg.wasm carregado no navegador.</footer>
  </main>
}
