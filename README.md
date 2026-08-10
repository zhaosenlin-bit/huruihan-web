# 个人网站项目 (my_wed)

> 最后更新：2026-08-10
> 状态：v1.1 已实现 · 文字 Hero + 9 个组件 + Showcase 画廊 · dev server 已跑通
> 类别：个人站
> 部署目标：Cloudflare Pages（沿用 huruihan-web.pages.dev 账号）

## 这是什么？
"我的个人网站"项目的实际代码结症。当前在 **v1.1** 阶段：PRD 推进到 v2.1，已经能跑的本地 dev server，加上了 Showcase 画廊板块。

> 命名说明：文件夹叫 `my_wed`（不是 `my_web`），保留拼写以匹配用户习惯。

## PRD 在哪？
**主版本**：[../personal-site-prd.md](../personal-site-prd.md)（v3 · 2026-08-09 · 含实现状态）

包含：
- 8 个核心问题（身份、目标、能力、作品、学习、风格、边界、验收）
- 4 个执行决策（视觉系统、技术栈、页面结构、部署）
- 实现状态（v1.1 已落地）

## 当前状态

### 已完成
- [x] PRD v1（8 个问题）→ v2（4 个决策）→ v2.1（senlin-c1n 风格升级）
- [x] Next.js 15.5.3 + React 19 + Tailwind 3.4 + TypeScript 5 项目骨架
- [x] 9 个组件：Nav / Hero / About / Skills / Projects / **Showcase** / Learning / Contact / Footer
- [x] 数据集中在 `src/data/content.ts`（4.0 KB）
- [x] 文字 Hero（「胡睿涵」+ 诗意副标 + 12 岁 / 国赛省直 标签）
- [x] 6 个板块（关于 / 能力 / 作品 / **展示** / 学习记录 / 联系）
- [x] 暗色视觉系统沿用 senlin-c1n（`#0A0A0A` + `#DEDBC8` + `#7DD3FC`）
- [x] 4 套字体（Inter / Plus Jakarta Sans / Instrument Serif / Noto Sans SC）
- [x] 视觉精修：`card-lift` / `cta-arrow` / `ai-accent` / `bar-fill` / `fade-up` / `.grain`
- [x] Showcase 画廊：9 张图（3 张奖状 + 3 张三国截图 + 3 张探索宇宙截图）
- [x] Build 通过：3.46 kB / 105 kB First Load JS
- [x] dev server 在 localhost:3000 跑通

### 已撤回（值得记录）
- [x] **球体动画**（R3F + Three.js，2 个 sphere）→ 2026-08-09 实现并通过 build，但用户决定不在主页用，文件已删除
  - 撤回原因：用户偏好极简文字 Hero，不要 3D 装饰
  - 经验：球体 chunk 单独 243 kB 验证了 `dynamic({ ssr: false })` 模式，未来想用可参考 [../../2-concepts/dynamic-import.md](../../2-concepts/dynamic-import.md)
  - 相关依赖（three / @react-three/*）仍装在 node_modules，需要时可直接复用

### 待办
- [ ] 浏览器实测 Hero 字号是否合适（手机 + 电脑）
- [ ] 准备 AI 生成头像（之前说"图片先不做"，现在想补）
- [ ] 图片优化脚本（sharp 批量压 webp + 缩略图），9 张图有几张接近 1.5 MB
- [ ] Showcase 加 IntersectionObserver 滚动渐入
- [ ] daily / 概念卡 / 项目链接从硬编码改成自动同步（读 `5-daily/` `2-concepts/` `1-projects/` 文件夹）
- [ ] 给"探索宇宙"作品做站内详情页
- [ ] 部署到 Cloudflare Pages（沿用 `huruihan-web.pages.dev`，新 Pages 项目 `personal-huruihan-web`）

## 技术栈（沿用 PRD §9）
- Next.js 15.5.3（App Router · TypeScript）
- React 19
- Tailwind CSS 3.4
- ~~React Three Fiber / three.js~~（已撤回，主页不需要）
- ~~@react-three/drei~~（同上）
- Cloudflare Pages（部署目标）
- Git（本地版本管理）

## 怎么跑？

```bash
npm install       # 装依赖
npm run dev       # 开发模式 → http://localhost:3000
npm run build     # 生产 build
npm start         # 跑生产 build
```

部署到 Cloudflare Pages：先在 Cloudflare 控制台连 Git 仓库，build 命令设 `npm run build`，输出目录设 `.next`。

## 项目结构

```
my_wed/
├── README.md                  ← 本文件
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── next-env.d.ts
├── public/
│   ├── favicon.svg
│   └── showcase/              ← 9 张作品/奖状截图
└── src/
    ├── app/
    │   ├── layout.tsx         ← 字体 + dark viewport
    │   ├── page.tsx           ← 9 个组件组合
    │   └── globals.css        ← 含 .ai-accent / .card-lift / .cta-arrow 等
    ├── components/
    │   ├── Nav.tsx            ← 6 个链接 + 锚点跳转
    │   ├── Hero.tsx           ← 文字 Hero（不是球体）
    │   ├── About.tsx          ← bio + 战绩统计卡
    │   ├── Skills.tsx         ← 3 类技能 + 进度条
    │   ├── Projects.tsx       ← 2 个作品卡（探索宇宙 + 三国）
    │   ├── Showcase.tsx       ← 9 张图画廊（3 分组）
    │   ├── Learning.tsx       ← 时间线 + 概念卡
    │   ├── Contact.tsx        ← 3 种认识方式
    │   └── Footer.tsx
    └── data/
        └── content.ts         ← 全部内容数据
```

## 与其他项目的关系
- 主 PRD：[../personal-site-prd.md](../personal-site-prd.md)
- 我的能力：[../../CAPABILITY-MAP.md](../../CAPABILITY-MAP.md)
- 我的简介：[../../0-me/profile.md](../../0-me/profile.md)
- 我的学习记录：[../../5-daily/](../../5-daily/)
- 我的概念卡：[../../2-concepts/](../../2-concepts/)
- 探索宇宙项目：[../project-explore-universe.md](../project-explore-universe.md)
- 错题集（踩过的坑）：[../../7-mistakes/2026-08-09.md](../../7-mistakes/2026-08-09.md)
- 动态导入备忘卡（球体撤回时用上）：[../../2-concepts/dynamic-import.md](../../2-concepts/dynamic-import.md)