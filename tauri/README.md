# tauri
Win12的tauri框架目录

## 关于调试

### 启动调试
调试需要2个终端
在第一个终端中使用此命令启动Vite
```bash
npm run dev
```
在第二个终端中使用此命令启动Tarui
```bash
npm run tauri dev
```

如开发者已开启代理，可能会干扰调试，建议使用以下命令启动
```bash
 env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy npm run tauri dev
 ```