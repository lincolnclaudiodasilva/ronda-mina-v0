# Ronda de Mina — App (PWA)

Este pacote transforma o formulário de ronda em um aplicativo instalável no Android e no iOS, sem precisar de Google Play ou App Store.

## O que é um PWA, em uma frase

É um site que, quando acessado de um link próprio (HTTPS), ganha um botão de **"Instalar"** — depois disso ele se comporta como um app: ícone na tela inicial, abre em tela cheia (sem barra do navegador) e continua funcionando sem internet.

## ⚠️ Importante: isso precisa estar online para instalar

Diferente do arquivo `ronda_mina.html` que você já tinha (que abre direto no navegador a partir do celular), **este pacote só instala de verdade se for acessado por uma URL `https://`**. Isso é uma regra do próprio Android/iOS — não é algo que dá para contornar abrindo o arquivo localmente. Por isso, o primeiro passo é colocar esses arquivos em algum lugar com link público.

## Passo 1 — Hospedar os arquivos

Suba **a pasta inteira** (`index.html`, `manifest.json`, `service-worker.js` e a pasta `icons/`, mantendo essa estrutura) em um destes lugares. Todas as opções abaixo são gratuitas e não exigem conhecimento técnico avançado:

### Opção A — Netlify Drop (mais simples, 2 minutos)
1. Acesse **https://app.netlify.com/drop**
2. Arraste a pasta `pwa` inteira para a página
3. Você recebe uma URL pronta (ex: `https://ronda-mina-samarca.netlify.app`)
4. Pronto — essa é a URL que a equipe vai abrir no celular

### Opção B — GitHub Pages (se a Samarco já usa GitHub/GitLab)
1. Crie um repositório novo e suba os arquivos desta pasta na raiz
2. Em **Settings > Pages**, ative o GitHub Pages apontando para a branch principal
3. A URL gerada (`https://seu-usuario.github.io/nome-do-repo/`) é o link de instalação

### Opção C — Servidor interno da empresa / SharePoint com site estático
Se a Samarco tiver um servidor web interno (IIS, Apache, Nginx) ou um site do SharePoint que sirva arquivos estáticos, basta copiar esta pasta para lá, mantendo a estrutura de subpastas. Funciona da mesma forma, desde que o acesso seja via HTTPS.

> Fale com o time de TI da Samarco se preferir hospedar dentro da rede interna da empresa — qualquer uma das opções acima funciona, o requisito único é ter uma URL HTTPS válida.

## Passo 2 — Instalar no celular

Depois que a URL estiver no ar, mande o link para a equipe (por WhatsApp, e-mail, etc.). Ao abrir:

**Android (Chrome):**
- Um banner aparece automaticamente na parte inferior da tela oferecendo "Instalar"
- Ou: menu (⋮) no canto superior direito → "Instalar app" / "Adicionar à tela inicial"

**iPhone/iPad (Safari):**
- O app não pode disparar a instalação automaticamente (restrição da Apple)
- Por isso, o app mostra uma faixa explicando: toque no ícone de **Compartilhar** (quadrado com seta para cima, na barra inferior do Safari) e depois em **"Adicionar à Tela de Início"**

Depois de instalado, o ícone do "capacete azul" aparece na tela inicial do celular como qualquer outro app, e abre em tela cheia.

## O que muda na prática para a equipe

- **Fotos direto da câmera**: ao tocar em "Tirar uma foto", o app abre a câmera nativa do celular. A foto recebe automaticamente um carimbo no rodapé com data, hora e coordenadas GPS (quando a localização estiver disponível).
- **Permissões**: na primeira vez que alguém tirar uma foto ou abrir o app, o celular vai pedir permissão de **Câmera** e de **Localização**. É necessário permitir as duas para o carimbo completo funcionar; se a localização for negada, a foto ainda é carimbada, só sem coordenadas.
- **Três formas de exportar a ronda** (botão "⬇ Exportar ronda" no rodapé):
  - **Planilha CSV** — dados estruturados para o Power BI (mesmo formato de antes, mais as colunas de quantidade de fotos).
  - **Fotos (.zip)** — todas as fotos da ronda, já carimbadas, nomeadas por registro. Suba esse .zip junto com o CSV onde for consolidar os dados.
  - **Relatório PDF** — documento único com texto e fotos organizados por registro, pronto para anexar e enviar por e-mail. Em celulares que suportam, o próprio app já abre o menu de compartilhamento nativo (e-mail, WhatsApp, etc.) com o PDF pronto.
