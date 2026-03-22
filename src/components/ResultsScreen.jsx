import styled from "styled-components";
import { useGame } from "../store/gameStore";

const getRank = (score) => {
  if (score >= 30)
    return {
      label: "LEGENDARY",
      color: "#6b21a8",
      glow: "rgba(147,51,234,0.4)",
    };
  if (score >= 20)
    return {
      label: "EXPERT",
      color: "#b45309",
      glow: "rgba(180,120,0,0.4)",
    };
  if (score >= 10)
    return {
      label: "SKILLED",
      color: "#047857",
      glow: "rgba(4,120,87,0.4)",
    };
  if (score >= 5)
    return {
      label: "AVERAGE",
      color: "#0369a1",
      glow: "rgba(3,105,161,0.4)",
    };
  return {
    label: "ROOKIE",
    color: "#475569",
    glow: "rgba(71,85,105,0.3)",
  };
};

export default function ResultsScreen({ onRestart }) {
  const { state } = useGame();
  if (state.phase !== "dead") return null;

  const rank = getRank(state.score);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 " />

      <StyledWrapper
        className="animate-slide-up"
        $rankcolor={rank.color}
        $glow={rank.glow}
      >
        <div className="score font-arcade tabular-nums">{state.score}</div>
        <div className="score-label font-arcade">blocks stacked</div>

        <p className="message font-sans font-semibold">You missed the block!</p>

        <div className="stat-grid">
          <div className="stat-card">
            <span>Rank bonus</span>
            <strong>{rank.label}</strong>
          </div>
          <div className="stat-card">
            <span>Stack height</span>
            <strong>{state.score} blocks</strong>
          </div>
        </div>

        <button
          className="cta-button font-arcade"
          onPointerDown={(e) => {
            e.stopPropagation();
            onRestart();
          }}
        >
          TRY AGAIN
        </button>

        <p className="hint font-arcade">press R to restart</p>
      </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  width: min(90vw, 26rem);
  background: rgba(224, 242, 254, 0.9);
  border-radius: 28px;
  border: 2px solid rgba(15, 23, 42, 0.25);
  box-shadow: 10px 12px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(18px);
  padding: 2.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;

  .rank-badge {
    font-size: 0.7rem;
    letter-spacing: 0.35em;
    color: ${(props) => props.$rankcolor};
    text-transform: uppercase;
  }

  .score {
    font-size: clamp(3rem, 8vw, 3.75rem);
    font-weight: 900;
    color: #0f172a;
    text-shadow: 0 10px 30px ${(props) => props.$glow};
  }

  .score-label {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #0ea5e9;
  }

  .message {
    font-size: 0.85rem;
    color: #0f172a;
    margin-top: 0.5rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 0.75rem;
  }

  .stat-card {
    border: 2px solid #0f172a;
    border-radius: 18px;
    padding: 1rem;
    background: #f8fafc;
    box-shadow: 6px 6px #0f172a;
    text-align: left;
  }

  .stat-card span {
    display: block;
    font-family: "Rajdhani", sans-serif;
    font-size: 0.75rem;
    color: #475569;
  }

  .stat-card strong {
    display: block;
    font-family: "Press Start 2P", monospace;
    font-size: 0.8rem;
    margin-top: 0.45rem;
    color: #0f172a;
  }

  .cta-button {
    margin-top: 0.5rem;
    width: 100%;
    min-height: 52px;
    border-radius: 999px;
    border: 2px solid #0f172a;
    background: #fde047;
    box-shadow: 6px 6px #0f172a;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: #1c1917;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .cta-button:active {
    box-shadow: 0 0 #0f172a;
    transform: translate(4px, 4px);
  }

  .hint {
    display: none;
    font-size: 0.6rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(14, 165, 233, 0.6);
  }

  @media (min-width: 640px) {
    .hint {
      display: block;
    }
  }

  @media (min-width: 768px) {
    width: 26rem;
  }
`;
