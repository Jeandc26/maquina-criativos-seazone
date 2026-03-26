#!/usr/bin/env node
/**
 * MÁQUINA DE CRIATIVOS SEAZONE
 * Integração ElevenLabs — Geração automática de narração em off
 * 
 * Como usar:
 * node tools/gerar-narracao.js --estrutura 1 --variacao v1 --duracao 30-40s
 * 
 * Requisito: ELEVENLABS_API_KEY no arquivo .env
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Roteiros completos por estrutura e variação ────────────────────────────
const ROTEIROS = {

  'estrutura1-v1': {
    nome: 'Estrutura 1 — V1 | 30–40s | Praia | Airbnb',
    cenas: [
      { id: 'cena1', texto: 'Novo Campeche, em Florianópolis. Uma das praias mais buscadas da ilha — e um dos bairros com maior faturamento bruto de Airbnb em Santa Catarina.' },
      { id: 'cena2', texto: 'Esse é o Novo Campeche SPOT II — projeto desenhado do zero para Airbnb, no mesmo padrão que já provou a tese.' },
      { id: 'cena3-monica', texto: 'Eu sou a Monica, sócia da Seazone. Nosso projeto aqui projeta ROI de 16,40% ao ano — acima da Selic e acima dos concorrentes diretos da região. Isso representa cerca de 5.500 reais por mês estimados.' },
      { id: 'cena4', texto: 'Localização entre as mais desejadas de Florianópolis, rooftop com vista para o mar e gestão completa da Seazone. O investidor não precisa gerenciar nada.' },
      { id: 'cena5-cta', texto: 'Se faz sentido para você, fale com o nosso time e entenda os detalhes.' },
    ]
  },

  'estrutura1-v2-cdb': {
    nome: 'Estrutura 1 — V2 | Gancho CDB | 30–40s',
    cenas: [
      { id: 'cena1-cdb', texto: 'CDI líquido de imposto de renda, hoje, dá cerca de 9,8% ao ano. É o que de fato fica no seu bolso.' },
      { id: 'cena2-cdb', texto: 'O Novo Campeche SPOT II, com gestão Seazone, projeta 16,40% ao ano. A diferença em 335 mil reais, em cinco anos, é significativa.' },
      { id: 'cena3-monica', texto: 'Sou a Monica, sócia da Seazone. Cerca de 5.500 reais por mês — em uma das praias mais desejadas de Florianópolis, com demanda turística o ano inteiro.' },
      { id: 'cena4', texto: 'Projeto pensado para short stay desde a origem, fachada valorizada e gestão completa da Seazone. Não é papel — é ativo real no seu nome.' },
      { id: 'cena5-cta', texto: 'Se você quer os números completos da projeção, clique abaixo.' },
    ]
  },

  'estrutura1-v4-curta': {
    nome: 'Estrutura 1 — V4 | 10–20s | Sem ticket',
    cenas: [
      { id: 'cena1', texto: 'Novo Campeche. Uma das praias mais buscadas do Brasil.' },
      { id: 'cena2-monica', texto: 'Sou a Monica, sócia da Seazone. ROI de 16,40% ao ano — cerca de 5.500 reais por mês em Airbnb, com gestão completa.' },
      { id: 'cena3-cta', texto: 'Fale com o nosso time e entenda os detalhes.' },
    ]
  },

  'estrutura2-v1': {
    nome: 'Estrutura 2 — V1 | RE mensal | Short stay | 30–40s',
    cenas: [
      { id: 'cena1', texto: 'Novo Campeche — bairro com maior faturamento bruto de Florianópolis e demanda turística constante, o ano inteiro.' },
      { id: 'cena2-monica', texto: 'Sou a Monica, sócia da Seazone. Nosso projeto projeta ROI de 16,40% ao ano — cerca de 5.500 reais por mês em short stay, acima da Selic.' },
      { id: 'cena3', texto: 'São 66 mil reais por ano estimados — com investimento inicial abaixo da média dos concorrentes, que custam em média 584 mil reais.' },
      { id: 'cena4', texto: 'Fachada no mesmo padrão do Novo Campeche Spot original. Rooftop com vista para o mar. Gestão completa da Seazone.' },
      { id: 'cena5-cta', texto: 'Fale com o nosso time e simule o seu investimento.' },
    ]
  },

  'estrutura2-v2-selic': {
    nome: 'Estrutura 2 — V2 | ROI Comparativo Selic | 30–40s',
    cenas: [
      { id: 'cena1', texto: 'Novo Campeche, em Florianópolis. Mar azul intenso, alta demanda — o ano inteiro.' },
      { id: 'cena2-monica', texto: 'Sou a Monica, sócia da Seazone. Enquanto a Selic rende cerca de 10,75% ao ano, nosso projeto projeta 16,40%. E ainda tem o imóvel no seu nome.' },
      { id: 'cena3', texto: 'Cerca de 5.500 reais por mês — com gestão completa da Seazone, que cuida de tudo: anúncio, atendimento, limpeza e manutenção.' },
      { id: 'cena4', texto: 'Fachada valorizada, rooftop com vista para o mar e projeto pensado para short stay desde a origem.' },
      { id: 'cena5-cta', texto: 'Se você quer os números completos, fale com o nosso time.' },
    ]
  },

  'estrutura3-v1': {
    nome: 'Estrutura 3 — V1 | Fachada | Short stay | 30–40s',
    cenas: [
      { id: 'cena1', texto: 'Esse é o Novo Campeche SPOT II — projeto desenhado do zero para short stay em uma das praias mais desejadas de Florianópolis.' },
      { id: 'cena2-monica', texto: 'Eu sou a Monica, sócia da Seazone. Nosso projeto projeta ROI de 16,40% ao ano — acima da Selic e superior aos 8 concorrentes da região. Cerca de 5.500 reais por mês estimados.' },
      { id: 'cena3', texto: 'Localizado em um dos bairros com maior faturamento bruto de Florianópolis — alta demanda o ano inteiro, com baixa sazonalidade.' },
      { id: 'cena4', texto: 'Rooftop com vista para o mar, proximidade com a Ilha do Campeche e gestão completa da Seazone.' },
      { id: 'cena5-cta', texto: 'Se faz sentido para você, fale com o nosso time.' },
    ]
  },

  // NARRADO — sem apresentadora
  'narrado-v1': {
    nome: 'Narrado — V1 | 3 Motivos | Airbnb | 30–40s',
    cenas: [
      { id: 'cena1', texto: 'Novo Campeche, em Florianópolis. Um dos bairros com maior faturamento bruto de Airbnb em Santa Catarina — com demanda turística o ano inteiro.' },
      { id: 'cena2', texto: 'Aqui estão os 3 motivos pelos quais o Novo Campeche SPOT II é uma das oportunidades mais estratégicas do portfólio Seazone.' },
      { id: 'cena3', texto: 'Primeiro motivo: o produto. Desenhado do zero para Airbnb — fachada valorizada, no mesmo padrão que já provou a tese na região.' },
      { id: 'cena4', texto: 'Segundo motivo: o retorno. ROI de 16,40% ao ano, acima da Selic. Rendimento estimado de 5.500 reais por mês.' },
      { id: 'cena5', texto: 'Terceiro motivo: a localização. Bairro com maior faturamento bruto de Florianópolis, baixa sazonalidade e rooftop com vista para o mar.' },
      { id: 'cena6-cta', texto: 'A partir de 335 mil reais. Clique em Saiba Mais.' },
    ]
  },

  'narrado-v2-cdb': {
    nome: 'Narrado — V2 | Gancho CDB | 30–40s',
    cenas: [
      { id: 'cena1-cdb', texto: 'CDI líquido de imposto de renda: cerca de 9,8% ao ano. O Novo Campeche SPOT II projeta 16,40%.' },
      { id: 'cena2', texto: 'A diferença, em 335 mil reais, ao longo de cinco anos — é significativa. E ainda tem o imóvel no seu nome.' },
      { id: 'cena3', texto: 'Projeto nativo para short stay, fachada valorizada e gestão completa Seazone — sem taxa surpresa.' },
      { id: 'cena4', texto: 'Localizado em um dos bairros com maior faturamento bruto de Florianópolis e demanda turística constante.' },
      { id: 'cena5', texto: 'ROI de 16,40% — acima da Selic e superior aos 8 concorrentes diretos da região.' },
      { id: 'cena6-cta', texto: 'A partir de 335 mil reais. Saiba Mais.' },
    ]
  },

};

// ── Configuração de voz ElevenLabs ─────────────────────────────────────────
const VOZES = {
  // Vozes disponíveis no plano gratuito ElevenLabs
  'rachel': 'Rachel',          // Feminina, profissional, neutra
  'bella': 'Bella',            // Feminina, suave
  'domi': 'Domi',              // Feminina, energética
  'elli': 'Elli',              // Feminina, confiante
};

// IDs reais das vozes ElevenLabs (pré-built)
const VOZ_IDS = {
  'rachel': '21m00Tcm4TlvDq8ikWAM',
  'bella': 'EXAVITQu4vr4xnSDxMaL',
  'domi': 'AZnzlk1XvdvUeBnXmlld',
  'elli': 'MF3mGyEYCl7XYWbV9V6O',
};

// ── Função para gerar áudio via ElevenLabs ─────────────────────────────────
async function gerarAudio(texto, vozId, caminhoDestino) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('❌ ELEVENLABS_API_KEY não encontrada no .env');
    process.exit(1);
  }

  const payload = JSON.stringify({
    text: texto,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    }
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${vozId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let err = '';
        res.on('data', d => err += d);
        res.on('end', () => reject(new Error(`ElevenLabs API erro ${res.statusCode}: ${err}`)));
        return;
      }
      const file = fs.createWriteStream(caminhoDestino);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── Função principal ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const roteiro = args[0];
  const voz = args[1] || 'rachel';

  // Mostra menu se sem argumentos
  if (!roteiro) {
    console.log('\n🎙️  MÁQUINA DE CRIATIVOS SEAZONE — Gerador de Narração\n');
    console.log('Uso: node tools/gerar-narracao.js [roteiro] [voz]\n');
    console.log('Roteiros disponíveis:\n');

    const grupos = {
      'VÍDEO COM APRESENTADORA': ['estrutura1-v1', 'estrutura1-v2-cdb', 'estrutura1-v4-curta', 'estrutura2-v1', 'estrutura2-v2-selic', 'estrutura3-v1'],
      'VÍDEO NARRADO': ['narrado-v1', 'narrado-v2-cdb'],
    };

    for (const [grupo, roteiros] of Object.entries(grupos)) {
      console.log(`  ${grupo}:`);
      roteiros.forEach(r => console.log(`    ${r.padEnd(30)} → ${ROTEIROS[r].nome}`));
      console.log('');
    }

    console.log('Vozes disponíveis: rachel (padrão), bella, domi, elli\n');
    console.log('Exemplo: node tools/gerar-narracao.js estrutura1-v1 rachel');
    console.log('Gerar todos: node tools/gerar-narracao.js --todos\n');
    return;
  }

  // Gerar todos
  if (roteiro === '--todos') {
    for (const r of Object.keys(ROTEIROS)) {
      await gerarRoteiro(r, voz);
    }
    return;
  }

  if (!ROTEIROS[roteiro]) {
    console.error(`❌ Roteiro '${roteiro}' não encontrado.`);
    process.exit(1);
  }

  await gerarRoteiro(roteiro, voz);
}

async function gerarRoteiro(roteiro, voz) {
  const config = ROTEIROS[roteiro];
  const vozId = VOZ_IDS[voz] || VOZ_IDS['rachel'];
  const pastaBase = path.join(__dirname, '..', 'outputs', 'videos', 'narracao', roteiro);

  if (!fs.existsSync(pastaBase)) {
    fs.mkdirSync(pastaBase, { recursive: true });
  }

  console.log(`\n🎙️  Gerando narração: ${config.nome}`);
  console.log(`   Voz: ${voz} | Cenas: ${config.cenas.length}\n`);

  for (const cena of config.cenas) {
    const nomeArquivo = `${cena.id}.mp3`;
    const caminhoCompleto = path.join(pastaBase, nomeArquivo);

    console.log(`   ⏳ ${cena.id}: "${cena.texto.slice(0, 60)}..."`);

    try {
      await gerarAudio(cena.texto, vozId, caminhoCompleto);
      console.log(`   ✓ Salvo: outputs/videos/narracao/${roteiro}/${nomeArquivo}`);
    } catch (err) {
      console.error(`   ❌ Erro na ${cena.id}: ${err.message}`);
    }

    // Pausa entre chamadas para respeitar rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n✅ Narração completa salva em: outputs/videos/narracao/${roteiro}/`);
  console.log('   Importe os arquivos MP3 no CapCut na ordem das cenas.\n');
}

main().catch(console.error);
