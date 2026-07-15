export type Planet = {
  id: string;
  name: string;
  tag: string;
  meta: string;
  excerpt: string;
  image: string;
  href: string;
  facts: string[];
  color: string;
};

export type Sun = {
  id: "sun";
  name: string;
  tag: string;
  meta: string;
  excerpt: string;
  image: string;
  href: string;
  facts: string[];
  color: string;
};

export const SUN_NAME_ZH = "太阳";
export const PLANET_NAME_ZH: Record<string, string> = {
  mercury: "水星",
  venus: "金星",
  earth: "地球",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
  uranus: "天王星",
  neptune: "海王星",
};

export const sun: Sun = {
  id: "sun",
  name: SUN_NAME_ZH,
  tag: "我们的恒星",
  meta: "一颗 G2V 型主序星，年龄约 46 亿年，距离地球约 1 AU。",
  excerpt:
    "太阳占据了太阳系总质量的 99.86%，以稳定的引力维系着行星、卫星、小天体与彗星的秩序。",
  image: "/planets/sun.jpg",
  href: "https://science.nasa.gov/sun/",
  facts: [
    "表面温度约 5,500 ℃，核心温度约 1,500 万 ℃。",
    "每秒约有 400 万吨物质转化为能量。",
    "阳光从太阳到达地球约需 8 分 20 秒。",
  ],
  color: "#fb923c",
};

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "水星",
    tag: "逐日信使",
    meta: "最小、最靠近太阳的行星。",
    excerpt:
      "水星公转速度最快，地表布满陨石坑。极地深处存在永久阴影区，NASA 观测表明那里可能保存着水冰。",
    image: "/planets/mercury.jpg",
    href: "https://science.nasa.gov/mercury/",
    facts: [
      "一年仅 88 个地球日。",
      "昼夜温差极大，可超过 600 ℃。",
      "拥有微弱磁场，强度约为地球的 1%。",
    ],
    color: "#9ca3af",
  },
  {
    id: "venus",
    name: "金星",
    tag: "炽热姊妹星",
    meta: "被厚重大气包裹的高温世界。",
    excerpt:
      "金星拥有失控温室效应，表面被浓密云层遮蔽。它的自转方向与多数行星相反，一天甚至比一年还长。",
    image: "/planets/venus.jpg",
    href: "https://science.nasa.gov/venus/",
    facts: [
      "表面温度约 465 ℃。",
      "大气压约为地球的 92 倍。",
      "自转一周约 243 个地球日。",
    ],
    color: "#f59e0b",
  },
  {
    id: "earth",
    name: "地球",
    tag: "蓝色家园",
    meta: "目前已知唯一孕育生命的行星。",
    excerpt:
      "地球拥有液态海洋、活跃地质活动与适宜生命的环境，是我们认识宇宙的出发点。",
    image: "/planets/earth.jpg",
    href: "https://science.nasa.gov/earth/",
    facts: [
      "表面约 71% 被海洋覆盖。",
      "拥有全球性磁场，可屏蔽大量太阳带电粒子。",
      "丰富的大气与水循环共同维持生态系统。",
    ],
    color: "#3b82f6",
  },
  {
    id: "mars",
    name: "火星",
    tag: "红色前哨",
    meta: "未来载人探索的重要目标。",
    excerpt:
      "火星地表富含氧化铁而呈红色。NASA 多项任务持续研究它是否曾拥有适合生命存在的环境。",
    image: "/planets/mars.jpg",
    href: "https://science.nasa.gov/mars/",
    facts: [
      "拥有太阳系最高火山：奥林帕斯山。",
      "曾存在液态水活动的证据。",
      "两极覆盖着水冰与干冰。",
    ],
    color: "#dc2626",
  },
  {
    id: "jupiter",
    name: "木星",
    tag: "行星之王",
    meta: "太阳系中质量最大的行星。",
    excerpt:
      "木星是巨型气态行星，拥有著名的大红斑和极其强大的磁场，对整个太阳系的动力环境都有重要影响。",
    image: "/planets/jupiter.jpg",
    href: "https://science.nasa.gov/jupiter/",
    facts: [
      "大红斑是一场持续多年的超大风暴。",
      "已确认拥有数十颗卫星。",
      "磁场强度远高于地球。",
    ],
    color: "#d97706",
  },
  {
    id: "saturn",
    name: "土星",
    tag: "光环之王",
    meta: "以壮观环系闻名的巨行星。",
    excerpt:
      "土星的环主要由冰与岩石碎片构成，尺度巨大却非常薄，是太阳系中最具辨识度的天体之一。",
    image: "/planets/saturn.jpg",
    href: "https://science.nasa.gov/saturn/",
    facts: [
      "环系宽广，但厚度很薄。",
      "平均密度低于水。",
      "其卫星系统中存在值得重点探索的海洋世界。",
    ],
    color: "#eab308",
  },
  {
    id: "uranus",
    name: "天王星",
    tag: "侧卧旋转的冰巨星",
    meta: "自转轴倾角极端特殊。",
    excerpt:
      "天王星几乎是横着绕太阳公转的，这种独特姿态让它成为研究行星形成与碰撞历史的重要样本。",
    image: "/planets/uranus.jpg",
    href: "https://science.nasa.gov/uranus/",
    facts: [
      "甲烷让它呈现蓝绿色。",
      "极端低温使它成为最冷行星之一。",
      "拥有多颗卫星与暗淡环系。",
    ],
    color: "#22d3ee",
  },
  {
    id: "neptune",
    name: "海王星",
    tag: "风暴深蓝",
    meta: "遥远且充满超高速大气活动。",
    excerpt:
      "海王星位于太阳系深处，强风与动态天气系统塑造了这颗深蓝行星充满力量感的外观。",
    image: "/planets/neptune.jpg",
    href: "https://science.nasa.gov/neptune/",
    facts: [
      "一年约等于 165 个地球年。",
      "风速可超过 2,000 km/h。",
      "是目前太阳系最外侧的主要行星。",
    ],
    color: "#1d4ed8",
  },
];
