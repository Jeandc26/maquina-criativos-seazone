#!/usr/bin/env node
/**
 * MÁQUINA DE CRIATIVOS SEAZONE
 * Integração fal.ai — Geração de imagens e vídeos
 *
 * Como usar:
 *   Imagem:  node tools/gerar-criativo.js imagem fachada-principal
 *   Vídeo:   node tools/gerar-criativo.js video broll-praia-drone
 *   Tudo:    node tools/gerar-criativo.js --todos
 *
 * Requisito: FAL_API_KEY no arquivo .env
 */

require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Contexto visual da marca Seazone ──────────────────────────────────────
const CONTEXTO_SEAZONE = `
Professional marketing photography for Seazone Investimentos, a premium real estate investment company in Brazil.
Style: photorealistic, cinematic, high-end real estate campaign quality.
Rules: bright natural light, no dark filters, no borders or overlays, no text in image,
no people in architectural shots, modern and aspirational aesthetic.
Colors: turquoise ocean, white sand, tropical green vegetation, glass/concrete/noble wood.
`;

// ── Prompts de IMAGEM (Flux Pro) ───────────────────────────────────────────
const PROMPTS_IMAGEM = {

  'fachada-principal': {
    nome: 'Fachada Principal — Widescreen',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Modern luxury apartment building facade in Florianópolis Brazil. Contemporary architecture, clean lines, floor-to-ceiling glass windows, natural wood accents, white concrete. Lush tropical landscaping. Bright midday sunlight, clear blue sky. Wide angle full building shot from street level. Ultra-realistic 4K.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'fachada-stories': {
    nome: 'Fachada — Stories/Reels (vertical)',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Modern luxury apartment building facade in Florianópolis Brazil. Contemporary architecture, glass and wood. Vertical composition, showing full building height. Bright natural light. Ultra-realistic 4K.`,
    params: { image_size: 'portrait_9_16', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'fachada-feed': {
    nome: 'Fachada — Feed quadrado',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Luxury apartment building facade square composition, Florianópolis Brazil. Modern architecture, glass and tropical vegetation. Golden hour warm light. Ultra-realistic 4K.`,
    params: { image_size: 'square_hd', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'aerea-praia': {
    nome: 'Vista Aérea — Praia do Novo Campeche',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Aerial drone photography of Novo Campeche Beach in Florianópolis Santa Catarina Brazil. Crystal clear turquoise water, white pristine sand beach, green coastal vegetation. 45 degree drone angle, wide establishing shot. Perfect sunny day, blue sky. Ultra-realistic cinematic 4K.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'aerea-bairro': {
    nome: 'Vista Aérea — Bairro Campeche com orla',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Aerial view of Campeche neighborhood in Florianópolis Brazil showing coastline, turquoise ocean, organized residential streets and tropical vegetation. Modern buildings, clear blue sky. Photorealistic 4K.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'rooftop-mar': {
    nome: 'Rooftop com Vista para o Mar',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Luxury rooftop terrace with panoramic ocean view in Florianópolis Brazil. Novo Campeche Beach visible in background. Glass railings, contemporary design, light flooring. Golden hour warm light. Ultra-realistic aspirational 4K.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'rooftop-pool': {
    nome: 'Rooftop — Piscina com vista',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Modern rooftop infinity pool overlooking the ocean in Florianópolis Brazil. Turquoise water, contemporary architecture, tropical vegetation. Bright sunny day. Professional architectural photography 4K.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'ilha-campeche': {
    nome: 'Ilha do Campeche — Caribe Brasileiro',
    modelo: 'fal-ai/flux-pro',
    prompt: `${CONTEXTO_SEAZONE} Aerial photography of pristine tropical island with emerald green water, white sand beaches and dense vegetation. Water transitions from deep blue to turquoise to crystal clear. Florianópolis Brazil. No buildings, no people. Ultra-realistic 4K drone shot.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },

  'grafico-cdb': {
    nome: 'Gráfico — Comparativo CDI vs SPOT',
    modelo: 'fal-ai/flux-pro',
    prompt: `Minimalist financial data visualization. Dark charcoal background (#1A1A2E). Two vertical bars: shorter gray bar on left (CDI), taller coral/orange bar on right (SPOT II) significantly higher. Clean modern fintech design. No text, no numbers, no labels. Bold impactful simple composition. Professional render quality.`,
    params: { image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, num_images: 1, enable_safety_checker: true }
  },
};

// ── Prompts de VÍDEO (Kling via fal.ai) ───────────────────────────────────
const PROMPTS_VIDEO = {

  'broll-praia-drone': {
    nome: 'B-Roll — Drone Praia Novo Campeche',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Cinematic aerial drone shot slowly approaching Novo Campeche Beach in Florianópolis Brazil. Crystal clear turquoise water, white sand beach, gentle waves breaking. Bright sunny day, golden hour light. Smooth descending camera movement from 80 meters. No people. Photorealistic 4K cinematic quality.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark, blurry, low quality' }
  },

  'broll-praia-nivel': {
    nome: 'B-Roll — Praia ao nível do solo',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Ground level wide shot of Novo Campeche Beach in Florianópolis Brazil. Waves gently breaking on white sand, crystal clear shallow water showing sandy bottom, turquoise ocean extending to horizon. Golden morning light. Slow gentle camera movement. No people. Ultra-realistic 4K cinematic.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark, blurry' }
  },

  'broll-ondas': {
    nome: 'B-Roll — Ondas cristalinas close',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Close up slow motion shot of crystal clear turquoise waves gently breaking on white sand beach in Brazil. Light refracting through water, fine white sand visible. Bright sunlight. No people. Ultra-realistic 4K slow motion aesthetic.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark' }
  },

  'broll-ilha': {
    nome: 'B-Roll — Ilha do Campeche',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Aerial drone shot circling a small pristine tropical island with emerald green water surrounding it, white sand beaches and dense tropical vegetation. Water transitions from deep blue to turquoise near shore. Bright sunny day. No people. Ultra-realistic 4K cinematic drone footage.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, buildings, dark' }
  },

  'broll-rooftop': {
    nome: 'B-Roll — Rooftop com panning',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Slow cinematic panning shot of luxury rooftop terrace overlooking turquoise ocean in Florianópolis Brazil. Glass railings, contemporary architecture. Camera slowly pans from the terrace to reveal the ocean view. Golden hour light. No people. Ultra-realistic 4K.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark, blurry' }
  },

  'broll-fachada': {
    nome: 'B-Roll — Fachada reveal',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Cinematic reveal shot of modern luxury apartment building facade in Florianópolis Brazil. Camera slowly pulls back to reveal the full contemporary architecture with glass and wood. Bright daylight, blue sky, tropical vegetation. No people. Ultra-realistic 4K.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark, blurry' }
  },

  'broll-bairro': {
    nome: 'B-Roll — Lifestyle do bairro',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Smooth tracking shot along a modern upscale coastal neighborhood street in Florianópolis Brazil. Clean bike lane, mature tropical trees, well-maintained sidewalks, modern residential buildings. Bright morning light through palm trees. No people. Photorealistic 4K lifestyle.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, dark' }
  },

  'abertura-cdb': {
    nome: 'Abertura — Gancho CDB (tela escura)',
    modelo: 'fal-ai/kling-video/v1.6/pro/text-to-video',
    prompt: `Minimalist financial animation on very dark charcoal background. Two simple vertical bars slowly appear: a shorter gray bar on the left, then a taller coral orange bar on the right growing higher. Clean modern fintech aesthetic. No text, no numbers. Simple bold composition. 4K.`,
    params: { duration: '5', aspect_ratio: '16:9', negative_prompt: 'text, watermark, people, bright background, complex' }
  },
};

// ── Função para chamar a API do fal.ai ────────────────────────────────────
async function chamarFalAI(modelo, payload) {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    console.error('\n❌ FAL_API_KEY não encontrada!');
    console.error('   Crie o arquivo .env com: FAL_API_KEY=sua_chave_aqui\n');
    process.exit(1);
  }

  // Submete o job
  const submitPayload = JSON.stringify({ ...payload });
  const modelPath = modelo.replace('fal-ai/', '');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'queue.fal.run',
      path: `/${modelo}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
        'Content-Length': Buffer.byteLength(submitPayload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const result = JSON.parse(data);
          if (result.error) { reject(new Error(result.error)); return; }

          // Se retornou resultado direto
          if (result.images || result.video) {
            resolve(result);
            return;
          }

          // Se retornou request_id (processamento assíncrono)
          if (result.request_id) {
            const finalResult = await aguardarResultado(modelo, result.request_id, apiKey);
            resolve(finalResult);
            return;
          }

          resolve(result);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(submitPayload);
    req.end();
  });
}

// ── Aguarda o resultado assíncrono ────────────────────────────────────────
async function aguardarResultado(modelo, requestId, apiKey) {
  const maxTentativas = 60; // 5 minutos máximo
  let tentativa = 0;

  while (tentativa < maxTentativas) {
    await new Promise(r => setTimeout(r, 5000)); // Aguarda 5 segundos
    tentativa++;

    const resultado = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'queue.fal.run',
        path: `/${modelo}/requests/${requestId}`,
        method: 'GET',
        headers: { 'Authorization': `Key ${apiKey}` }
      };

      https.get({ ...options }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (resultado.status === 'COMPLETED') return resultado.response || resultado;
    if (resultado.status === 'FAILED') throw new Error(`Job falhou: ${resultado.error}`);

    const pct = Math.round((tentativa / maxTentativas) * 100);
    process.stdout.write(`\r   ⏳ Processando... ${pct}% (${tentativa * 5}s)`);
  }

  throw new Error('Timeout: geração demorou mais de 5 minutos');
}

// ── Baixa e salva o arquivo ───────────────────────────────────────────────
async function baixarArquivo(url, destino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destino);
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      // Segue redirecionamentos
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(destino, () => {});
        baixarArquivo(res.headers.location, destino).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(destino, () => {}); reject(err); });
  });
}

// ── Gerar imagem ──────────────────────────────────────────────────────────
async function gerarImagem(tipo) {
  const config = PROMPTS_IMAGEM[tipo];
  const pasta = path.join(__dirname, '..', 'outputs', 'images', tipo);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const destino = path.join(pasta, `${tipo}_${timestamp}.png`);

  console.log(`\n🖼️  Gerando imagem: ${config.nome}`);
  console.log(`   Modelo: Flux Pro | Qualidade: HD`);

  try {
    const resultado = await chamarFalAI(config.modelo, {
      prompt: config.prompt,
      ...config.params
    });

    const url = resultado.images?.[0]?.url || resultado.image?.url;
    if (!url) throw new Error('URL da imagem não encontrada na resposta');

    await baixarArquivo(url, destino);
    console.log(`\n   ✅ Salvo em: outputs/images/${tipo}/${path.basename(destino)}`);
  } catch (err) {
    console.error(`\n   ❌ Erro: ${err.message}`);
  }
}

// ── Gerar vídeo ───────────────────────────────────────────────────────────
async function gerarVideo(tipo) {
  const config = PROMPTS_VIDEO[tipo];
  const pasta = path.join(__dirname, '..', 'outputs', 'videos', 'broll', tipo);
  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const destino = path.join(pasta, `${tipo}_${timestamp}.mp4`);

  console.log(`\n🎬 Gerando vídeo: ${config.nome}`);
  console.log(`   Modelo: Kling v1.6 Pro | Duração: ${config.params.duration}s`);

  try {
    const resultado = await chamarFalAI(config.modelo, {
      prompt: config.prompt,
      ...config.params
    });

    const url = resultado.video?.url || resultado.video_url;
    if (!url) throw new Error('URL do vídeo não encontrada na resposta');

    await baixarArquivo(url, destino);
    console.log(`\n   ✅ Salvo em: outputs/videos/broll/${tipo}/${path.basename(destino)}`);
  } catch (err) {
    console.error(`\n   ❌ Erro: ${err.message}`);
  }
}

// ── Menu e execução principal ─────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (!args.length || args[0] === '--ajuda') {
    console.log('\n🎨 MÁQUINA DE CRIATIVOS SEAZONE — fal.ai\n');
    console.log('Uso:');
    console.log('  node tools/gerar-criativo.js imagem [tipo]');
    console.log('  node tools/gerar-criativo.js video [tipo]');
    console.log('  node tools/gerar-criativo.js --todos\n');

    console.log('IMAGENS disponíveis (Flux Pro):');
    Object.entries(PROMPTS_IMAGEM).forEach(([k, v]) =>
      console.log(`  ${k.padEnd(25)} → ${v.nome}`)
    );

    console.log('\nVÍDEOS disponíveis (Kling v1.6 Pro):');
    Object.entries(PROMPTS_VIDEO).forEach(([k, v]) =>
      console.log(`  ${k.padEnd(25)} → ${v.nome}`)
    );

    console.log('\nExemplos:');
    console.log('  node tools/gerar-criativo.js imagem fachada-principal');
    console.log('  node tools/gerar-criativo.js video broll-praia-drone');
    console.log('  node tools/gerar-criativo.js --todos\n');
    return;
  }

  if (args[0] === '--todos') {
    console.log('\n🚀 Gerando todos os assets do Novo Campeche SPOT II...\n');

    console.log('📸 IMAGENS:');
    for (const tipo of Object.keys(PROMPTS_IMAGEM)) {
      await gerarImagem(tipo);
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n\n🎬 VÍDEOS:');
    for (const tipo of Object.keys(PROMPTS_VIDEO)) {
      await gerarVideo(tipo);
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log('\n\n✅ Todos os assets gerados!');
    console.log('   Confira as pastas outputs/images/ e outputs/videos/broll/\n');
    return;
  }

  const [categoria, tipo] = args;

  if (categoria === 'imagem') {
    if (!tipo || !PROMPTS_IMAGEM[tipo]) {
      console.error(`\n❌ Tipo de imagem '${tipo}' não encontrado.`);
      console.error('   Execute sem argumentos para ver os tipos disponíveis.\n');
      process.exit(1);
    }
    await gerarImagem(tipo);
    return;
  }

  if (categoria === 'video') {
    if (!tipo || !PROMPTS_VIDEO[tipo]) {
      console.error(`\n❌ Tipo de vídeo '${tipo}' não encontrado.`);
      console.error('   Execute sem argumentos para ver os tipos disponíveis.\n');
      process.exit(1);
    }
    await gerarVideo(tipo);
    return;
  }

  console.error(`\n❌ Categoria '${categoria}' inválida. Use 'imagem' ou 'video'.\n`);
  process.exit(1);
}

main().catch(console.error);
