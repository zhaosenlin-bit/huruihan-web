import { useState } from "react";
import ArcadeFlightGame from "./components/ArcadeFlightGame";
import BaseLanding from "./components/BaseLanding";
import MissionLaunchScene from "./components/MissionLaunchScene";
import PlanetMissionPage from "./components/PlanetMissionPage";
import ResourceCollection2D from "./components/ResourceCollection2D";
import RocketFlyby from "./components/RocketFlyby";
import SolarSystem, { type SolarPlanet } from "./components/SolarSystem";
import VictoryScreen from "./components/VictoryScreen";

type GamePageProps = {
  onBackHome: () => void;
};

type GameStage =
  | "explore"
  | "mission"
  | "launch"
  | "flight"
  | "collect"
  | "base"
  | "victory";

export default function GamePage({ onBackHome }: GamePageProps) {
  const [activePlanet, setActivePlanet] = useState<SolarPlanet | null>(null);
  const [stage, setStage] = useState<GameStage>("explore");
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>("earth");

  const openPlanet = (planet: SolarPlanet) => {
    setActivePlanet(planet);
    setStage("mission");
  };

  const closePlanet = () => {
    setActivePlanet(null);
    setStage("explore");
  };

  const startMission = () => {
    if (activePlanet) setStage("launch");
  };

  const finishLaunch = () => {
    if (activePlanet) setStage("flight");
  };

  const exitFlight = () => {
    if (activePlanet) setStage("mission");
  };

  // "再来一次" sends the player back to the 5s launch cutscene so the
  // rocket fly-in plays again before the arcade gameplay restarts.
  const restartFlight = () => {
    if (activePlanet) setStage("launch");
  };

  // After 20s of meteor dodging, hand off to the 2D resource collection minigame.
  const enterCollection = () => {
    if (activePlanet) setStage("collect");
  };

  const finishCollection = () => {
    if (activePlanet) setStage("base");
  };

  const finishBaseLanding = () => {
    if (activePlanet) setStage("victory");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,#02040c_0%,#050915_54%,#07101b_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.88)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.88)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="pointer-events-none absolute left-1/2 top-[12%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(88,150,255,0.18),rgba(88,150,255,0.05)_34%,transparent_72%)] blur-3xl" />

      <div className="absolute left-4 top-4 z-40 sm:left-6 sm:top-6">
        <button
          onClick={onBackHome}
          className="rounded-full border border-white/15 bg-slate-950/68 px-5 py-2 text-sm text-white/92 backdrop-blur-xl transition hover:bg-white/10"
          type="button"
        >
          返回主页
        </button>
      </div>

      <div className="relative z-10 h-full w-full px-0 pb-0 pt-0">
        <SolarSystem onPlanetOpen={openPlanet} onSelectedChange={setSelectedPlanetId} />
      </div>

      {stage === "explore" && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <RocketFlyby
            className="h-full w-full opacity-95"
            targetPlanet={selectedPlanetId} />
        </div>
      )}

      {stage === "mission" && activePlanet && (
        <PlanetMissionPage
          planet={activePlanet}
          onClose={closePlanet}
          onStartMission={startMission}
        />
      )}

      {stage === "launch" && activePlanet && (
        <MissionLaunchScene
          planet={activePlanet}
          onComplete={finishLaunch}
        />
      )}

      {stage === "flight" && activePlanet && (
        <ArcadeFlightGame
          planet={activePlanet}
          onExit={exitFlight}
          onRestart={restartFlight}
          onEnterCollection={enterCollection}
        />
      )}

      {stage === "collect" && activePlanet && (
        <ResourceCollection2D
          planet={activePlanet}
          onComplete={finishCollection}
        />
      )}

      {stage === "base" && activePlanet && (
        <BaseLanding
          planet={activePlanet}
          onComplete={finishBaseLanding}
        />
      )}

      {stage === "victory" && activePlanet && (
        <VictoryScreen
          planet={activePlanet}
          onBackToMission={exitFlight}
          onPlayAgain={restartFlight}
        />
      )}
    </div>
  );
}
