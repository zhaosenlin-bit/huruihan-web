export type Mission = {
  id: string;
  name: string;
  tag: string;
  description: string;
  image: string;
  href: string;
  status: "Active" | "Extended" | "En Route" | "Future" | "Completed";
};

export const missions: Mission[] = [
  {
    id: "vulcan",
    name: "韦布空间望远镜",
    tag: "JWST · 红外旗舰",
    description: "哈勃的继任者，凝视135亿年前的初代星系。",
    image: "/missions/jwst.jpg",
    href: "https://science.nasa.gov/mission/webb/",
    status: "Active",
  },
  {
    id: "perseverance",
    name: "懨力号火星车",
    tag: "Mars 2020 · 杰泽罗陨石坑",
    description: "在古代湖床上采集样品，等待未来任务送回地球。",
    image: "/missions/perseverance.jpg",
    href: "https://science.nasa.gov/mission/mars-2020-perseverance/",
    status: "Active",
  },
  {
    id: "juno",
    name: "朱诺号",
    tag: "Juno · 木星极地轨道",
    description: "通过极地轨道探测木星深部，揭示巨型行星的内部结构。",
    image: "/missions/juno.jpg",
    href: "https://science.nasa.gov/mission/juno/",
    status: "Extended",
  },
  {
    id: "psyche",
    name: "灵神星探测器",
    tag: "Psyche · 金属小行星",
    description: "前往富含金属的独特小行星，揭开行星核心的奥秘。",
    image: "/missions/psyche.jpg",
    href: "https://science.nasa.gov/mission/psyche/",
    status: "En Route",
  },
  {
    id: "europa-clipper",
    name: "欧罗巴快船",
    tag: "Europa Clipper · 冰世界",
    description: "数十次飞掠木卫二，评估其冰下海洋是否具备宜居条件。",
    image: "/missions/europa-clipper.jpg",
    href: "https://science.nasa.gov/mission/europa-clipper/",
    status: "En Route",
  },
  {
    id: "lucy",
    name: "露西号",
    tag: "Lucy · 特罗伊小行星",
    description: "首次访问木星轨道上的特罗伊小行星群，回溯行星形成史。",
    image: "/missions/lucy.jpg",
    href: "https://science.nasa.gov/mission/lucy/",
    status: "Extended",
  },
  {
    id: "dragonfly",
    name: "蛾蝉号",
    tag: "Dragonfly · 土卫六",
    description: "旋翼机将在土卫六的有机沙丘上进行多次飞行探测。",
    image: "/missions/dragonfly.jpg",
    href: "https://science.nasa.gov/mission/dragonfly/",
    status: "Future",
  },
  {
    id: "artemis",
    name: "阿尔忒弥斯计划",
    tag: "Artemis · 载人重返月球",
    description: "在月球南极建立可持续存在，为载人火星铺路。",
    image: "/missions/artemis.jpg",
    href: "https://science.nasa.gov/mission/artemis/",
    status: "Future",
  },
  {
    id: "cassini",
    name: "卡西尼号",
    tag: "Cassini · 已结束",
    description: "13年环绕土星，揭开光环结构与土卫二冰喷泉的秘密。",
    image: "/missions/cassini.jpg",
    href: "https://science.nasa.gov/mission/cassini/",
    status: "Completed",
  },
];
