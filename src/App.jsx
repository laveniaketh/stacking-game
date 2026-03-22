import { useRef, useEffect, useCallback } from "react";
import { GameProvider, useGame } from "./store/gameStore";
import GameScene from "./components/GameScene";
import ScoreDisplay from "./components/ScoreDisplay";
import IntroScreen from "./components/IntroScreen";
import ResultsScreen from "./components/ResultsScreen";

function Game() {
  const { state, dispatch } = useGame();
  const actionRef = useRef(null);

  const startGame = useCallback(() => dispatch({ type: "START_GAME" }), [dispatch]);

  const handleAction = useCallback(() => {
    if (state.phase === "intro")   { startGame(); return; }
    if (state.phase === "playing") actionRef.current?.();
  }, [state.phase, startGame]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ")              { e.preventDefault(); handleAction(); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); startGame(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAction, startGame]);

  const handlePointer = useCallback((e) => {
    if (e.isPrimary === false) return;
    handleAction();
  }, [handleAction]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ touchAction: "none" }}
      onPointerDown={handlePointer}
    >
      {/* Fullscreen 3-D canvas */}
      <GameScene onAction={actionRef} />

      {/* HUD */}
      <ScoreDisplay />

      {/* Screens */}
      <IntroScreen  onStart={startGame} />
      <ResultsScreen onRestart={startGame} />

      {/* In-game hint */}
      {state.phase === "playing" && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-white/20 text-[10px] sm:text-xs tracking-[0.25em] uppercase">
            Tap · Click · Space
          </span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
