let dymanic = [
  'api.github.com',
  'tjy-gitnub.github.io/win12-theme',
  'win12server.freehk.svipss.top',
  'assets.msn.cn'
]
this.addEventListener('fetch', function (event) {
  if (!/^https?:$/.test(new URL(event.request.url).protocol)) return
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then(res => {
      let fl = false;
      dymanic.forEach(d => {
        if (event.request.url.indexOf(d) > 0) {
          fl = true;
          return;
        }
      });
      if (fl) {
        console.log('动态请求', event.request.url);
        return fetch(event.request);
      }
      return (res && res.ok) ? res :
        fetch(event.request)
          .then(responese => {
            if (!responese.ok) return responese;
            const responeseClone = responese.clone();
            return caches.open('def').then(cache => {
              console.log('下载数据', responeseClone.url);
              return cache.put(event.request, responeseClone);
            }).catch(err => {
              console.log(err);
            }).then(() => responese);
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
    })
  )
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
]

/** 该 URL 是否属于「更新时保留」的资源 */
function isProtected(url) {
  let pathname;
  try { pathname = new URL(url).pathname; } catch (e) { return false; }
  return nochanges.some(function (seg) { return pathname.indexOf(seg) !== -1; });
}
let flag = false;

function update(force = false) {
  return caches.keys().then(keys => {
    if (!keys.includes('def')) return;
    return caches.open('def').then(cc => {
      return cc.keys().then(keys => {
        return Promise.all(keys.map(k => {
          if (force || !isProtected(k.url)) {
            console.log('删除数据', k.url);
            return cc.delete(k);
          }
        }));
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
  event.waitUntil(update(false));
});

// let dongtai=[
//   'api.github.com',
//   'tjy-gitnub.github.io/win12-theme',
//   'win12server.freehk.svipss.top',
//   'assets.msn.cn'
// ]
// this.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request).then(res => {
//       let fl=false;
//       dongtai.forEach(d=>{
//         if(event.request.url.indexOf(d)>0){
//           fl=true;
//           return;
//         }
//       });
//       if(fl){console.log('动态请求',event.request.url);return fetch(event.request);}
//       return res ||
//         fetch(event.request)
//           .then(responese => {
//             // console.log(event.request);
//             const responeseClone = responese.clone();
//             caches.open('def').then(cache => {
//               console.log('下载数据', responeseClone.url);
//               cache.put(event.request, responeseClone);
//             })
//             return responese;
//           })
//           .catch(err => {
//             console.log(err);
//           });
//     })
//   )
// });
// const cacheNames = ['def'];
// let nochanges = [
//   '/win12/fonts/',
//   '/win12/img/',
//   '/win12/apps/icons/',
//   '/win12/jq.min.js',
//   '/win12/bootstrap-icons.css',
// ]
// let flag = false;
// this.addEventListener('activate', function (event) {
//   flag = true;
//   console.log('开始更新');
//   event.waitUntil(
//     caches.keys().then(keys => {
//       if (keys.includes('def')) {
//         caches.open('def').then(cc => {
//           cc.keys().then(key => {
//             key.forEach(k => {
//               let fl = true;
//               nochanges.forEach(fi => {
//                 if (RegExp(fi + '\\S+').test(k.url)) {
//                   fl = false;
//                   return;
//                 }
//               });
//               if (fl) {
//                 console.log('删除数据', k.url);
//                 return cc.delete(k);
//               }
//             });
//           })
//         })
//       }
//     })
//   );
//   event.waitUntil(
//     caches.open('def').then(function (cache) {
//       return cache.addAll([
//         'bg-dark.svg'
//       ]);
//     })
//   );
// });
// this.addEventListener('message', function (e) {
//   if (e.data.head == 'is_update') {
//     if (flag) {
//       e.source.postMessage({
//         head: 'update'
//       });
//       flag = false;
//     }
//   }
// });
