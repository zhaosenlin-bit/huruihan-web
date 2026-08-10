// 个人站数据中枢 — 由知识库同步
// 来源：0-me/profile.md, 0-me/goals.md, 0-me/strengths-weaknesses.md,
//       CAPABILITY-MAP.md, 1-projects/project-*.md, 2-concepts/vibe-coding*.md,
//       5-daily/2026-08-*.md
// 最后同步：2026-08-10

export const profile = {
  name: "胡睿涵",
  shortName: "H",
  age: "12 岁 · 即将升入六年级",
  badge: "全国信息素养提升活动 · 国赛省直",
  poeticLine: "用 AI 写代码，用代码解决问题。",
  shortIntro: "一个用 AI 做出东西的小学生，代码在我的脚下一步一步长出来。",
  bio: [
    "我是胡睿涵。喜欢用 AI 编程做能帮到学习和生活的应用。",
    "拿过全国信息素养提升活动国赛资格，做过一个完整的探索宇宙项目，5 天训练营每天写一篇 daily。",
    "现在在做的，是持续打比赛、把 Vibe Coding 用到极致。",
  ],
  quote: "我是森林的学生。",
};

export type SkillItem = { name: string; level: number; note?: string };
export type SkillCategory = {
  category: string;
  poetic: string;
  items: SkillItem[];
};

export const skills: SkillCategory[] = [
  {
    category: "编程语言",
    poetic: "把想法变成代码。",
    items: [
      { name: "Python", level: 3, note: "约 1 年 · 主力" },
      { name: "TypeScript", level: 3, note: "半年 · 主力" },
      { name: "JavaScript", level: 3, note: "半年 · 主力" },
      { name: "HTML / CSS", level: 2, note: "半年 · 在补" },
    ],
  },
  {
    category: "框架与工具",
    poetic: "会用脚手架、能搭能改。",
    items: [
      { name: "Next.js 15 (App Router)", level: 3, note: "探索宇宙 + 个人站" },
      { name: "React 19", level: 3, note: "主力" },
      { name: "React Three Fiber / three.js", level: 2, note: "试过 · 主站暂不启用" },
      { name: "Scrapling", level: 2, note: "Day 4 资料抓取" },
    ],
  },
  {
    category: "AI & Vibe Coding",
    poetic: "和 AI 一起做项目。",
    items: [
      { name: "Codex (Vibe Coding)", level: 4, note: "主学 · 15+ 张验证 prompt" },
      { name: "5 天训练法", level: 3, note: "探索宇宙验证过" },
      { name: "Prompt 设计", level: 3, note: "PRD → 提示词" },
      { name: "Context 准备", level: 3, note: "知识库喂资料" },
      { name: "Acceptance Criteria", level: 2, note: "在学" },
    ],
  },
  {
    category: "部署 & 软能力",
    poetic: "把作品送出去。",
    items: [
      { name: "Cloudflare Pages", level: 3, note: "探索宇宙部署在这" },
      { name: "Git 本地工作流", level: 3, note: "5 天每天 1 commit" },
      { name: "黑客松 / 比赛协作", level: 3, note: "国赛入围" },
      { name: "并行工作 (AI 写时你去做别的)", level: 3, note: "5 天训练核心" },
    ],
  },
];

export type Project = {
  title: string;
  poetic: string;
  description: string;
  tags: string[];
  url?: string;
  status: "完成" | "进行中";
  highlights?: string[];
};

