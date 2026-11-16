let dynamic = [
  'api.github.com',
  'tjy-gitnub.github.io/win12-theme',
  'win12server.freehk.svipss.top',
  'assets.msn.cn',
];

const V_TTL = 30 * 60 * 1000;
const clientV = new Map();
const vNegative = new Map();

function getV(url) {
  try {
    return new URL(url).searchParams.get('v');
  } catch (e) {
    return null;
  }
}

function markV(clientId, v) {
  if (!clientId || v == null) return;
  clientV.set(clientId, { v, exp: Date.now() + V_TTL });
}

function getClientVCached(clientId) {
  if (!clientId) return null;
  const rec = clientV.get(clientId);
  if (!rec) return null;
  if (Date.now() > rec.exp) {
    clientV.delete(clientId);
    return null;
  }
  return rec.v;
}

async function getClientVAsync(clientId) {
  if (!clientId) return null;
  const cached = getClientVCached(clientId);
  if (cached !== null) return cached;
  const until = vNegative.get(clientId);
  if (until && Date.now() < until) return null;
  try {
    const c = await clients.get(clientId);
    if (c) {
      const v = getV(c.url);
      if (v !== null) {
        markV(clientId, v);
        vNegative.delete(clientId);
        return v;
      }
    }
  } catch (e) {}
  vNegative.set(clientId, Date.now() + 5000);
  return null;
}

async function getParentVAsync(clientId) {
  if (!clientId) return null;
  try {
    const c = await clients.get(clientId);
    if (c) {
      const v = getV(c.url);
      if (v !== null) markV(clientId, v);
      else clientV.delete(clientId);
      return v;
    }
  } catch (e) {}
  return getClientVCached(clientId);
}

function sweepV() {
  const now = Date.now();
  for (const [id, rec] of clientV) {
    if (now > rec.exp) clientV.delete(id);
  }
  for (const [id, until] of vNegative) {
    if (now > until) vNegative.delete(id);
  }
}

this.addEventListener('install', function (event) {
  self.skipWaiting();
});

this.addEventListener('fetch', function (event) {
  if (!/^https?:$/.test(new URL(event.request.url).protocol)) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const reqUrl = event.request.url;
      const isSameOrigin = new URL(reqUrl).origin === self.location.origin;
      const isNavigation = event.request.mode === 'navigate';
      const ownV = getV(reqUrl);

      const parentV = isNavigation
        ? await getParentVAsync(event.clientId)
        : await getClientVAsync(event.clientId);

      if (isNavigation && event.resultingClientId && isSameOrigin) {
        const newV = ownV !== null ? ownV : parentV;
        if (newV !== null) markV(event.resultingClientId, newV);
      }

      if (isNavigation && isSameOrigin && parentV !== null && ownV === null) {
        const u = new URL(reqUrl);
        u.searchParams.set('v', parentV);
        return Response.redirect(u.toString(), 302);
      }

      const inDev = ownV === 'dev' || parentV === 'dev';
      if (inDev && isSameOrigin) {
        return fetch(event.request, { cache: 'no-store' });
      }

      return caches.match(event.request).then((res) => {
        let fl = false;
        dynamic.forEach((d) => {
          if (event.request.url.indexOf(d) > 0) {
            fl = true;
            return;
          }
        });
        if (fl) {
          console.log('动态请求', event.request.url);
          return fetch(event.request);
        }
        return res && res.ok
          ? res
          : fetch(event.request)
              .then((responese) => {
                if (!responese.ok) return responese;
                const responeseClone = responese.clone();
                return caches
                  .open('def')
                  .then((cache) => {
                    console.log('下载数据', responeseClone.url);
                    return cache.put(event.request, responeseClone);
                  })
                  .catch((err) => {
                    console.log(err);
                  })
                  .then(() => responese);
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
      });
    })(),
  );
});
const cacheNames = ['def'];
// 更新缓存时需要保留的大体积静态资源（很少变动，重下代价高）。
//
// 原实现有两个 bug，导致这五项里有四项**照样被删**：
//   1. 写死了 /win12/ 前缀。GitHub Pages 部署在 /win12/ 下，但 wrangler.jsonc 把整个仓库
//      挂在 Worker 根路径，index.html 也指向组织根域 —— 那些部署下五项全部匹配不上，
//      于是每次 activate 都会清空整个缓存（img/ 2.8MB + fonts/ 344KB + jQuery + 图标字体）。
//   2. 匹配用的是 RegExp(前缀 + '\\S+')，要求前缀**后面还得有字符**。
//      对 jq.min.js、bootstrap-icons.css 这两个精确文件名而言，后面什么都没有，
//      所以即使在 /win12/ 部署下也永远匹配不上。
//
// 改为按路径片段匹配，与部署基路径无关。
let nochanges = [
  '/fonts/',
  '/img/',
  '/apps/icons/',
  '/scripts/jq.min.js',
  '/bootstrap-icons.css',
];

/** 该 URL 是否属于「更新时保留」的资源 */
function isProtected(url) {
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch (e) {
    return false;
  }
  return nochanges.some(function (seg) {
    return pathname.indexOf(seg) !== -1;
  });
}
let flag = false;

function update(force = false) {
  return caches.keys().then((keys) => {
    if (!keys.includes('def')) return;
    return caches.open('def').then((cc) => {
      return cc.keys().then((keys) => {
        return Promise.all(
          keys.map((k) => {
            if (force || !isProtected(k.url)) {
              console.log('删除数据', k.url);
              return cc.delete(k);
            }
          }),
        );
      });
    });
  });
}

this.addEventListener('message', function (e) {
  if (e.data && e.data.head == 'update') {
    const updating = update(Boolean(e.data.force));
    if (typeof e.waitUntil == 'function') e.waitUntil(updating);
  }
});
this.addEventListener('activate', function (event) {
  sweepV();
  event.waitUntil(clients.claim());
  event.waitUntil(update(false));
});
