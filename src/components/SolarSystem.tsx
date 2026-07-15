import { useEffect, useMemo, useState } from "react";

export type SolarPlanet = {
  id: string;
  name: string;
  nameEn: string;
  orbit: number;
  speed: number;
  size: number;
  color: string;
  glow: string;
  description: string;
  stats: [string, string][];
};

type SolarSystemProps = {
  onPlanetOpen?: (planet: SolarPlanet) => void;
  onSelectedChange?: (planetId: string) => void;
};

const PLANETS: SolarPlanet[] = [
  {
    id: "mercury",
    name: "水星",
    nameEn: "Mercury",
    orbit: 120,
    speed: 3.6,
    size: 7,
    color: "#d1d5db",
    glow: "rgba(255,255,255,0.28)",
    description: "贴近太阳运行的岩质世界，轨道速度最快。",
    stats: [["轨道层级", "01"], ["昼夜温差", "极高"], ["任务状态", "巡航"]],
  },
  {
    id: "venus",
    name: "金星",
    nameEn: "Venus",
    orbit: 175,
    speed: 5.1,
    size: 11,
    color: "#f7d28d",
    glow: "rgba(247,210,141,0.28)",
    description: "高反照率云层覆盖，拥有浓密大气与极端温室效应。",
    stats: [["轨道层级", "02"], ["大气压", "92x"], ["任务状态", "监测"]],
  },
  {
    id: "earth",
    name: "地球",
    nameEn: "Earth",
    orbit: 235,
    speed: 6.7,
    size: 12,
    color: "#6eb7ff",
    glow: "rgba(110,183,255,0.3)",
    description: "蓝色生命行星，适合作为游戏舱的默认观察目标。",
    stats: [["轨道层级", "03"], ["生态指数", "100%"], ["任务状态", "在线"]],
  },
  {
    id: "mars",
    name: "火星",
    nameEn: "Mars",
    orbit: 305,
    speed: 8.5,
    size: 9,
    color: "#ff8a6a",
    glow: "rgba(255,138,106,0.28)",
    description: "红色尘暴星球，是未来载人探索与基地建设热点。",
    stats: [["轨道层级", "04"], ["地表特征", "峡谷"], ["任务状态", "侦察"]],
  },
  {
    id: "jupiter",
    name: "木星",
    nameEn: "Jupiter",
    orbit: 395,
    speed: 12.5,
    size: 24,
    color: "#f2b37b",
    glow: "rgba(242,179,123,0.3)",
    description: "巨型气态行星，条带云层与大红斑让它最有舞台感。",
    stats: [["轨道层级", "05"], ["卫星数量", "95+"], ["任务状态", "锁定"]],
  },
  {
    id: "saturn",
    name: "土星",
    nameEn: "Saturn",
    orbit: 495,
    speed: 16.8,
    size: 21,
    color: "#ecd998",
    glow: "rgba(236,217,152,0.28)",
    description: "带有标志性环带的气态巨行星，是观感最强的外层目标。",
    stats: [["轨道层级", "06"], ["环带状态", "清晰"], ["任务状态", "跟踪"]],
  },
  {
    id: "uranus",
    name: "天王星",
    nameEn: "Uranus",
    orbit: 585,
    speed: 22.5,
    size: 15,
    color: "#93f1ff",
    glow: "rgba(147,241,255,0.28)",
    description: "偏冷的青蓝色冰巨星，自转轴大角度倾斜。",
    stats: [["轨道层级", "07"], ["姿态模式", "倾转"], ["任务状态", "远探"]],
  },
  {
    id: "neptune",
    name: "海王星",
    nameEn: "Neptune",
    orbit: 675,
    speed: 29.5,
    size: 15,
    color: "#88aaff",
    glow: "rgba(136,170,255,0.28)",
    description: "深蓝色外层行星，轨道最远，象征探索边界。",
    stats: [["轨道层级", "08"], ["风暴等级", "高"], ["任务状态", "边界"]],
  },
];

const STAR_POINTS = [
  [8, 15], [12, 68], [18, 42], [24, 20], [29, 79], [34, 32], [39, 57], [46, 18],
  [53, 84], [58, 40], [62, 14], [67, 73], [71, 28], [78, 52], [83, 22], [88, 64], [94, 36],
];

function orbitPosition(planet: SolarPlanet, t: number) {
  const angle = t / planet.speed + PLANETS.findIndex((p) => p.id === planet.id) * 0.72;
  const x = 800 + Math.cos(angle) * planet.orbit;
  const y = 480 + Math.sin(angle) * planet.orbit * 0.42;
  return { x, y, angle };
}

