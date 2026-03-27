 # Máquina de Criativos Seazone
> Hackathon Marketing AI 2026 — Claude Code + VEO 3 + HeyGen + Canva

Uma máquina autônoma de criação de criativos para campanhas de marketing da Seazone Investimentos. Recebe um briefing de empreendimento e gera scripts, prompts e assets prontos para campanha — com mínima intervenção humana.

---

## Como funciona

```
Briefing do empreendimento
        ↓
Claude Code lê o CLAUDE.md (contexto Seazone)
        ↓
Gera scripts + roteiros + prompts por formato
        ↓
VEO 3 → B-roll e fundos
HeyGen → Apresentadora
Canva  → Estáticos
        ↓
Assets prontos para campanha
```

---

## Estrutura do repositório

```
maquina-criativos-seazone/
│
├── CLAUDE.md                          # Contexto Seazone — lido pela IA antes de tudo
│
├── briefings/
│   └── novo-campeche-spot-ii.md       # Briefing completo do empreendimento
│
├── outputs/
│   ├── scripts/
│   │   └── briefing-criativos-novo-campeche-spot-ii.md
│   ├── images/                        # Estáticos gerados
│   └── videos/                        # Vídeos gerados
│
├── tools/
│   └── generate.md                    # Guia de integração com APIs
│
└── README.md                          # Este arquivo
```

---

## Como usar a máquina

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/maquina-criativos-seazone.git
cd maquina-criativos-seazone
```

### 2. Abra no Claude Code
Aponte o Claude Code para a pasta do projeto. Ele lê o `CLAUDE.md` automaticamente antes de qualquer tarefa.

### 3. Envie o comando de briefing
```
BRIEFING: Novo Campeche SPOT II
ESTRUTURA: 1
DURAÇÃO: 30-40s
PÚBLICO: Sudeste
FORMATO: vídeo apresentadora
```

### 4. A máquina entrega
- Script completo cena a cena com timecodes
- Roteiro da apresentadora com tom e instrução de performance
- Prompts VEO 3 prontos para copiar e colar
- Texto animado por cena
- Instruções de montagem no CapCut

---

## Formatos suportados

| Formato | Ferramentas | O que a máquina entrega |
|---|---|---|
| Vídeo com apresentadora | HeyGen + VEO 3 + CapCut | Script + prompts + roteiro HeyGen + montagem |
| Vídeo narrado | VEO 3 + ElevenLabs + CapCut | Script + prompts + narração + montagem |
| Estático | Canva | Textos + estrutura de camadas + 5 variações |

---

## Sistema de hipóteses para testes A/B

| Grupo | Hipótese testada |
|---|---|
| 1 | RE mensal × RE anual × ROI |
| 2 | Com ticket × Sem ticket |
| 3 | Primeira imagem: praia × fachada × rooftop × apresentadora |
| 4 | Airbnb × Short stay × Locação de temporada |
| 5 | 30–40s × 10–20s |
| 6 | Gancho CDB × Contextualização de destino |
| 7 | Gatilho escassez × Sem escassez |

---

## Critérios do hackathon

| Critério | Como atendemos |
|---|---|
| Qualidade do contexto Seazone | CLAUDE.md com ICP real (42 forms + 15 entrevistas), tom de voz, Do's e Don'ts baseados em dados |
| Autonomia da IA | Recebe o comando de briefing e entrega scripts, prompts e instruções sem intervenção humana |
| Pronto para uso | Qualquer pessoa do time consegue rodar com novo briefing. Totalmente documentado. |

---

## Desenvolvido por
Marketing Seazone — Hackathon Marketing AI 2026
