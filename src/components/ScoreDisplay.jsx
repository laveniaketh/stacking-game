import { useEffect, useRef, useState } from "react";
import { useGame } from "../store/gameStore";

export default function ScoreDisplay() {
  const { state } = useGame();
  const [displayScore, setDisplayScore] = useState(0);
  const [scorePop, setScorePop] = useState(false);
  const prevScore = useRef(0);

  useEffect(() => {
    if (state.score !== prevScore.current) {
      setDisplayScore(state.score);
      setScorePop(true);
      prevScore.current = state.score;
      const t = setTimeout(() => setScorePop(false), 220);
      return () => clearTimeout(t);
    }
  }, [state.score]);

  if (state.phase === "intro") return null;

  return (
    <div className="fixed top-6 sm:top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div
        className={`text-2xl sm:text-3xl text-white tabular-nums transition-transform font-arcade ${scorePop ? "score-pop" : ""}`}
      >
        {displayScore}
      </div>
    </div>
  );
}
