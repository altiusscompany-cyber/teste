---
name: edicao-ugc-tech
description: Edita vídeos verticais (Reels) de criadora UGC/tech em estilo "talking head + tela do app": legenda palavra por palavra, prints/gravações de tela no topo com a pessoa recortada na frente, stickers de meme e CTA final "Comente X". Use quando pedirem para editar, montar ou dar o "estilo Vitória Alves" a um vídeo de tutorial, automação, ferramenta ou bastidor.
---

# Edição UGC Tech (talking head + tela)

Estilo extraído do Reel de @vittoriahalves (tutorial de automação de DM com Manychat, 55 s).

## Especificações do vídeo
- **Formato:** 1080x1920 (9:16), 30 fps, H.264 + AAC 44.1 kHz. Duração alvo: 30 a 60 s.
- **Ritmo:** corte ou troca de camada a cada 1,5 a 3 s (cerca de 25 a 30 mudanças por minuto). Nunca deixe mais de 4 s com a mesma imagem.
- **Base:** a pessoa falando para a câmera, enquadramento de busto, fundo de quarto/home office com luz quente. Sem trilha invasiva: a voz manda.

## Camadas (de baixo para cima)
1. **Talking head** em tela cheia, com leve color grade quente (contraste +5 a 10%, saturação +5%).
2. **B-roll de tela** (gravação de tela do celular ou desktop, prints de comentários, DMs, painéis da ferramenta):
   - Ocupa o **topo ou a tela inteira**, cortado em retângulo ou com cantos arredondados.
   - Quando a tela ocupa o quadro todo, **recorte a pessoa** (remoção de fundo) e coloque-a pequena no canto inferior direito, para ela continuar presente.
   - Quando ocupa só o topo, a pessoa permanece na metade inferior.
   - Mostre cursor/dedo clicando e zoom no campo que está sendo explicado (ex.: campo de palavra-chave, botão, link).
3. **Colagem de provas** (grade de capas de Reels, lista de perfis, mosaico de resultados) por cerca de 1 s, para dar prova social.
4. **Stickers e memes** (gato confuso, gato reagindo): pequenos, centralizados no topo, entram por 1 a 2 s só em piadas ou ênfases.
5. **Cartão de marca/ferramenta:** logotipo da ferramenta em cartão branco arredondado, no centro do quadro, quando o nome é citado (ex.: "Manychat").
6. **Legendas palavra por palavra** (ver abaixo).
7. **CTA final:** cartão branco arredondado no terço superior com o texto "Comente **"Link"**" (a palavra-chave em negrito), nos últimos 3 a 5 s.

## Legendas
- **Uma palavra por vez**, sincronizada com a fala (karaokê de palavra única), sem pontuação.
- Fonte sans-serif limpa e média/semibold, branca, com sombra suave ou contorno fino para ler sobre qualquer fundo.
- Posição: centro horizontal, entre 65% e 80% da altura do quadro (na altura do peito da pessoa). Mantenha fixa o vídeo todo.
- Tamanho: cerca de 60 a 70 px em 1080 de largura.
- Palavras de destaque (nome da ferramenta, "DM", "link", "gratuito") podem aparecer com a fonte de marca ou em negrito.
- Quando uma tela cobre o quadro, a legenda continua por cima, em posição fixa.

## Roteiro-padrão (estrutura de narrativa)
1. **Gancho (0 a 5 s):** problema + prova (ex.: print de comentário "Verifica a tua DM!").
2. **Contexto (5 a 15 s):** como funciona o fluxo do ponto de vista do público (comentou, recebeu DM, clicou no link), mostrando telas reais.
3. **Ferramenta (15 a 30 s):** nome da ferramenta + passo a passo curto em gravação de tela, um passo por corte.
4. **Resultado/oferta (30 a 45 s):** o que a pessoa ganha, mostrar a mensagem final recebida.
5. **CTA (últimos 5 s):** "Comente [palavra]" com cartão na tela.

## Fluxo de produção com ffmpeg
1. Normalize: `ffmpeg -i in.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -c:v libx264 -crf 18 -c:a aac base.mp4`
2. Remova silêncios e respiros longos: detecte com `silencedetect=n=-35dB:d=0.3` e corte.
3. Transcreva com timestamps por palavra (Whisper `--word_timestamps True`) e gere um `.ass` com uma palavra por evento.
4. Posicione B-rolls com `overlay` e `enable='between(t,a,b)'`; para a pessoa recortada, use um matte (rembg/Robust Video Matting) e sobreponha escalada a ~35% no canto inferior direito.
5. Queime as legendas: `-vf "ass=legendas.ass"`.
6. Exporte: `-c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart`.

## Checklist final
- [ ] 9:16, 1080x1920, voz clara e normalizada (-14 LUFS aprox.).
- [ ] Nenhum plano parado por mais de 4 s.
- [ ] Toda tela mostrada tem cursor ou zoom no ponto explicado.
- [ ] Legenda palavra por palavra sincronizada e legível sobre todos os fundos.
- [ ] Dados sensíveis (nomes, e-mails, links pessoais) borrados nas telas.
- [ ] CTA com a palavra-chave nos segundos finais.
