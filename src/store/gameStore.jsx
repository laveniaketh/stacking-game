import { createContext, useContext, useReducer, useCallback } from "react";

const BOX_HEIGHT = 1;
const ORIGINAL_BOX_SIZE = 3;

const initialState = {
  phase: "intro", // 'intro' | 'playing' | 'dead'
  score: 0,
  stack: [],
  overhangs: [],
  autopilot: true,
  robotPrecision: 0,
  lastPerfect: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        phase: "playing",
        autopilot: false,
        robotPrecision: Math.random() * 1 - 0.5,
        stack: [
          { x: 0, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: undefined, y: 0, id: "foundation" },
          { x: -10, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: "x", y: BOX_HEIGHT, id: "first" },
        ],
        overhangs: [],
        score: 0,
      };
    case "ADD_LAYER":
      return {
        ...state,
        stack: [...state.stack, action.layer],
        score: action.score ?? state.score,
      };
    case "ADD_OVERHANG":
      return {
        ...state,
        overhangs: [...state.overhangs, action.overhang],
      };
    case "UPDATE_TOP_LAYER":
      return {
        ...state,
        stack: state.stack.map((l, i) =>
          i === state.stack.length - 1 ? { ...l, ...action.updates } : l
        ),
      };
    case "REMOVE_TOP_LAYER":
      return {
        ...state,
        stack: state.stack.slice(0, -1),
      };
    case "GAME_OVER":
      return { ...state, phase: "dead" };
    case "PERFECT_PLACEMENT":
      return { ...state, lastPerfect: (state.lastPerfect || 0) + 1 };
    case "SET_ROBOT_PRECISION":
      return { ...state, robotPrecision: Math.random() * 1 - 0.5 };
    case "AUTOPILOT_INIT":
      return {
        ...initialState,
        phase: "intro",
        autopilot: true,
        robotPrecision: Math.random() * 1 - 0.5,
        stack: [
          { x: 0, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: undefined, y: 0, id: "foundation" },
          { x: -10, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: "x", y: BOX_HEIGHT, id: "first" },
        ],
        overhangs: [],
        score: 0,
      };
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    stack: [
      { x: 0, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: undefined, y: 0, id: "foundation" },
      { x: -10, z: 0, width: ORIGINAL_BOX_SIZE, depth: ORIGINAL_BOX_SIZE, direction: "x", y: BOX_HEIGHT, id: "first" },
    ],
  });

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

export { BOX_HEIGHT, ORIGINAL_BOX_SIZE };
