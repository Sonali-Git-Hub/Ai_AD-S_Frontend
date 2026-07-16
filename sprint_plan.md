# Incremental SaaS Optimization Sprint Plan (14 Phases)

This sprint plan defines the roadmap for optimizing the AISA SaaS platform. To ensure safety and zero regressions, optimizations follow strict Git discipline, modular sub-sprints for complex tasks, and structured verification/profiling after every stage.

---

## 🛠️ General Sprints Guidelines

### 1. Git Discipline & Line Limits
* **Branching**: All work starts on branch `perf-optimization`.
* **Periodical Pulling**: Periodically merge/pull `main` into `perf-optimization` to pull in any new changes early and resolve conflicts incrementally in a safe environment.
* **Atomic Commits**: Every sprint commits ONLY its own changes. Unrelated files must not be modified.
* **Size Constraint**: Keep changes under **~500 lines** per sprint where practical.
* **Stop Condition**: Stop and obtain review approval after every sprint. Do not proceed to the next sprint.

### 2. Mandatory Verification Check (End of Every Sprint)
Before concluding any sprint, you must verify:
- [ ] Production build succeeds (`npm run build`).
- [ ] No TypeScript/ESLint compiler errors.
- [ ] No browser console errors or React console warnings.
- [ ] Authentication, routing, and protected paths function correctly.
- [ ] Main APIs load successfully (no network waterflow regressions).
- [ ] No visual or functional UI regressions.

### 3. Mandatory Profiling Report (End of Every Sprint)
Document the following metrics in a sprint update:
* **Bundle size** (before vs. after)
* **Number of files changed**
* **Performance improvement delta**
* **Identified risks & mitigation**
* **Remaining backlog items**

---

## 🗺️ Sprint Roadmap

### 🏁 Sprint 0: Baseline & Safety
* **Goal**: Establish a performance benchmark and verify standard workflows before modifying code.
* **Tasks**:
  - Create a new Git branch `perf-optimization`.
  - Measure and record baseline metrics:
    - Production bundle size (uncompressed and gzipped).
    - Lighthouse score (Performance, Accessibility, Best Practices, SEO).
    - React Profiler render times for `Chat` and layout frames.
    - Chrome Performance timeline script parsing times.
    - Web Vitals (FCP, LCP, INP, CLS, TTFB).
  - Manually verify core operations:
    - Login & Signup
    - AI Chat
    - Image & Video Generation
    - Billing & Marketplace
    - Admin Dashboard (with lazy tabs)
* **Deliverable**: Baseline performance report in `walkthrough.md`.

---

### 📦 Sprints 1–3: Core Bundle Optimization

### Sprint 1: Build & Config optimization (Quick Wins)
* **Goal**: Enable production minification and strip unused packages.
* **Tasks**:
  - Configure `minify: 'esbuild'` and enable `reportCompressedSize` in `vite.config.js`.
  - Uninstall unused 3D dependencies (`three`, `@react-three/fiber`, `@react-three/drei`, `@splinetool/react-spline`, `@splinetool/runtime`) from `package.json`.
  - Remove dead `login_bg.gif` import in `Login.jsx`.

### Sprint 2: Route-level Code Splitting for Chat
* **Goal**: Remove `Chat` and document parsing packages from the initial bundle.
* **Tasks**:
  - Convert `Chat.jsx` and all route wrappers (`AiLegalContentRoute`, etc.) in `Navigation.Provider.jsx` to lazy imports.
  - Wrap the main `<Chat />` layout route in a `<Suspense>` container with a fallback loading placeholder.

### Sprint 3: Code Splitting Guest & Policy Routes
* **Goal**: Clean up the landing page load weights.
* **Tasks**:
  - Lazy load `Login`, `Signup`, `ForgotPassword`, `ResetPassword`, `PrivacyPolicy`, `TermsOfService`, and `CookiePolicy` inside `Navigation.Provider.jsx`.

---

### 🧩 Sprints 4–5: Modular Chat Monolith Refactoring

### Sprint 4: Modular Chat Refactoring — Part 1 (Sidebar & Projects)
* **Goal**: Isolate sidebar list rendering from main chat generation.
* **Tasks**:
  - Extract the session history lists, search controls, and projects sidebar panel from `Chat.jsx` into a new modular file `ChatSidebar.jsx`.

### Sprint 5: Modular Chat Refactoring — Part 2 (Inputs & Dashboard)
* **Goal**: Isolate user input events and welcome panels.
* **Tasks**:
  - Extract `ChatInput` (drag-and-drop uploads, voice inputs) and the welcome container (`ModernDashboard` container configurations) from `Chat.jsx`.

---

### 📜 Sprints 6A–6C: List Virtualization

### Sprint 6A: Chat History Virtualization
* **Goal**: Virtualize chat bubbles to support long historical logs.
* **Tasks**:
  - Integrate `react-window` inside `Chat.jsx` to render only the visible messages in the viewport.

### Sprint 6B: Admin Tables Virtualization
* **Goal**: Virtualize heavy accounts and sessions list tables.
* **Tasks**:
  - Implement `react-window` inside `UsersTab.jsx` and `ChatSessionsTab.jsx` list tables.

### Sprint 6C: Marketplace & Connectors Virtualization
* **Goal**: Optimize grid lists in the marketplace.
* **Tasks**:
  - Virtualize the agents list and connector grids inside the marketplace overlays.

---

### ⚡ Sprints 7A–7C: Memoization & React Optimizations

### Sprint 7A: React.memo Optimizations
* **Goal**: Prevent cascading child re-renders.
* **Tasks**:
  - Wrap chat bubbles, code highlights, and action cards in `React.memo` with custom comparison hooks.

### Sprint 7B: useMemo Optimizations
* **Goal**: Cache expensive calculations during stream loops.
* **Tasks**:
  - Wrap derived calculations (filtered session lists, usage percentages, active projects) in `useMemo`.

### Sprint 7C: useCallback Optimizations
* **Goal**: Stabilize function references in list items.
* **Tasks**:
  - Wrap event handlers, socket send triggers, and file parsers in `useCallback` to prevent stale closure re-creation.

---

### 🌐 Sprints 8–10: State, API & Animation Polish

### Sprint 8: State Subscription & Atom Isolation
* **Goal**: Isolate global Recoil state updates.
* **Tasks**:
  - Normalize Recoil atoms in `userData.js` and implement derived selectors (e.g. `userTokenSelector`, `userRoleSelector`) to prevent wide re-renders.

### Sprint 9: API Request Caching & Parallel Loading
* **Goal**: Eliminate waterflow API latency.
* **Tasks**:
  - Set up in-memory caching for projects, pricing profiles, and credit metrics. Parallelize queries on layout mount using `Promise.all`.

### Sprint 10: Animation & DOM Cleanup
* **Goal**: Optimize low-end mobile execution.
* **Tasks**:
  - Conditionally unmount dialog overlays and settings drop-downs instead of hiding them via CSS visibility. Optimize backdrop filters.

---

### 🏆 Sprint 11: Final Production Validation
* **Goal**: Perform comprehensive stress testing and document final performance improvements.
* **Tasks**:
  - Measure final metrics against Sprint 0 baseline:
    - Lighthouse score (Performance, Accessibility, Best Practices).
    - Chrome Performance profiling timeline.
    - Heap memory diagnostics (checking for memory leaks during tab switching).
    - Long-session chat test (simulating 1000+ messages).
    - Streaming stress test.
    - Low-end mobile device simulation (2GB RAM, 3G throttling).
* **Deliverable**: Final Optimization Impact Report showing before/after bundle size, memory usage, INP, and FPS values.