- Funciona **offline** depois da primeira visita — útil em áreas da mina sem sinal. As fotos ficam guardadas no próprio celular (em um banco de dados local do navegador) até serem exportadas.
- Não precisa ficar guardando o link/favorito: fica com ícone próprio na tela inicial.
- Atualizações: ao publicar uma nova versão dos arquivos na mesma URL, o app se atualiza automaticamente na próxima vez que a pessoa tiver internet (o service worker já cuida disso).

## Sobre o armazenamento das fotos no celular

As fotos são guardadas localmente no dispositivo (tecnologia IndexedDB do navegador) até serem exportadas. Elas não saem do celular automaticamente — é responsabilidade de quem faz a ronda exportar (CSV/ZIP/PDF) e enviar para onde for consolidar os dados. Ao excluir um registro no app, as fotos associadas a ele também são apagadas do dispositivo.

## Sobre atualizar o app no futuro

Sempre que precisar mudar algo no formulário (novo campo, ajuste visual, etc.), é só substituir os arquivos no mesmo local de hospedagem. Não tem processo de revisão de loja, não tem espera de aprovação.

**Como a atualização chega para quem já tem o app instalado:**
- A tela principal do app sempre busca a versão mais nova direto do servidor — então o conteúdo (textos, campos, botões) nunca fica "preso" numa versão antiga.
- O que controla o **modo offline** (o que funciona sem internet) é o `service-worker.js`. Quando uma nova versão dele é detectada, aparece uma faixa na tela: "Uma versão mais nova do app está disponível", com um botão **Atualizar**. Ao tocar, o app recarrega já com tudo atualizado.
- Essa checagem acontece automaticamente sempre que o app é aberto ou volta ao primeiro plano (por exemplo, ao trocar de outro aplicativo de volta para a Ronda de Mina) — não depende do usuário fechar e abrir o app várias vezes.
- Se quiser forçar a atualização imediatamente em um aparelho específico, basta fechar o app completamente (deslizar para fechar, não só minimizar) e abrir de novo com internet.

## Se algo parecer "travado" ou um botão não responder

Quase sempre isso é causado pelo aparelho ainda estar com uma versão em cache mais antiga. Antes de qualquer outra investigação:
1. Feche o app completamente (não só minimize) e abra de novo com internet.
2. Se persistir, confirme que os arquivos no servidor realmente foram atualizados (data de modificação do `index.html`).
3. Em caso de dúvida, pode-se sempre testar abrindo o mesmo link direto no navegador (Safari/Chrome) em vez do ícone instalado — isso ajuda a isolar se o problema é do app instalado especificamente ou do conteúdo publicado.

## Limitações desta abordagem (PWA) frente a um app nativo "de loja"

- Não aparece pesquisando na Play Store / App Store (só instala por link)
- No iOS, a instalação depende da pessoa seguir o passo manual de "Adicionar à Tela de Início" (não tem como automatizar isso, é restrição da Apple)
- Acesso à câmera do celular é possível via navegador, mas funcionalidades muito avançadas de hardware (NFC, Bluetooth, etc.) têm suporte mais limitado que um app nativo

Se algum dia for necessário publicar formalmente nas lojas, o caminho seguinte é empacotar este mesmo código com **Capacitor**, gerando um `.apk`/`.aab` (Android) e `.ipa` (iOS) reais a partir dele — mas isso exige ambiente de build próprio (Android Studio e, para iOS, um Mac com Xcode + conta de desenvolvedor Apple).
