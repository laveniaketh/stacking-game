# Stack Game — React + R3F + Cannon

Tech used:
- **Vite** — build tool & dev server
- **React 18** — UI framework
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/cannon** — Physics via cannon-es
- **Tailwind CSS v4** — utility-first styling

## Project Structure

```
src/
├── store/
│   └── gameStore.jsx      # Game state (React Context + useReducer)
├── components/
│   ├── GameScene.jsx       # 3D canvas, physics, game loop
│   ├── ScoreDisplay.jsx    # Score HUD
│   ├── IntroScreen.jsx     # Start screen
│   └── ResultsScreen.jsx   # Game-over screen
├── App.jsx                 # Root: input handling, screen routing
├── main.jsx                # Entry point
└── index.css               # Tailwind + custom animations
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Controls

| Input | Action |
|-------|--------|
| Click / Tap | Place block |
| Space | Place block |
| R | Restart game |

## How It Works

**State (gameStore.jsx)** — manages `phase` (intro/playing/dead), the `stack` array, `overhangs`, and `score` via useReducer. The `autopilot` flag runs the demo on the intro screen.

**Game Scene (GameScene.jsx)** — MovingTopBlock slides along its axis each frame via useFrame. Block wraps static/falling pieces in useBox from @react-three/cannon. FollowCamera smoothly raises the camera as the tower grows.

**Split Logic** — on action, overlap between the moving block and the layer below is computed. If positive, the block trims and the overhang spawns as a dynamic physics body. If zero or negative, game over.
