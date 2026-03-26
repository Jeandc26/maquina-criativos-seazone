#!/usr/bin/env node
/**
 * MÁQUINA DE CRIATIVOS SEAZONE
 * Integração DALL-E 3 — Geração automática de imagens
 * 
 * Como usar:
 * node tools/gerar-imagem.js --variacao v1 --estrutura fachada
 * 
 * Requisito: OPENAI_API_KEY no arquivo .env
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Contexto Seazone — regras visuais da marca ─────────────────────────────
const CONTEXTO_VISUAL = `
Você está gerando imagens para a Seazone Investimentos — empresa de investimento imobiliário de alto padrão.

REGRAS OBRIGATÓRIAS:
- Estilo fotorrealista profissional, qualidade de campanha publicitária
- Luz natural abundante — NUNCA escurecer a imagem
- Sem molduras, bordas ou sobreposições
- Sem texto na imagem gerada (textos são adicionados na edição)
- Sem pessoas nas imagens de fachada e aéreas
- Padrão visual: moderno, luminoso, aspiracional, premium
- Cores: azul do mar intenso, areia clara, vegetação tropical, concreto/vidro/madeira nobre

PROIBIDO:
- Efeitos que escurecam ou filtrem a imagem
- Estilo cartoon, ilustração ou arte
- Saturação excessiva ou HDR artificial
- Imagens genéricas ou sem identidade
`;

// ── Prompts por tipo de criativo ────────────────────────────────────────────
const PROMPTS = {

  // ESTÁTICOS — Estrutura 1: Fachada
  'fachada-principal': {
    nome: 'Fachada Principal — Novo Campeche SPOT II',
    prompt: `Professional real estate photography of a modern luxury apartment building facade in Florianópolis, Brazil. Contemporary architecture with clean lines, floor-to-ceiling glass windows, natural wood accents, and white concrete. Surrounded by lush tropical vegetation. Bright midday sunlight, clear blue sky. Wide angle shot showing the full building from street level. No people. No text. Ultra-realistic, cinematic quality, 4K. Shot with professional camera lens.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/fachada'
  },

  'fachada-quadrada': {
    nome: 'Fachada Quadrada — Feed Instagram',
    prompt: `Square format professional real estate photography of a modern luxury apartment building in Florianópolis Brazil. Clean contemporary facade, glass and wood, tropical landscaping. Bright natural light, blue sky. No people. No text. Ultra-realistic 4K.`,
    tamanho: '1024x1024',
    pasta: 'estaticos/fachada'
  },

  // ESTÁTICOS — Estrutura 2: Vista aérea com PIN
  'aerea-praia': {
    nome: 'Vista Aérea — Praia do Novo Campeche',
    prompt: `Aerial drone photography looking down at Novo Campeche Beach in Florianópolis, Santa Catarina, Brazil. Crystal clear turquoise ocean water, white pristine sand beach, green coastal vegetation. Sunny day with blue sky and gentle white clouds. Smooth drone movement captured at 60 meters altitude, wide establishing shot. No people visible on beach. No text or watermarks. Ultra-realistic, cinematic, 4K quality.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/aerea'
  },

  'aerea-bairro': {
    nome: 'Vista Aérea — Bairro Campeche com orla',
    prompt: `Aerial drone shot of Campeche neighborhood in Florianópolis Brazil, showing the coastline with turquoise ocean on one side and organized residential streets with tropical vegetation on the other. Modern buildings visible, clear blue sky, sunny midday. No people. No text. Photorealistic 4K cinematic quality.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/aerea'
  },

  // ESTÁTICOS — Estrutura 3: Rooftop
  'rooftop-vista': {
    nome: 'Rooftop com Vista para o Mar',
    prompt: `Luxury rooftop terrace of a modern apartment building in Florianópolis Brazil, with a panoramic view of the turquoise ocean and Novo Campeche Beach in the background. Clean contemporary design, light-colored flooring, glass railings, minimalist outdoor furniture. Golden hour warm light. No people. No text. Ultra-realistic, aspirational, cinematic quality 4K.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/rooftop'
  },

  'rooftop-pool': {
    nome: 'Rooftop — Piscina com vista',
    prompt: `Modern rooftop infinity pool overlooking the ocean in Florianópolis Brazil. Turquoise water reflecting the sky, contemporary architecture, tropical vegetation visible. Bright sunny day. No people. No text. Professional architectural photography, ultra-realistic 4K.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/rooftop'
  },

  // B-ROLL VÍDEO — Praia
  'broll-praia-drone': {
    nome: 'B-Roll — Drone Praia Novo Campeche',
    prompt: `Cinematic aerial drone photography of Novo Campeche Beach in Florianópolis Brazil. Vivid turquoise water with white foam waves breaking on white sand beach. Lush green tropical vegetation bordering the beach. Shot from 45 degree angle showing both ocean and coastline. Perfect sunny day, blue sky. No people. No text. Photorealistic 4K cinematic quality, wide establishing shot.`,
    tamanho: '1792x1024',
    pasta: 'broll/praia'
  },

  'broll-praia-nivel': {
    nome: 'B-Roll — Praia ao nível do solo',
    prompt: `Ground level wide angle photography of Novo Campeche Beach in Florianópolis Brazil. Waves gently breaking on white sand, crystal clear shallow water showing the sandy bottom, turquoise ocean extending to horizon. Golden morning light. No people. No text. Ultra-realistic 4K cinematic.`,
    tamanho: '1792x1024',
    pasta: 'broll/praia'
  },

  'broll-ondas': {
    nome: 'B-Roll — Ondas cristalinas close',
    prompt: `Close up macro photography of crystal clear turquoise waves breaking softly on white sand beach in Brazil. Water transparency visible, light refracting through the waves, fine white sand. Bright sunlight. No people. No text. Ultra-realistic 4K, slow motion aesthetic.`,
    tamanho: '1792x1024',
    pasta: 'broll/praia'
  },

  // B-ROLL VÍDEO — Ilha do Campeche
  'broll-ilha': {
    nome: 'B-Roll — Ilha do Campeche',
    prompt: `Aerial photography of a small pristine tropical island with emerald green water surrounding it, white sand beaches, and dense untouched tropical vegetation. The water transitions from deep blue to turquoise to clear near the shore. Bright sunny day. No buildings or structures. No people. No text. Ultra-realistic 4K cinematic drone shot, Florianópolis Brazil.`,
    tamanho: '1792x1024',
    pasta: 'broll/ilha'
  },

  // B-ROLL VÍDEO — Lifestyle
  'broll-lifestyle-bairro': {
    nome: 'B-Roll — Lifestyle do bairro Campeche',
    prompt: `Wide shot of a modern upscale coastal neighborhood street in Florianópolis Brazil. Clean bike lane, mature tropical trees providing shade, well-maintained sidewalks, modern residential buildings in background. Bright morning light filtering through palm trees. No people. No text. Photorealistic 4K lifestyle photography.`,
    tamanho: '1792x1024',
    pasta: 'broll/lifestyle'
  },

  // GANCHO CDB — Comparativo financeiro
  'grafico-cdb': {
    nome: 'Gráfico — Comparativo CDI vs SPOT',
    prompt: `Minimalist financial data visualization on dark charcoal background. Two vertical bars side by side: a shorter gray bar on the left, and a taller orange/coral bar on the right that is significantly bigger. Clean modern design, no decorative elements. Professional fintech aesthetic. No text labels, no numbers in the image. Simple, bold, impactful. Dark background (#1A1A2E), bars using coral/orange color (#E8593C). Ultra-realistic render quality.`,
    tamanho: '1792x1024',
    pasta: 'estaticos/grafico'
  },

};

// ── Função para chamar a API do DALL-E 3 ───────────────────────────────────
async function gerarImagem(promptConfig) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY não encontrada. Crie o arquivo .env com sua chave.');
    process.exit(1);
  }

  const payload = JSON.stringify({
    model: 'dall-e-3',
    prompt: CONTEXTO_VISUAL + '\n\nIMAGEM ESPECÍFICA:\n' + promptConfig.prompt,
    n: 1,
    size: promptConfig.tamanho,
    quality: 'hd',
    style: 'natural',
    response_format: 'url'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed.data[0].url);
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Função para baixar e salvar a imagem ───────────────────────────────────
async function baixarImagem(url, caminhoDestino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(caminhoDestino);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(caminhoDestino, () => {});
      reject(err);
    });
  });
}

// ── Função principal ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const tipoArg = args.find(a => !a.startsWith('--'))
    || args[args.indexOf('--tipo') + 1]
    || null;

  // Se nenhum argumento, mostra menu
  if (!tipoArg) {
    console.log('\n🎨 MÁQUINA DE CRIATIVOS SEAZONE — Gerador de Imagens\n');
    console.log('Uso: node tools/gerar-imagem.js [tipo]\n');
    console.log('Tipos disponíveis:\n');

    const grupos = {
      'ESTÁTICOS — Fachada': ['fachada-principal', 'fachada-quadrada'],
      'ESTÁTICOS — Vista Aérea': ['aerea-praia', 'aerea-bairro'],
      'ESTÁTICOS — Rooftop': ['rooftop-vista', 'rooftop-pool'],
      'B-ROLL — Praia': ['broll-praia-drone', 'broll-praia-nivel', 'broll-ondas'],
      'B-ROLL — Ilha': ['broll-ilha'],
      'B-ROLL — Lifestyle': ['broll-lifestyle-bairro'],
      'GRÁFICO': ['grafico-cdb'],
    };

    for (const [grupo, tipos] of Object.entries(grupos)) {
      console.log(`  ${grupo}:`);
      tipos.forEach(t => console.log(`    ${t.padEnd(30)} → ${PROMPTS[t].nome}`));
      console.log('');
    }

    console.log('Exemplo: node tools/gerar-imagem.js fachada-principal');
    console.log('Gerar todos: node tools/gerar-imagem.js --todos\n');
    return;
  }

  // Gerar todos
  if (tipoArg === '--todos' || args.includes('--todos')) {
    console.log('\n🎨 Gerando todos os assets...\n');
    for (const tipo of Object.keys(PROMPTS)) {
      await gerarEsalvar(tipo);
      await new Promise(r => setTimeout(r, 2000)); // Pausa entre chamadas
    }
    console.log('\n✅ Todos os assets gerados!\n');
    return;
  }

  // Gerar tipo específico
  if (!PROMPTS[tipoArg]) {
    console.error(`❌ Tipo '${tipoArg}' não encontrado. Execute sem argumentos para ver os tipos disponíveis.`);
    process.exit(1);
  }

  await gerarEsalvar(tipoArg);
}

async function gerarEsalvar(tipo) {
  const config = PROMPTS[tipo];
  const pastaBase = path.join(__dirname, '..', 'outputs', 'images', config.pasta);

  if (!fs.existsSync(pastaBase)) {
    fs.mkdirSync(pastaBase, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nomeArquivo = `${tipo}_${timestamp}.png`;
  const caminhoCompleto = path.join(pastaBase, nomeArquivo);

  console.log(`\n⏳ Gerando: ${config.nome}`);
  console.log(`   Tamanho: ${config.tamanho} | Qualidade: HD`);

  try {
    const url = await gerarImagem(config);
    console.log(`   ✓ Imagem gerada — baixando...`);
    await baixarImagem(url, caminhoCompleto);
    console.log(`   ✓ Salvo em: outputs/images/${config.pasta}/${nomeArquivo}`);
  } catch (err) {
    console.error(`   ❌ Erro: ${err.message}`);
  }
}

main().catch(console.error);
