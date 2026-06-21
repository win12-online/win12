# Docker 测试指南

在本地或 CI/CD 中一致的 Docker 环境中运行 Win12 测试。

## 快速开始

### 在 Docker 中运行所有测试

```bash
docker build -t win12-tests .
docker run --rm win12-tests npm run test:all
```

### 运行特定测试

```bash
# 仅单元测试
docker run --rm win12-tests npm test

# 仅代码检查
docker run --rm win12-tests npm run lint

# 端到端测试（带 web 服务器）
docker run --rm -p 3000:3000 win12-tests bash -c \
  "python3 -m http.server 3000 & sleep 2 && npm run test:e2e"
```

## 使用 docker-compose

### 运行所有测试
```bash
docker-compose run --rm tests
```

### 仅运行单元测试
```bash
docker-compose run --rm test-unit
```

### 仅运行端到端测试
```bash
docker-compose run --rm test-e2e
```

### 运行代码检查
```bash
docker-compose run --rm lint
```

### 交互式 Shell（调试）
```bash
docker-compose run --rm tests bash
```

## Docker 镜像内容

- **Node.js 22** - 最新 LTS 版本
- **Python 3** - 用于 HTTP 服务器
- **Playwright** - 预安装所有浏览器（Chromium、Firefox、WebKit）
- **npm 依赖** - 所有包预装
- **Git & curl** - 用于高级操作

## Docker 测试的优势

✅ **一致性** - 相同的环境（本地、CI、团队成员）  
✅ **隔离性** - 无系统 Node 或 Python 版本冲突  
✅ **速度** - 浏览器已安装，无下载延迟  
✅ **便携性** - 在 macOS、Linux、Windows（使用 Docker Desktop）上运行  
✅ **可重现性** - 每次完全相同的版本  

## 使用 Docker 进行本地开发

### 监视模式（文件变化时自动重新运行）

```bash
docker-compose run --rm -v $(pwd):/app test-unit
```

### 调试端到端测试

```bash
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  win12-tests \
  bash -c "python3 -m http.server 3000 & npm run test:e2e -- --headed"
```

## CI/CD 集成

Docker 镜像在 GitHub Actions 工作流中用于：
- 一致的测试环境
- 预安装的浏览器（比本地下载快）
- 并行测试支持

## 故障排除

### Docker 构建失败

```bash
# 清除 Docker 缓存并重新构建
docker build --no-cache -t win12-tests .
```

### 端口 3000 已被使用

```bash
# 使用不同的端口
docker run -p 3001:3000 ...
```

### 磁盘空间不足

```bash
# 清理 Docker
docker system prune -a
```

### Docker 构建缓慢

首次构建下载 ~500MB 依赖和浏览器。后续构建使用缓存且速度快得多。

## 下一步

1. 本地尝试：`docker-compose run --rm tests`
2. 在 CI/CD 中使用：自动构建和运行
3. 调试问题：`docker-compose run --rm tests bash`
4. 与团队分享："只需运行 `docker-compose run --rm tests`"

---

更多信息见[测试指南](README.md)。
