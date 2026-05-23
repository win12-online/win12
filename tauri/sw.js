let dymanic = [
  'api.github.com',
  'tjy-gitnub.github.io/win12-theme',
  'win12server.freehk.svipss.top',
  'assets.msn.cn'
]
this.addEventListener('fetch', function (event) {
  if (!/^https?:$/.test(new URL(event.request.url).protocol)) return

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
      return res ||
        fetch(event.request)
          .then(responese => {
            const responeseClone = responese.clone();
            caches.open('def').then(cache => {
              console.log('下载数据', responeseClone.url);
              cache.put(event.request, responeseClone);
            })
            return responese;
          })
          .catch(err => {
            console.log(err);
          });
    })
  )
});
const cacheNames = ['def'];
let nochanges = [
  '/win12/fonts/',
  '/win12/img/',
  '/win12/apps/icons/',
  '/win12/scripts/jq.min.js',
  '/win12/bootstrap-icons.css',
]
let flag = false;

function update(force = false) {
  caches.keys().then(keys => {
    if (keys.includes('def')) {
      caches.open('def').then(cc => {
        cc.keys().then(key => {
          key.forEach(k => {
            let fl = true;
            if (force) {
              console.log('删除数据', k.url);
              return cc.delete(k);
            }
            nochanges.forEach(fi => {
              if (RegExp(fi + '\\S+').test(k.url)) {
                fl = false;
                return;
              }
            });
            if (fl) {
              console.log('删除数据', k.url);
              return cc.delete(k);
            }
          });
        });
      });
    }
  });
}


this.addEventListener('message', function (e) {
  if (e.data.head == 'update') {
    if(e.data.force)update(true);
    else update();
  }
});
this.addEventListener('activate', update);

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
