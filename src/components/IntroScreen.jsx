import styled from "styled-components";
import { useGame } from "../store/gameStore";

export default function IntroScreen({ onStart }) {
  const { state } = useGame();
  if (state.phase !== "intro") return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center px-6">
      <StyledWrapper
        className="animate-slide-down"
        onPointerDown={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        <div className="form">
          <div className="title">
            STACKGAME
            <br />
            <span>line up each block with perfect timing</span>
          </div>

          <p className="summary">
            Tap, click, or press space the moment the moving block sits above
            the stack. Clean drops keep the tower wide and your score climbing.
          </p>

          <ul className="instructions">
            <li className="mobile-only">
              <strong>Tap anywhere</strong>
              <span>Drop the block on touch devices.</span>
            </li>
            <li className="desktop-only">
              <strong>Click or SPACE</strong>
              <span>Desktop control for precision stacking.</span>
            </li>
            <li className="desktop-only">
              <strong>Press R</strong>
              <span>Instantly restart if the tower topples.</span>
            </li>
          </ul>

          <button
            type="button"
            className="button-confirm"
            onPointerDown={(e) => {
              e.stopPropagation();
              onStart();
            }}
          >
            Let&apos;s stack →
          </button>
        </div>
      </StyledWrapper>
    </div>
  );
}

const StyledWrapper = styled.div`
  width: min(90vw, 26rem);
  border-radius: 28px;
  background: rgba(186, 230, 253, 0.82);
  border: 2px solid rgba(12, 74, 110, 0.35);
  box-shadow: 10px 12px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(16px);
  padding: 1.75rem;

  .form {
    --input-focus: #0284c7;
    --font-color: #0f172a;
    --font-color-sub: #475569;
    --bg-color: #e0f2fe;
    --main-color: #0f172a;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .title {
    color: var(--font-color);
    font-family: "Press Start 2P", monospace;
    font-size: 1.25rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.6;
    text-align: center;
  }

  .title span {
    color: var(--font-color-sub);
    font-family: "Rajdhani", sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    text-transform: none;
    letter-spacing: normal;
    display: inline-block;
    margin-top: 0.35rem;
  }

  .summary {
    font-family: "Rajdhani", sans-serif;
    font-weight: 600;
    color: var(--font-color-sub);
    font-size: 0.95rem;
  }

  .instructions {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .instructions li {
    border: 2px solid var(--main-color);
    border-radius: 12px;
    padding: 0.65rem 0.9rem;
    background: var(--bg-color);
    box-shadow: 6px 6px var(--main-color);
    font-family: "Rajdhani", sans-serif;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .instructions li.desktop-only {
    display: none;
  }

  .instructions li strong {
    font-family: "Press Start 2P", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.07em;
  }

  .instructions li span {
    color: var(--font-color-sub);
    font-weight: 600;
  }

  .badge-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .badge {
    flex: 1;
    min-width: 5.5rem;
    border-radius: 1rem;
    border: 2px solid var(--main-color);
    box-shadow: 6px 6px var(--main-color);
    background: #f0f9ff;
    padding: 0.75rem;
    text-align: left;
    font-family: "Rajdhani", sans-serif;
  }

  .badge span {
    display: block;
    font-family: "Press Start 2P", monospace;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    margin-bottom: 0.35rem;
    color: var(--font-color);
  }

  .badge small {
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 0.75rem;
  }

  .button-confirm {
    margin-top: 0.5rem;
    width: 100%;
    min-height: 48px;
    border-radius: 999px;
    border: 2px solid var(--main-color);
    background: #fde047;
    box-shadow: 6px 6px var(--main-color);
    font-family: "Press Start 2P", monospace;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: #1c1917;
    cursor: pointer;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .button-confirm:active {
    box-shadow: 0 0 var(--main-color);
    transform: translate(4px, 4px);
  }

  @media (min-width: 640px) {
    .instructions li.desktop-only {
      display: flex;
    }
  }

  @media (min-width: 768px) {
    width: 26rem;
  }
`;