export const projects: Project[] = [
  {
    title: "探索宇宙",
    poetic: "5 天，从一行代码到一份作品。",
    description: "5 天训练营做出来的宇宙探索互动网站：首页 + 3D 探索页 + 行星任务游戏 + 行星详情页，全部 Vibe Coding + Codex 协作完成，已部署上线。",
    tags: ["Next.js 15", "React Three Fiber", "Scrapling", "Cloudflare Pages"],
    url: "https://huruihan-web.pages.dev/",
    status: "完成",
    highlights: [
      "5 天每天 1 次 Git commit (day1 ~ day5)",
      "Vibe Coding 完整流程：PRD → 提示词 → Codex 生成 → 我审查 → 让 AI 改",
      "用 Scrapling 从 NASA 抓行星资料，整理成 3 段有用内容",
    ],
  },
  {
    title: "全国信息素养提升活动",
    poetic: "进入国赛的那一次。",
    description: "2025 年全国信息素养提升活动项目，进入了国赛。完整比赛经历、复盘与路演经验，留在了项目卡里。",
    tags: ["比赛", "国赛入围", "2025"],
    status: "完成",
    highlights: [
      "国赛入围（全国信息素养提升活动）",
      "路演 / 答辩经验",
      "完整流程：报名 → 备赛 → 路演",
    ],
  },
  {
    title: "心理健康 + 科技",
    poetic: "把技术用在'人'的问题上。",
    description: "一个把科技和心理健康结合的项目。学到了怎么用技术解决'人'的问题，不是只做酷炫 demo。",
    tags: ["AI 编程", "心理健康", "应用"],
    status: "完成",
    highlights: [
      "方向：科技 + 心理健康",
      "学到：怎么用技术解决'人'的问题",
    ],
  },
  {
    title: "三国介绍网站",
    poetic: "把一千八百年前的故事，变成能点开看的东西。",
    description: "三国人物 / 战事 / 时间线介绍网站。带过五关斩六将小游戏 + 三国时间线 + 桌面版战斗模块，本地预览版，部署后会更新。",
    tags: ["三国", "历史介绍", "互动"],
    url: "http://127.0.0.1:5180/#game",
    status: "完成",
    highlights: [
      "首页：星河主题 · 三国时间线 · 名场面",
      "过五关斩六将：桌版过关小游戏",
      "时间线：东汉末年 → 三国鼎立的 96 年大事记",
    ],
  },
];

export type ConceptCard = {
  name: string;
  poetic: string;
  desc: string;
  points?: string[];
};

export const concepts: ConceptCard[] = [
  {
    name: "Vibe Coding",
    poetic: "用自然语言 + AI 协作做项目。",
    desc: "把'我想做什么'写清楚，让 AI 能一次给我差不多的东西。",
    points: [
      "Day 1：定题 + 计划",
      "Day 2：核心交互 / 3D",
      "Day 3：玩法 / 核心功能",
      "Day 4：内容 + 风格 + 衔接",
      "Day 5：收尾 + 发布（README / 截图 / 录屏）",
      "Codex 写代码时，你不要发呆 — 同时去做查资料 / 挑图片",
    ],
  },
  {
    name: "Prompt 设计",
    poetic: "给 AI 的任务说明书。",
    desc: "把'我想做什么'写清楚，让 AI 能一次给我差不多的东西。",
    points: [
      "目标明确",
      "上下文给够",
      "验收标准具体",
      "不和 AI 绕弯",
    ],
  },
];

export type PathPhase = {
  label: string;
  title: string;
  poetic: string;
  items: string[];
};

export const path: PathPhase[] = [
  {
    label: "现在",
    title: "短期（这个学期 / 3 个月）",
    poetic: "把基础打牢。",
    items: [
      "学完 Vibe Coding 基础，能独立做可交付小项目",
      "完成个人站 PRD → 上线",
      "每周至少 5 篇 daily",
      "把三个比赛项目卡写完整",
      "至少 10 张概念卡",
    ],
  },
  {
    label: "接下来",
    title: "中期（这一年）",
    poetic: "稳定输出。",
    items: [
      "持续参加 2-3 次黑客松 / 企业 AI 编程比赛",
      "做 1-2 个学习 / 生活助手应用（用 AI 解决真实问题）",
      "文化课稳步提升（不一定要拔尖，但要跟得上）",
      "数据结构与算法基础",
    ],
  },
  {
    label: "再远一点",
    title: "长期（3 年）",
    poetic: "一个人当一支队伍。",
    items: [
      "成为'AI 编程'方向的硬核选手",
      "能独立做完整应用，包括前端、后端、AI 集成",
      "比赛有稳定成绩（不只是入围）",
      "用 Vibe Coding 把编程做成'杠杆'：一个人当一支队伍",
    ],
  },
];