export default function SolarSystem({ onPlanetOpen, onSelectedChange }: SolarSystemProps) {
  const [t, setT] = useState(0);
  const [selectedId, setSelectedId] = useState("earth");

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    onSelectedChange?.(selectedId);
  }, [selectedId, onSelectedChange]);

  const selectedPlanet = useMemo(
    () => PLANETS.find((planet) => planet.id === selectedId) ?? PLANETS[2],
    [selectedId],
  );

  const positions = useMemo(
    () => PLANETS.map((planet) => ({ planet, ...orbitPosition(planet, t) })),
    [t],
  );

  return (
    <div className="relative min-h-[620px] w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_50%_42%,rgba(42,78,154,0.16),transparent_26%),linear-gradient(180deg,#030713_0%,#050a17_40%,#08101d_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.92)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.92)_1px,transparent_1px)] [background-size:90px_90px]" />

      <svg
        viewBox="0 0 1600 960"
        className="block h-full w-full"
        role="img"
        aria-label="Solar system command deck animation"
      >
        <defs>
          <radialGradient id="solar-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8dc" />
            <stop offset="34%" stopColor="#ffd56a" />
            <stop offset="68%" stopColor="#ff9f43" />
            <stop offset="100%" stopColor="#6c2909" />
          </radialGradient>
          <radialGradient id="solar-glow" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="rgba(255,196,84,0.36)" />
            <stop offset="72%" stopColor="rgba(255,196,84,0.08)" />
            <stop offset="100%" stopColor="rgba(255,196,84,0)" />
          </radialGradient>
        </defs>

        {STAR_POINTS.map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            cx={`${x}%`}
            cy={`${y}%`}
            r={index % 3 === 0 ? 2.1 : 1.2}
            fill={index % 2 === 0 ? "rgba(255,255,255,0.62)" : "rgba(155,220,255,0.42)"}
          />
        ))}

        <ellipse cx="800" cy="480" rx="720" ry="320" fill="url(#solar-glow)" />

        {PLANETS.map((planet) => (
          <ellipse
            key={planet.id}
            cx="800"
            cy="480"
            rx={planet.orbit}
            ry={planet.orbit * 0.42}
            fill="none"
            stroke={selectedId === planet.id ? "rgba(132,214,255,0.72)" : "rgba(255,255,255,0.12)"}
            strokeDasharray={selectedId === planet.id ? "10 10" : "5 9"}
            strokeWidth={selectedId === planet.id ? "2.2" : "1.2"}
          />
        ))}

        <g>
          <circle cx="800" cy="480" r="88" fill="url(#solar-glow)" />
          <circle cx="800" cy="480" r="54" fill="url(#solar-core)" />
          <circle cx="800" cy="480" r="82" fill="none" stroke="rgba(255,220,132,0.34)" strokeWidth="1.4" />
          <circle cx="800" cy="480" r="108" fill="none" stroke="rgba(255,220,132,0.12)" strokeWidth="1.2" />
          <text
            x="800"
            y="392"
            textAnchor="middle"
            fontSize="17"
            fill="rgba(255,244,204,0.92)"
            style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}
          >
            太阳
          </text>
        </g>

        {positions.map(({ planet, x, y, angle }) => {
          const isSelected = selectedId === planet.id;
          return (
            <g
              key={planet.id}
              onClick={() => {
                setSelectedId(planet.id);
                onPlanetOpen?.(planet);
              }}
              style={{ cursor: "pointer" }}
            >
              {planet.id === "saturn" && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={planet.size * 1.9}
                  ry={planet.size * 0.72}
                  fill="none"
                  stroke="rgba(244,218,162,0.75)"
                  strokeWidth="2"
                  transform={`rotate(${angle * 8}, ${x}, ${y})`}
                />
              )}

              <circle cx={x} cy={y} r={planet.size * (isSelected ? 2.1 : 1.7)} fill={planet.glow} />
              <circle
                cx={x}
                cy={y}
                r={planet.size}
                fill={planet.color}
                stroke={isSelected ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.3)"}
                strokeWidth={isSelected ? "2.2" : "1.1"}
              />

              <line
                x1={x}
                y1={y}
                x2={x + 42}
                y2={y - 24}
                stroke={isSelected ? "rgba(132,214,255,0.78)" : "rgba(255,255,255,0.22)"}
                strokeWidth="1.4"
              />
              <text
                x={x + 52}
                y={y - 28}
                fontSize={isSelected ? "15" : "13"}
                fill={isSelected ? "rgba(210,240,255,0.98)" : "rgba(255,255,255,0.7)"}
                style={{ fontFamily: "Space Grotesk, Noto Sans SC, sans-serif" }}
              >
                {planet.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/58 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.16em] text-white/62">
          <span>模式：探索视图</span>
          <span>当前行星：{selectedPlanet.name}</span>
          <span>轨道数量：08</span>
        </div>
      </div>
    </div>
  );
}
