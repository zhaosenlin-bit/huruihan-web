export type ResourceItem = {
  id: string;
  title: string;
  category: string;
  blurb: string;
  href: string;
  image: string;
  cta: string;
};

export const solarFacts: string[] = [
  "如果把太阳缩小到一颗弹珠，地球将只有 21 厘米之外的一粒芝麻。",
  "光从太阳表面到达地球需要 8 到 20 秒，我们看到的其实是 8 分钟前的太阳。",
  "国际空间站每 90 分钟绕地球一圈，宇航员每天都能看到 16 次日出。",
  "火星上的日落是蓝色的，而地球上的日落是红色的——尘埃与大气说了算。",
  "土星的密度小于水，理论上如果你找到一个足够大的澡盖，它会浮起来。",
  "在月球上留下的脚印可以保存数百万年，因为那里没有风也没有水。",
  "金星上的一天比一年还要长——自转一周 243 地球日，公转一周 225 地球日。",
  "旅行者1 号是此今飞得最远的人造物，距地球已超过 240 亿公里。",
];


export const resources: ResourceItem[] = [
  {
    id: "eyes",
    title: "Eyes on the Solar System",
    category: "交互式 3D",
    blurb: "实时跟踪 NASA 探测器与小行星，体验穿越太阳系的飞行。",
    href: "https://eyes.nasa.gov/apps/solar-system/",
    image: "/resources/eyes.jpg",
    cta: "打开 Eyes",
  },
  {
    id: "exoplanet-travel",
    title: "系外行星旅行手册",
    category: "互动指南",
    blurb: "想象站在 TRAPPIST-1e 的地表——天空会比地球大 10 倍。",
    href: "https://science.nasa.gov/exoplanets/",
    image: "/resources/exoplanet.jpg",
    cta: "阅读指南",
  },
  {
    id: "3d-models",
    title: "NASA 3D 模型库",
    category: "可下载资源",
    blurb: "获取官方探测器、小行星与行星的 3D 模型，导入到 Blender 或打印。",
    href: "https://science.nasa.gov/3d-resources/",
    image: "/resources/3d-models.jpg",
    cta: "前往模型库",
  },
  {
    id: "image-library",
    title: "NASA 影像图库",
    category: "视觉素材",
    blurb: "超过 50 万张高清公开影像，涵盖地球、行星、深空与任务现场。",
    href: "https://images.nasa.gov/",
    image: "/resources/image-library.jpg",
    cta: "浏览影像",
  },
  {
    id: "spot-the-station",
    title: "国际空间站过境",
    category: "观测工具",
    blurb: "输入你的城市，查询下一次肉眼可见的亮过境时间与方位。",
    href: "https://spotthestation.nasa.gov/",
    image: "/resources/iss.jpg",
    cta: "查询过境",
  },
  {
    id: "moon-trek",
    title: "Moon Trek 探月地图",
    category: "地形可视化",
    blurb: "高分辨率月球地形数据，可测量距离、坡度与光照条件。",
    href: "https://trek.nasa.gov/moon/",
    image: "/resources/moon-trek.jpg",
    cta: "查看地图",
  },
  {
    id: "stem",
    title: "教师与学生资源",
    category: "课堂素材",
    blurb: "NASA STEM 教学包：教案、视频、讲座与动手实验。",
    href: "https://www.nasa.gov/learning-resources/",
    image: "/resources/stem.jpg",
    cta: "获取资源",
  },
  {
    id: "podcasts",
    title: "NASA 官方播客",
    category: "音频故事",
    blurb: "Curious Universe 等系列节目，讲述科学家与工程师的第一线故事。",
    href: "https://www.nasa.gov/podcasts/",
    image: "/resources/podcasts.jpg",
    cta: "收听播客",
  },
];
