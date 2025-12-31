# 五行关系图谱 | Wu Xing Explorer

纯前端静态 WebApp（无依赖、无需构建），用于科普/学习：

- 五行 **相生 / 相克**
- **子母**（生我/我生）
- **所胜 / 所不胜**（我克/克我）
- 失衡概念：**相乘（倍克）/ 相侮（反克）/ 母子相及**
- 关系查询器 + 失衡模拟器（透明规则，可解释）

> 教学/科普用途：不提供医疗诊断或处方建议。

## 本地运行（任选其一）

### 方式 A：直接打开
双击 `index.html` 即可（现代浏览器支持 ES Modules）。

### 方式 B：本地静态服务器（推荐）
```bash
# Python 3
python3 -m http.server 5173
# 然后访问 http://localhost:5173
```

## 部署到 Vercel（推荐）

1. 把这个仓库推到 GitHub
2. Vercel → Import Project → 选择该仓库
3. Framework 选择 **Other**
4. Build Command 留空
5. Output Directory 选择仓库根目录（默认即可）
6. Deploy

本仓库包含 `vercel.json`，确保 SPA 路由（`#/...`）与静态资源工作正常。

## 参考素材（可选下载）

本项目主图为本仓库自绘 SVG（便于做“图层开关”）。你也可以自行替换为 Wikimedia Commons 的五行图（注意许可）：

- `File:Wuxing.svg`（作者 Own work，页面含许可信息）: https://commons.wikimedia.org/wiki/File:Wuxing.svg
- `File:Wuxing_en.svg`（CC BY-SA 3.0）: https://commons.wikimedia.org/wiki/File:Wuxing_en.svg
- `File:FiveElementsCycleBalanceImbalance_02_plain.svg`（CC0 公共领域）: https://commons.wikimedia.org/wiki/File:FiveElementsCycleBalanceImbalance_02_plain.svg

> 如果你把这些文件打包进仓库，请在 About/Attribution 里明确写清：文件名、作者、许可、链接、是否修改。

## 目录结构

- `index.html` 入口
- `styles.css` 样式
- `app.js` 路由 + UI
- `data.js` 五行关系数据 + 推导规则
- `i18n.js` 中英切换
- `assets/` favicon 等

## 许可

代码：MIT（见 `LICENSE`）。
