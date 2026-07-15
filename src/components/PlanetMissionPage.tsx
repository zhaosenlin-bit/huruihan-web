import type { SolarPlanet } from "./SolarSystem";

type PlanetMissionPageProps = {
  planet: SolarPlanet;
  onClose: () => void;
  onStartMission: () => void;
};

type MissionDef = {
  code: string;
  title: string;
  summary: string;
  steps: string[];
  reward: string;
  danger: string;
};

const MISSION_BY_PLANET: Record<string, MissionDef> = {
  mercury: {
    code: "SOL-01",
    title: "日冕高热测绘",
    summary: "进入近太阳轨道，对水星地表的高温裂隙带进行热成像与结构测绘。",
    steps: ["部署隔热探测无人机", "扫描陨坑阴影区", "回收矿物光谱样本"],
    reward: "解锁耐高温探测车外壳",
    danger: "极端太阳辐射",
  },
  venus: {
    code: "SOL-02",
    title: "云城穿层探测",
    summary: "发射耐压探测器穿越金星云层，采集高密度大气与硫酸云数据。",
    steps: ["稳定下降舱姿态", "捕获硫酸云层数据", "回传气压变化记录"],
    reward: "解锁高密大气飞行组件",
    danger: "超高气压环境",
  },
  earth: {
    code: "SOL-03",
    title: "蓝轨资料归档",
    summary: "收集地球生态圈遥测信息，并建立一条受保护的近地轨道中继链路。",
    steps: ["校准中继网络", "归档海洋扫描数据", "保护卫星通行走廊"],
    reward: "解锁轨道中继指挥模块",
    danger: "太空碎片拥堵",
  },
  mars: {
    code: "SOL-04",
    title: "红峡谷着陆计划",
    summary: "在火星峡谷带附近着陆，建立基地信标，并回收古代水迹样本。",
    steps: ["选择着陆轨迹", "部署移动栖居舱", "开采含冰土壤层"],
    reward: "解锁殖民基地启动包",
    danger: "沙尘暴干扰",
  },
  jupiter: {
    code: "SOL-05",
    title: "风暴环带追踪",
    summary: "沿木星外层风暴带飞行，并持续锁定其大气漩涡边缘的遥测信号。",
    steps: ["在安全高度切入", "追踪风暴壁边界", "提取压力波样本"],
    reward: "解锁重轨研究舱",
    danger: "磁场湍流",
  },
  saturn: {
    code: "SOL-06",
    title: "环域冰屑回收",
    summary: "穿越土星环带区域，回收具发光特征的冰晶碎片用于分析。",
    steps: ["校准穿环通道", "收集冰晶碎屑", "沿安全航路返航"],
    reward: "解锁环带导航涂装",
    danger: "高速碎片撞击",
  },
  uranus: {
    code: "SOL-07",
    title: "倾轴极轨侦察",
    summary: "以极地轨道方式环绕天王星，记录其异常自转几何与大气分布。",
    steps: ["稳定极轨姿态", "绘制轴倾异常图", "标记低温气团单元"],
    reward: "解锁低温感测阵列",
    danger: "低能见度冰雾",
  },
  neptune: {
    code: "SOL-08",
    title: "边界风暴穿越",
    summary: "深入太阳系边缘，穿越海王星深蓝风暴通道并完成风场建模。",
    steps: ["越过边界轨道", "布设风暴信标", "带回风场模型"],
    reward: "解锁边疆远征徽章",
    danger: "超高速大气流",
  },
};

export default function PlanetMissionPage({
  planet,
  onClose,
  onStartMission,
}: PlanetMissionPageProps) {
  const mission = MISSION_BY_PLANET[planet.id] ?? MISSION_BY_PLANET.earth;

  return (
    <div className="absolute inset-0 z-[90] bg-[linear-gradient(180deg,rgba(2,6,17,0.84),rgba(2,6,17,0.96))] backdrop-blur-md">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.92)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.92)_1px,transparent_1px)] [background-size:100px_100px]" />

      <div className="relative flex h-full w-full flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-cyan-200/74">星球任务</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {planet.nameEn} 探索任务
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/68">
              {mission.summary}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/15 bg-slate-950/68 px-5 py-2 text-sm text-white/92 backdrop-blur-xl transition hover:bg-white/10"
            type="button"
          >
            返回太阳系
          </button>
        </div>

        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/58 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] tracking-[0.32em] text-white/54">任务编号</p>
                <p className="mt-1 text-lg font-medium text-cyan-100">{mission.code}</p>
              </div>
              <div
                className="h-14 w-14 rounded-full border border-white/10"
                style={{
                  background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.92), ${planet.color})`,
                  boxShadow: `0 0 32px ${planet.glow}`,
                }}
              />
            </div>

            <div className="mt-5">
              <h3 className="text-xl font-semibold text-white">{mission.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                目标星球：{planet.nameEn.toUpperCase()} | 轨道层级 {planet.stats[0]?.[1] ?? "--"}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {planet.stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-[10px] tracking-[0.18em] text-white/48">{label}</div>
                  <div className="mt-1 text-base font-medium text-white/92">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-[10px] tracking-[0.32em] text-cyan-200/70">任务步骤</p>
              <div className="mt-3 space-y-3">
                {mission.steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/12 text-xs font-medium text-cyan-100">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white/86">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[30px] border border-white/10 bg-slate-950/58 p-5 backdrop-blur-xl sm:p-6">
              <p className="text-[10px] tracking-[0.32em] text-cyan-200/70">任务概览</p>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                {planet.description}
              </p>
            </div>

            <div className="rounded-[30px] border border-orange-300/14 bg-orange-400/10 p-5 backdrop-blur-xl sm:p-6">
              <p className="text-[10px] tracking-[0.32em] text-orange-100/74">风险</p>
              <p className="mt-3 text-sm text-orange-50/86">{mission.danger}</p>
            </div>

            <div className="rounded-[30px] border border-emerald-300/14 bg-emerald-400/10 p-5 backdrop-blur-xl sm:p-6">
              <p className="text-[10px] tracking-[0.32em] text-emerald-100/74">奖励</p>
              <p className="mt-3 text-sm text-emerald-50/88">{mission.reward}</p>
            </div>

            <div className="mt-auto rounded-[30px] border border-white/10 bg-slate-950/58 p-5 backdrop-blur-xl sm:p-6">
              <button
                onClick={onStartMission}
                type="button"
                className="w-full rounded-full border border-cyan-300/40 bg-cyan-400/18 px-6 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/28"
              >
                开始任务
              </button>
              <button
                onClick={onClose}
                type="button"
                className="mt-3 w-full rounded-full border border-white/14 bg-white/[0.04] px-6 py-3 text-sm text-white/84 transition hover:bg-white/[0.08]"
              >
                返回轨道地图
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
