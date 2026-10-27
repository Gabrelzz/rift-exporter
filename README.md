# Rift Exporter

Site público para converter replays `.webm` em `.mp4` diretamente no navegador. O arquivo não é enviado a um servidor: a conversão ocorre localmente com FFmpeg.wasm.

## Requisitos

- Node.js 20 ou superior (instale a versão LTS em [nodejs.org](https://nodejs.org/)).
- Navegador moderno, preferencialmente Chrome, Edge ou Firefox atualizado.

## Rodar no Windows

Abra o PowerShell dentro da pasta do projeto e execute:

```powershell
npm install
npm run dev
```

Abra o endereço mostrado no terminal, normalmente `http://localhost:5173`.

Para verificar a versão de produção:

```powershell
npm run build
npm run preview
```

## Publicar

O projeto é estático. Após `npm run build`, publique o conteúdo da pasta `dist` em Cloudflare Pages, Netlify, Vercel ou GitHub Pages.

- **Cloudflare Pages / Netlify / Vercel:** conecte o repositório, use `npm run build` como comando de build e `dist` como diretório de publicação.
- **GitHub Pages:** configure o Vite com o `base` do seu repositório antes do build, publique `dist` por uma action ou pela interface do GitHub.

O FFmpeg.wasm é carregado inicialmente pela CDN jsDelivr. Para uma instalação totalmente independente de CDN, hospede os arquivos de `@ffmpeg/core` e altere `CORE_BASE_URL` em `src/ffmpeg.ts`.

## Perfis e compatibilidade

| Perfil | Vídeo | Áudio |
| --- | --- | --- |
| Leve | CRF 26, `veryfast` | AAC 128 kb/s |
| Médio padrão | CRF 22, `medium` | AAC 160 kb/s |
| Alto | CRF 18, `slow` | AAC 192 kb/s |

O comando seleciona H.264 (`libx264`), AAC e `yuv420p`, que oferecem ampla compatibilidade. Se o build carregado não incluir H.264 ou AAC, o site informa claramente a incompatibilidade em vez de gerar outro codec. A conversão mantém o mapeamento de vídeo/áudio e gera timestamps quando necessários para preservar a sincronia relativa.

## Limites importantes

FFmpeg.wasm mantém o vídeo de entrada e saída na memória. Replays longos ou grandes podem consumir bastante RAM, deixar a aba lenta ou falhar, especialmente em máquinas com pouca memória. Feche outras abas e prefira arquivos menores; o cancelamento encerra o processo e libera a instância atual. O aplicativo exibe apenas o tamanho final real — não estima tamanho antes da conversão.
