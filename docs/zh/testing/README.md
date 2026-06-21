# 测试指南

Win12 Online 的自动化测试完整指南。

## 📚 测试文档

### 快速参考
- **[快速入门](QUICKSTART.md)** - 5分钟设置和基本命令
- **[单元测试](UNIT-TESTS.md)** - 编写和运行单元测试  
- **[端到端测试](E2E-TESTS.md)** - 端到端测试指南
- **[Docker 测试](DOCKER.md)** - 使用 Docker 容器进行测试

## 🎯 测试概述

Win12 使用三层测试方法：

### 1. 单元测试（快速 - ~2 秒）
- 测试单个函数和模块
- 使用 Vitest + jsdom
- 焦点：逻辑正确性、边界情况
- 位置：`tests/unit/`

**示例覆盖范围：**
- i18n 翻译系统
- 窗口管理器操作
- 计算器逻辑
- 语言规范化

### 2. 代码检查（代码质量 - ~17 秒）
- 检查代码风格和质量
- 使用 ESLint
- 焦点：最佳实践、一致性
- 运行于：测试文件和新代码

**检查项：**
- 无未使用的变量
- 一致的代码风格
- 安全最佳实践
- 错误处理

### 3. 端到端测试（完整浏览器 - 仅本地）
- 测试完整用户工作流
- 使用 Playwright（Chromium、Firefox、WebKit）
- 焦点：用户体验、集成
- **注意：** 仅在本地运行，不在 GitHub Actions 中运行
- 命令：`docker-compose run --rm test-e2e`

**测试的工作流：**
- 应用启动和关闭
- 窗口操作（拖动、调整大小等）
- 文件导航
- 语言切换
- 终端操作

## 🚀 快速开始

5 分钟内开始测试：

```bash
# 安装依赖
npm install
npx playwright install

# 运行所有本地测试
npm run test:all

# 或运行特定测试
npm test              # 仅单元测试
npm run lint         # 仅代码检查
npm run test:e2e     # 端到端测试（需要 web 服务器）
```

## 📊 CI/CD 中的测试状态

**GitHub Actions（阻止检查）：**
- ✅ 代码检查 - 必须通过才能合并
- ✅ 单元测试 - 必须通过才能合并
- ℹ️ 端到端测试 - 不在 CI 中运行（改为本地运行）

**通过 CI/CD 的时间：** ~30-40 秒

## 🐳 Docker 测试

在 Docker 中运行完整测试套件：

```bash
# Docker 中的所有测试
docker-compose run --rm tests

# 特定测试
docker-compose run --rm test-unit
docker-compose run --rm test-e2e
docker-compose run --rm lint
```

详见 [Docker 测试指南](DOCKER.md)。

## 📖 详细指南

选择你的主题：

- **第一次测试？** → [快速入门](QUICKSTART.md)
- **编写单元测试？** → [单元测试指南](UNIT-TESTS.md)
- **端到端测试工作流？** → [端到端测试指南](E2E-TESTS.md)
- **Docker 设置？** → [Docker 测试](DOCKER.md)

## 🔍 常见任务

### 提交代码前
```bash
npm run test:all
```

### 为新功能编写测试
1. 创建 `tests/unit/feature.test.js`
2. 遵循现有测试中的模式
3. 运行：`npm test -- tests/unit/feature.test.js`
4. 确保通过代码检查：`npm run lint:fix`

### 调试失败的测试
```bash
npm test -- --watch          # 单元测试监视模式
npm run test:ui              # 交互式 UI
npm run test:e2e -- --headed # 端到端测试显示浏览器
```

### 检查代码覆盖率
```bash
npm run test:coverage
open coverage/index.html
```

## 🛠️ 测试命令参考

| 命令 | 目的 | 时间 |
|------|------|------|
| `npm test` | 运行单元测试 | ~2s |
| `npm test -- --watch` | 监视模式 | - |
| `npm run test:ui` | 交互式 UI | - |
| `npm run test:coverage` | 覆盖率报告 | ~3s |
| `npm run lint` | 代码检查 | ~17s |
| `npm run lint:fix` | 自动修复代码风格 | ~17s |
| `npm run test:e2e` | 端到端测试（本地） | ~3-5s |
| `npm run test:all` | 所有测试 | ~20s |

## ❓ 常见问题

**问：推送前需要运行端到端测试吗？**
答：对于重要功能推荐，但不是必需的。使用 `npm run test:e2e`（需要手动 web 服务器）或 `docker-compose run --rm test-e2e` 在本地运行。

**问：为什么端到端测试不在 GitHub Actions 中？**
答：端到端测试速度慢且需要外部设置。更好的做法是在推送前在本地运行。CI/CD 专注于快速单元测试 + 代码检查。

**问：如何修复失败的测试？**
答：检查错误消息，查看测试代码，修复实现，然后重新运行测试。

**问：我可以跳过某些测试吗？**
答：对于 Vitest 使用 `.skip`：`it.skip('test name', () => {})` 或 `test.skip()`。但在提交前要修复它们！

## 🔗 资源

- [Vitest 文档](https://vitest.dev)
- [Playwright 文档](https://playwright.dev)
- [ESLint 文档](https://eslint.org)
- [Jest 匹配器](https://jestjs.io/docs/expect)

## 📝 下一步

1. ✅ [阅读快速入门](QUICKSTART.md) - 5 分钟
2. ✅ 运行 `npm run test:all` - 验证设置
3. ✅ 在 [单元测试指南](UNIT-TESTS.md) 中查看测试模式
4. ✅ 为新功能编写测试
5. ✅ 推送代码！

---

**黄金法则：** 如果是面向用户的功能，就应该有测试。🎯
