# Guia de Integração com Ferramentas de Criação

## DALL-E 3 (Imagens)

```python
import openai

client = openai.OpenAI(api_key="SUA_API_KEY")

response = client.images.generate(
    model="dall-e-3",
    prompt="[PROMPT GERADO PELO CLAUDE]",
    size="1792x1024",  # Formato widescreen para vídeo
    quality="hd",
    n=1
)

image_url = response.data[0].url
```

## Flux (Imagens fotorrealistas via Replicate)

```python
import replicate

output = replicate.run(
    "black-forest-labs/flux-1.1-pro",
    input={
        "prompt": "[PROMPT GERADO PELO CLAUDE]",
        "aspect_ratio": "16:9",
        "output_format": "jpg",
        "output_quality": 95
    }
)
```

## Runway Gen-3 (Vídeo)

```python
import runwayml

client = runwayml.RunwayML(api_key="SUA_API_KEY")

task = client.image_to_video.create(
    model='gen3a_turbo',
    prompt_image="[URL_DA_IMAGEM_BASE]",
    prompt_text="[PROMPT DE VÍDEO GERADO PELO CLAUDE]",
    duration=10,  # 5 ou 10 segundos
    ratio="1280:768"
)
```

## Estrutura de prompt para imagens Seazone

O Claude vai gerar prompts neste formato:

```
[CENA]: Vista aérea da Praia do Novo Campeche, Florianópolis
[ESTILO]: Fotografia aérea profissional, drone shot, 4K
[LUZ]: Luz natural do meio-dia, céu azul sem nuvens
[COR]: Mar azul intenso turquesa, areia branca, vegetação verde
[ÂNGULO]: 45 graus de altitude, enquadramento widescreen
[RESTRIÇÕES]: Sem pessoas em excesso, sem efeitos de pós-produção escuros, sem molduras
```

## Variáveis de ambiente necessárias

Crie um arquivo `.env` na raiz do projeto:

```
OPENAI_API_KEY=sua_chave_aqui
REPLICATE_API_TOKEN=sua_chave_aqui
RUNWAY_API_KEY=sua_chave_aqui
```