export const learning = {
  poetic: "边做边学，一天一步。",
  recentDailies: [
    { date: "2026-08-10", title: "上午视觉系统打磨 + 下午 9 张图做成作品展示（Showcase）" },
    { date: "2026-08-09", title: "上午 PRD v2.1 senlin-c1n + 下午完整实现（含 3D 球体撤回）" },
    { date: "2026-08-08", title: "上午拆解老师站 + 下午 PRD v2 + 跑 Codex 检查" },
    { date: "2026-08-07", title: "建知识库 + 上午 PRD + 下午拓展探索宇宙项目" },
  ],
  conceptCards: [
    { name: "Vibe Coding", desc: "用自然语言 + AI 协作做项目", href: "#concepts" },
    { name: "Prompt", desc: "给 AI 的任务说明书", href: "#concepts" },
    { name: "Context", desc: "AI 做任务需要知道的背景", href: "#concepts" },
    { name: "Acceptance Criteria", desc: "判断任务完成的硬标准", href: "#concepts" },
    { name: "5 天训练法", desc: "每天 1 件事，5 天出一个作品", href: "#concepts" },
    { name: "Scrapling", desc: "抓网页资料的 Python 工具", href: "#concepts" },
  ],
};

export type ShowcaseItem = {
  src: string;
  title: string;
  desc: string;
  span?: 1 | 2;
};

export type ShowcaseGroup = {
  label: string;
  poetic: string;
  items: ShowcaseItem[];
  galleryType?: "grid" | "carousel";
};

export const showcase: ShowcaseGroup[] = [
  {
    label: "奖状",
    poetic: "把比赛当成一次作品的答谢。",
    items: [
      { src: "/showcase/01-award-presentation.jpg", title: "展示表达", desc: "第一名", span: 1 },
      { src: "/showcase/02-award-art.jpg", title: "艺术美术", desc: "第二名", span: 1 },
      { src: "/showcase/03-award-overall.jpg", title: "综合评价", desc: "一等奖", span: 1 },
    ],
  },
  {
    label: "三国介绍网站",
    poetic: "一千八百年，点开就能看完。",
    galleryType: "carousel",
    items: [
      { src: "/works/sangok/01-hero.png", title: "首页 · 星河", desc: "一壶浊酒喜相逢", span: 1 },
      { src: "/works/sangok/03-battle.png", title: "汉中之战", desc: "BATTLE MODE · 桌面版战斗", span: 1 },
      { src: "/works/sangok/02-timeline.png", title: "三国时间线", desc: "重要事件一览", span: 1 },
    ],
  },
  {
    label: "探索宇宙",
    poetic: "看向 4.2 光年外的邻居。",
    items: [
      { src: "/showcase/07-explore-universe-hero.jpg", title: "首页 · BEYOND THE VEIL", desc: "宣展页", span: 1 },
      { src: "/showcase/08-explore-universe-system.jpg", title: "太阳系", desc: "一框八行星同框", span: 1 },
      { src: "/showcase/09-explore-universe-3d.jpg", title: "3D 探索", desc: "滚动 / 拖动探索", span: 1 },
    ],
  },
];

export const contact = {
  poetic: "想聊点什么，直接说。",
  intro: "暂时不开留言板。",
  methods: [
    "想认识我，看作品比语言更直接 — 探索宇宙 / 三国 / 个人站",
    "想聊班课 / 项目合作，找我的老师（森林 · senlin-c1n.pages.dev）",
    "想看更多日常，看我的探索宇宙项目：huruihan-web.pages.dev",
  ],
};
