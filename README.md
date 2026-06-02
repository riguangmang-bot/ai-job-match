# AI求职智能匹配智能体 - Demo

基于「AI求职智能匹配智能体项目设计方案」构建的 Web Demo，纯前端实现，展示四大核心功能模块。

## 快速体验

### 方式一：本地直接打开
```bash
# 直接用浏览器打开 index.html
start index.html   # Windows
open index.html    # macOS
```

### 方式二：部署到 GitHub Pages（推荐，公网可访问）

1. 在 GitHub 创建新仓库，如 `ai-job-match`
2. 推送代码：
```bash
cd ai-job-match
git init
git add .
git commit -m "init: AI求职智能匹配Demo"
git branch -M main
git remote add origin https://github.com/<你的用户名>/ai-job-match.git
git push -u origin main
```
3. 在 GitHub 仓库 → Settings → Pages → Branch 选择 `main` → Save
4. 访问 `https://<你的用户名>.github.io/ai-job-match/`

### 方式三：Netlify 拖拽部署
1. 访问 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 将 `ai-job-match` 文件夹直接拖入页面
3. 自动生成公网 URL（支持自定义域名）

## 功能模块

| 模块 | 说明 |
|------|------|
| 📄 画像构建 | 模拟简历上传与AI自动解析，构建个人求职画像 |
| 🎯 岗位匹配 | 基于多维语义向量的智能匹配，自动排序高适配岗位 |
| 🔬 简历诊断 | 百分制匹配打分 + 四维雷达分析 + 短板精准定位 |
| ✨ 简历优化 | AI生成个性化优化方案，优化前后对比展示 |
| 📈 数据复盘 | 统计数据仪表盘 + 趋势图表 + 操作历史记录 |

## 技术栈

- 纯前端 HTML/CSS/JS（零构建工具依赖）
- ECharts 5 数据可视化
- 响应式设计，适配桌面与平板

## 项目结构

```
ai-job-match/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式
├── js/
│   ├── data.js         # 模拟数据
│   ├── charts.js       # ECharts图表配置
│   └── app.js          # 主逻辑
└── README.md
```

> 💡 **注意：** 此为 Demo 体验版，所有数据为模拟数据，仅供功能展示。正式版需接入大语言模型 API 和向量数据库。
