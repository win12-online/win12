# 快速入门

5 分钟内开始使用 Win12 自动化测试。

## 安装（一次性设置）

```bash
# 1. 安装 Node.js 依赖
npm install

# 2. 安装 Playwright 浏览器（用于端到端测试）
npx playwright install

# 完成！你已准备好运行测试。
```

## 本地运行测试

### ✅ 所有测试（提交前推荐）
```bash
npm run test:all
```

### ✅ 仅单元测试  
```bash
npm test
```

### ✅ 单元测试监视模式（文件变化时自动重新运行）
```bash
npm test -- --watch
```

### ℹ️ 端到端测试（仅本地 - 需要 web 服务器）
```bash
# 终端 1：启动 web 服务器
python -m http.server 3000

# 终端 2：在另一个终端运行测试
npm run test:e2e
```

**或使用 Docker：**
```bash
docker-compose run --rm test-e2e
```

### ℹ️ 端到端测试显示浏览器
```bash
npm run test:e2e -- --headed
```

### 🎨 交互式测试仪表板
```bash
npm run test:ui
```

### 📊 代码覆盖率报告
```bash
npm run test:coverage
open coverage/index.html  # 查看 HTML 报告
```

## 代码质量

### 检查代码风格
```bash
npm run lint
```

### 自动修复代码风格问题
```bash
npm run lint:fix
```

## 测试内容

### 单元测试（快速 - ~2 秒）
- 翻译系统（i18n 键、查找、语言切换）
- 窗口管理器（定位、调整大小、状态管理）
- 语言规范化（浏览器代码到应用代码转换）
- 翻译完整性检查

**覆盖率：** 2 个测试套件中的 28 个测试

### 代码检查（~17 秒）
- 代码质量和风格一致性
- 无未使用的变量
- 适当的错误处理
- 安全最佳实践

### 端到端测试（仅本地 - ~3-5 秒/浏览器）
- 桌面加载和正确显示
- 应用打开/关闭和显示窗口
- 窗口操作（拖动、调整大小、最大化、最小化）
- 文件浏览器导航
- 语言切换和 UI 重新加载
- 终端功能
- 任务栏和系统托盘

## 提交代码前

```bash
# 在 git commit 前运行此命令
npm run test:all

# 如果通过，你可以提交！
# 如果失败，修复问题后重试。
```

## GitHub Actions（CI/CD）

推送或创建 PR 时，GitHub Actions 自动运行：
1. ✅ **代码检查**（必须通过）
2. ✅ **单元测试**（必须通过）
3. ⏱️ **耗时：** ~30-40 秒

**注意：** 端到端测试不在 GitHub Actions 中运行。推送前使用 `npm run test:e2e` 在本地运行。

## 常用命令

| 命令 | 目的 | 耗时 |
|------|------|------|
| `npm test` | 运行单元测试 | ~2s |
| `npm test -- --watch` | 文件变化时自动重新运行 | - |
| `npm run test:ui` | 交互式测试仪表板 | - |
| `npm run test:e2e` | 端到端测试（本地设置） | ~3-5s |
| `npm run test:e2e -- --headed` | 测试时显示浏览器 | ~3-5s |
| `npm run test:coverage` | 覆盖率报告 | ~3s |
| `npm run lint` | 代码风格检查 | ~17s |
| `npm run lint:fix` | 自动修复代码风格 | ~17s |
| `npm run test:all` | 所有本地测试 | ~20s |

## 编写你的第一个测试

### 示例：测试翻译键

创建 `tests/unit/my-feature.test.js`：

```javascript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should translate correctly', () => {
    const translations = {
      en: { 'my.key': 'Hello World' },
      zh_CN: { 'my.key': '你好世界' }
    };

    expect(translations.en['my.key']).toBe('Hello World');
    expect(translations.zh_CN['my.key']).toBe('你好世界');
  });
});
```

运行它：
```bash
npm test -- tests/unit/my-feature.test.js
```

## 故障排除

### "command not found: npm"
→ 从 https://nodejs.org 安装 Node.js

### "timeout waiting for selector"（端到端测试）
→ 应用加载太慢；检查服务器是否正在运行和可访问

### "ESLint: unused variable"
→ 运行 `npm run lint:fix` 自动修复，或删除未使用的变量

### 测试在本地通过但在 CI 中失败
→ 最常见的原因：计时问题。使用显式等待而不是延迟：
```javascript
await page.waitForSelector('.element');  // 好的
// 不要使用：await page.waitForTimeout(1000);  // 不好
```

### "Python command not found"（启动 web 服务器）
→ 从 https://python.org 安装 Python 3 或使用 Docker：`docker-compose run --rm test-e2e`

## 下一步

1. ✅ 运行 `npm run test:all` 验证设置
2. 📖 阅读[测试指南](README.md)了解详细模式
3. 📖 阅读[单元测试指南](UNIT-TESTS.md)了解测试模式
4. ✍️ 为新功能编写测试
5. 📊 检查覆盖率：`npm run test:coverage`
6. 🚀 自信地提交！

## 疑问？

- **详细测试模式** → 见[单元测试指南](UNIT-TESTS.md)
- **端到端测试详情** → 见[端到端测试指南](E2E-TESTS.md)
- **Docker 设置** → 见[Docker 测试指南](DOCKER.md)
- **Vitest 文档** → https://vitest.dev
- **Playwright 文档** → https://playwright.dev
- **ESLint 文档** → https://eslint.org

---

**黄金法则：** 如果是面向用户的功能，就应该有测试。🎯
