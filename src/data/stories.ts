export type Story = {
  id: string;
  title: string;
  blurb: string;
  image: string;
  href: string;
  topic: string;
};

export const stories: Story[] = [
  {
    id: "pillars",
    title: "宇宙之柱：哈勃 30 年的回望",
    blurb: "“创生之柱”位于巨蛇座鹰状星云内，是新生恒星的摇篮。哈勃 1995 年首拍，三十年后韦布又为我们打开了它的红外新视界。",
    image: "/stories/pillars.jpg",
    href: "https://science.nasa.gov/universe/webb/",
    topic: "深空摄影",
  },
  {
    id: "uranus",
    title: "天王星：被忽略的冰巨星",
    blurb: "旅行者2 号之后，人类已有 30 多年没有再访天王星。NASA 正在籍划新的轨道器，继续追问这颗“侧卧”行星的谜团。",
    image: "/stories/uranus.jpg",
    href: "https://science.nasa.gov/uranus/",
    topic: "行星世界",
  },
  {
    id: "europa",
    title: "欧罗巴：木卫二的冰下海洋",
    blurb: "厚厚的冰层下可能藏着比地球海洋还多的液态水。欧罗巴快船将携带雷达与质谱仪，去倾听这颗冰世界深处的低语。",
    image: "/stories/europa.jpg",
    href: "https://science.nasa.gov/europa/",
    topic: "寻找生命",
  },
  {
    id: "apollo",
    title: "阿波罗月岩：46 亿年前的日记",
    blurb: "阿波罗任务带回的 382 公斤月岩，至今仍在 NASA 实验室里诉说着太阳系早期的故事，并校准我们撞击坑定年的方法。",
    image: "/stories/apollo.jpg",
    href: "https://science.nasa.gov/moon/",
    topic: "月球故事",
  },
  {
    id: "starship",
    title: "火星长征：从地球到红色行星",
    blurb: "下一代重型运载火箭与可重复使用的着陆系统，将把人类送往另一颗行星——这是一段需要数年、数十年共同书写的旅程。",
    image: "/stories/mars-rocket.jpg",
    href: "https://science.nasa.gov/mars/",
    topic: "任务进展",
  },
  {
    id: "exoplanet",
    title: "TRAPPIST-1：七颗岩质世界的合唱",
    blurb: "距地球 40 光年外，七颗地球大小的行星绕着一颗红矮星运转，其中三颗位于宜居带——是寻找系外生命的最美靶标之一。",
    image: "/stories/pillars.jpg",
    href: "https://science.nasa.gov/exoplanets/",
    topic: "系外行星",
  },
  {
    id: "titan",
    title: "土卫六：另一个有海洋的世界",
    blurb: "泰坦表面流漫着甲烷与乙烷的河流，地下藏着含盐的液态水海洋。蛾蝉号旋翼机将在这里完成人类在外星大气中的首次飞行。",
    image: "/stories/titan.jpg",
    href: "https://science.nasa.gov/titan/",
    topic: "寻找生命",
  },
];
