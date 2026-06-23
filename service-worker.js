// Service Worker — Ronda de Mina
// Cacheia o app shell para permitir uso offline em campo (mina, sem sinal).

const CACHE_NAME = 'ronda-mina-v6';
const ARQUIVOS_CACHE_LOCAIS = [
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];
const ARQUIVOS_CACHE_EXTERNOS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
];

// arquivos que devem SEMPRE tentar a rede primeiro (o "código" do app, que muda com frequência);
// o cache aqui é só um fallback para quando não há internet (não uma fonte preferida).
const ARQUIVOS_NETWORK_FIRST = ['./index.html', './manifest.json', './'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(ARQUIVOS_CACHE_LOCAIS);
      await Promise.all(
        ARQUIVOS_CACHE_EXTERNOS.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    })
  );
  // não chama skipWaiting() aqui de propósito: o novo service worker fica em
  // estado "waiting" até a página confirmar a atualização (ver mensagem ATIVAR_AGORA),
  // para o usuário não trocar de versão no meio de um registro sem querer.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// permite que a página peça para este service worker (já baixado, em espera)
// assumir o controle imediatamente, sem precisar fechar e abrir o app de novo
self.addEventListener('message', (event) => {
  if (event.data && event.data.tipo === 'ATIVAR_AGORA') {
    self.skipWaiting();
  }
});

function ehNetworkFirst(url){
  const caminho = new URL(url).pathname;
  return ARQUIVOS_NETWORK_FIRST.some((p) => caminho.endsWith(p.replace('./', '/')) || caminho === '/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNetworkFirst = ehNetworkFirst(event.request.url);

  if (isNetworkFirst) {
    // tenta a rede primeiro (pega sempre a versão mais nova do app); cache é só
    // o fallback para quando o celular está sem sinal (ex: dentro da mina).
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((respostaRede) => {
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, respostaRede.clone()); } catch (e) {}
          });
          return respostaRede;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // assets estáticos (ícones, bibliotecas externas): cache-first, já que raramente mudam
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(event.request).then((respostaRede) => {
        caches.open(CACHE_NAME).then((cache) => {
          try { cache.put(event.request, respostaRede.clone()); } catch (e) {}
        });
        return respostaRede;
      });
    })
  );
});
