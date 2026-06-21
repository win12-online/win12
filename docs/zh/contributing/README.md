# 贡献指南

感谢你为 Win12 Online 做出贡献！本指南将帮助你开始。

## 快速开始

1. **Fork** 仓库
2. **克隆** 你的 fork 到本地
3. **创建分支** 用于你的功能：`git checkout -b feature/my-feature`
4. **做出你的更改**
5. **测试你的更改** - 见[测试指南](../testing/)
6. **提交** 你的更改
7. **推送** 到你的 fork
8. **创建 Pull Request**

## 测试要求

**提交 PR 前，确保所有测试通过：**

```bash
# 运行所有测试
npm run test:all

# 包括：
# - 单元测试（必须通过 ✅）
# - 代码检查（必须通过 ✅）
# - 端到端测试（推荐本地运行，CI 中不需要）
```

### 针对新功能

添加新功能时：

1. **先编写测试**（推荐 TDD 方法）
2. **实现功能**
3. **确保所有测试通过**
4. **运行代码检查：**
   ```bash
   npm run lint:fix
   ```
5. **一起提交测试和实现**

### 测试指南

- ✅ **单元测试** - 用于逻辑、函数、模块
- ✅ **端到端测试** - 用于用户工作流（推送前在本地运行）
- ✅ **代码检查** - 代码必须通过 ESLint 检查
- ❌ **不要跳过测试** - 仅在有阻止问题时使用 `.skip`

**测试覆盖率目标：**
- 语句：50%+
- 分支：50%+
- 函数：50%+
- 行：50%+

见[测试指南](../testing/QUICKSTART.md)了解命令。

## 代码质量

### 代码检查

```bash
# 检查代码风格
npm run lint

# 自动修复大多数问题
npm run lint:fix
```

### 提交信息

保持提交信息清晰和描述性：

```
feat: 添加新功能
fix: 修复组件中的错误
docs: 更新文档
refactor: 改进代码质量
test: 添加测试覆盖
```

## Pull Request 检查清单

提交 PR 前：

- [ ] 测试在本地通过：`npm run test:all`
- [ ] 代码检查通过：`npm run lint`
- [ ] 提交信息清晰
- [ ] 更改专注于一个功能/修复
- [ ] 如果需要更新文档

## CI/CD 管道

推送时，GitHub Actions 自动检查：

| 检查 | 必须通过 | 耗时 |
|------|---------|------|
| 代码检查 | ✅ 是 | ~17s |
| 单元测试 | ✅ 是 | ~20s |
| 端到端测试 | ℹ️ 信息 | （仅本地） |

**总 CI/CD 时间：** ~30-40 秒

如果任何检查失败：
1. 查看错误消息
2. 在本地修复问题
3. 再次推送 - CI 将自动重新运行

## 使用 Docker

为了获得一致的开发环境：

```bash
# 在 Docker 中运行所有测试
docker-compose run --rm tests

# 或特定测试
docker-compose run --rm test-unit
docker-compose run --rm test-e2e
docker-compose run --rm lint
```

详见[Docker 测试指南](../testing/DOCKER.md)。

## 项目结构

```
win12/
├── desktop.html          # 主应用
├── desktop.js            # 应用逻辑
├── tests/
│   ├── unit/            # 单元测试
│   └── e2e/             # 端到端测试
├── module/              # JavaScript 模块
├── .github/workflows/   # CI/CD 管道
├── docs/                # 文档
└── docs/
    ├── en/testing/      # 英文测试文档
    └── zh/testing/      # 中文测试文档
```

## 常见问题

### "测试在本地失败但在 CI 中通过"
→ 最常见的是：计时问题。使用显式等待，不要使用延迟。

### "我添加了新的面向用户的字符串但没有编写测试"
→ 所有面向用户的功能都应该有测试。见[测试指南](../testing/)。

### "代码检查失败"
→ 运行 `npm run lint:fix` 自动修复大多数问题。

### "端到端测试失败"
→ 端到端测试需要手动设置。使用 `npm run test:e2e` 在本地运行（在另一个终端运行 `python -m http.server 3000`），或使用 Docker：`docker-compose run --rm test-e2e`。

## 疑问？

- **测试帮助** → [测试快速入门](../testing/QUICKSTART.md)
- **Docker 帮助** → [Docker 指南](../testing/DOCKER.md)
- **代码模式** → 见 `tests/` 文件夹中的现有代码
- **问题提问** → 在 GitHub 上创建问题

## 行为准则

我们有一份[行为准则](../../CODE_OF_CONDUCT.md)。请在所有交互中遵循它。

---

**感谢你的贡献！** 🙏

我们感谢你改进 Win12 Online 的努力。编码愉快！🚀
