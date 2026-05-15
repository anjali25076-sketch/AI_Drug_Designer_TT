# Three.js Nitrogen Particle Background

The goal is to integrate the provided `nitrogen.js` Three.js particle effect as a live, interactive background that persists across all pages of the AI Drug Designer platform.

## User Review Required

> [!WARNING]
> **Performance Impact**: The `nitrogen.js` script renders an `InstancedMesh` of 20,000 tetrahedrons and utilizes an `UnrealBloomPass` for post-processing glow. Running this globally underneath all pages (including the highly interactive landing page with scroll sequences and the dashboard data visualizations) will be **extremely GPU intensive**. This may cause older devices or laptops to experience dropped frames or high fan noise.

Please review the plan below. I can implement it exactly as is, but if you notice performance issues after deployment, we can optimize it later by reducing the particle count or disabling the Bloom pass.

## Proposed Changes

### Dependencies
- Install `three` and `@types/three` via npm (currently installing).

### `src/components/NitrogenBackground.tsx`
- **[NEW] [NitrogenBackground.tsx](file:///d:/Hackathons/Ai%20drug%20designer/New_DrugDesigner/src/components/NitrogenBackground.tsx)**
- Create a Next.js Client Component wrapper around the `ParticlesSwarm` class from `nitrogen.js`.
- Use a `useEffect` hook to initialize the `ParticlesSwarm` on mount and call its `dispose()` method on unmount to prevent memory leaks during hot reloads.
- Style the container to be `position: fixed`, `inset: 0`, `z-index: -1`, and `pointer-events: none` so it spans the entire screen in the background without blocking clicks on the UI.

### `src/app/layout.tsx`
- **[MODIFY] [layout.tsx](file:///d:/Hackathons/Ai%20drug%20designer/New_DrugDesigner/src/app/layout.tsx)**
- Import and inject `<NitrogenBackground />` inside the `<body>` so that the canvas is mounted at the highest level of the application. This ensures the background seamlessly persists as you navigate between the Landing Page and the Platform.

## Verification Plan

### Automated/Build Verification
- Run `npm run dev` to ensure Next.js compiles without SSR errors (since `three.js` requires the `window` object, the component must be strictly client-side).

### Manual Verification
- Verify the particle swarm renders correctly and animates smoothly behind the dashboard.
- Ensure that UI elements (buttons, links, hover effects) are still clickable and not blocked by the canvas.
- Navigate between the dashboard and the landing page to ensure the WebGL context is not unnecessarily destroyed/recreated, preserving performance.
