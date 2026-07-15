export type TenThingItem = {
  name: string;
  detail: string;
};

export type TenThing = {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  href: string;
  items: TenThingItem[];
};

export const tenThings: TenThing[] = [
  {
    id: "stardust",
    number: "01",
    title: "走向星际空间",
    description:
      "你身体里每一颗重于氢的原子，都来自某颗古老恒星的死亡。",
    image:
      "/ten-things/stardust.jpg",
    href: "https://science.nasa.gov/universe/stars/",
    items: [
      { name: "恒星的熔炉", detail: "在恒星核心数百万度的高温下，氢、氦聚变成碳、氧、铁。" },
      { name: "超新星喷洒", detail: "大质量恒星以超新星爆发结束生命，把重元素抛向宇宙空间。" },
      { name: "星云的再循环", detail: "这些物质与气体混合，形成下一代恒星、行星乃至生命。" },
    ],
  },
  {
    id: "moon",
    number: "02",
    title: "十个月球冷知识",
    description:
      "它不是地球唯一的卫星，却塑造了我们的潮汐、稳定了气候。",
    image:
      "/ten-things/moon.jpg",
    href: "https://science.nasa.gov/moon/",
    items: [
      { name: "正在远离", detail: "月球每年以约 3.8 厘米的速度远离地球。" },
      { name: "永远一面", detail: "潮汐锁定让月球永远以同一面朝向地球。" },
      { name: "有水冰", detail: "南极永久阴影区发现水冰，是未来月球基地的重要资源。" },
    ],
  },
  {
    id: "mars-water",
    number: "03",
    title: "十件关于火星的事",
    description:
      "曾经的温暖湿润，如今的寒冷干燥——火星记录了行星演化的剧本。",
    image:
      "/ten-things/mars.jpg",
    href: "https://science.nasa.gov/mars/",
    items: [
      { name: "古代海洋", detail: "轨道雷达与地貌证据表明，火星北半球曾有一片海洋。" },
      { name: "大气逃逸", detail: "数十亿年前太阳风剥离了火星大部分大气。" },
      { name: "水冰储量", detail: "今天火星地下与极区仍封存着大量水冰。" },
    ],
  },
  {
    id: "jupiter-moons",
    number: "04",
    title: "十大木星卫星",
    description:
      "如果把木星的卫星看成独立世界，足以组成一个新的太阳系。",
    image:
      "/ten-things/jupiter.jpg",
    href: "https://science.nasa.gov/jupiter/moons/",
    items: [
      { name: "木卫一", detail: "整个太阳系最活跃的火山世界，表面被硫磺染成红黄相间。" },
      { name: "木卫二", detail: "冰下液态水海洋，是搜寻生命最诱人的目标之一。" },
      { name: "木卫三", detail: "太阳系最大的卫星，自身拥有磁层。" },
    ],
  },
  {
    id: "blackhole",
    number: "05",
    title: "十大黑洞知识",
    description:
      "引力强到连光都逃不出来，但事件视界望远镜让我们看见了它的剪影。",
    image:
      "/ten-things/blackhole.jpg",
    href: "https://science.nasa.gov/universe/black-holes/",
    items: [
      { name: "超大质量黑洞", detail: "几乎每个大星系核心都藏着百万至数十亿倍太阳质量的黑洞。" },
      { name: "潮汐瓦解事件", detail: "恒星若过于靠近黑洞，会被潮汐力撕裂并发出明亮闪光。" },
      { name: "时间变慢", detail: "靠近黑洞的地方，时间相对远处会显著变慢。" },
    ],
  },
  {
    id: "exoplanets",
    number: "06",
    title: "十大系外行星",
    description:
      "开普勒与 TESS 把我们带入了“千行星”时代。",
    image:
      "/ten-things/exoplanet.jpg",
    href: "https://science.nasa.gov/exoplanets/",
    items: [
      { name: "TRAPPIST-1e", detail: "位于宜居带的岩质行星，是寻找生命的重要候选。" },
      { name: "开普勒-22b", detail: "首颗位于宜居带的系外行星，距地球约 600 光年。" },
      { name: "55 Cancri e", detail: "超级地球，可能拥有富含碳的“钻石”内核。" },
    ],
  },
  {
    id: "voyager",
    number: "07",
    title: "旅行者号的告别",
    description:
      "两艘 1977 年发射的探测器，正飞向真正的星际空间。",
    image:
      "/ten-things/voyager.jpg",
    href: "https://science.nasa.gov/mission/voyager/",
    items: [
      { name: "黄金唱片", detail: "旅行者号携带着含有人类声音、音乐与问候的“金色唱片”。" },
      { name: "星际介质", detail: "旅行者 1 号已于 2012 年穿越日球层顶，进入星际介质。" },
      { name: "仍在通讯", detail: "通过深空网络，旅行者号仍在以每秒 160 比特传回数据。" },
    ],
  },
  {
    id: "eclipse",
    number: "08",
    title: "十大日食奇观",
    description:
      "当月球恰好遮住太阳，我们便能短暂窥见日冕的秘密。",
    image:
      "/ten-things/eclipse.jpg",
    href: "https://science.nasa.gov/eclipses/",
    items: [
      { name: "全食", detail: "月球本影完全遮住太阳，可见日冕与色球层。" },
      { name: "环食", detail: "月球离地球较远时，太阳边缘露出一圈光环。" },
      { name: "贝利珠", detail: "全食前后，月球边缘山谷漏出的阳光形成一串亮珠。" },
    ],
  },
  {
    id: "telescope",
    number: "09",
    title: "十大望远镜里程碑",
    description:
      "从伽利略手制小筒到韦布 6.5 米镜面，人类看得越来越远。",
    image:
      "/ten-things/jwst.jpg",
    href: "https://science.nasa.gov/universe/telescopes/",
    items: [
      { name: "哈勃", detail: "1990 年至今，重塑了宇宙距离与年龄的标尺。" },
      { name: "钱德拉", detail: "X 射线望远镜，看清黑洞、中子星与超新星遗迹。" },
      { name: "韦布", detail: "在 L2 拉格朗日点凝视 135 亿年前的初代星系。" },
    ],
  },
  {
    id: "aurora",
    number: "10",
    title: "十大极光秘密",
    description:
      "太阳风与地球磁场共舞，在两极画出光与色的奇迹。",
    image:
      "/ten-things/aurora.jpg",
    href: "https://science.nasa.gov/earth/",
    items: [
      { name: "太阳风的礼物", detail: "带电粒子沿磁力线冲入大气，激发氧与氮发出不同颜色的光。" },
      { name: "不只是地球", detail: "木星和土星同样拥有极光，只是更剧烈。" },
      { name: "太阳活动周", detail: "极光的强度与太阳黑子活动周期紧密相关。" },
    ],
  },
];