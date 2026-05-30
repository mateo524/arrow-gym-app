import { lazy, Suspense, useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import useStore from "./store/useStore.js";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const StartWorkoutPage = lazy(() => import("./pages/StartWorkoutPage.jsx"));
const WorkoutPage = lazy(() => import("./pages/WorkoutPage.jsx"));
const ExercisesPage = lazy(() => import("./pages/ExercisesPage.jsx"));
const MapPage = lazy(() => import("./pages/MapPage.jsx"));
const HistoryPage = lazy(() => import("./pages/HistoryPage.jsx"));
const WorkoutDetailPage = lazy(() => import("./pages/WorkoutDetailPage.jsx"));
const CoachPage = lazy(() => import("./pages/CoachPage.jsx"));
const RoutinesPage = lazy(() => import("./pages/RoutinesPage.jsx"));
const BodyMetricsPage = lazy(() => import("./pages/BodyMetricsPage.jsx"));
const ProgressPage = lazy(() => import("./pages/ProgressPage.jsx"));
const SyncPage = lazy(() => import("./pages/SyncPage.jsx"));

function PageFallback() {
  return <div className="page" style={{ padding: 20 }}><p className="muted">Cargando...</p></div>;
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(useStore.persist?.hasHydrated?.() ?? true);
  useEffect(() => {
    if (!hydrated) {
      const unsub = useStore.persist?.onFinishHydration?.(() => setHydrated(true));
      return () => unsub?.();
    }
  }, [hydrated]);
  return hydrated;
}

export default function App() {
  const currentPage = useStore((state) => state.currentPage);
  const hydrated = useHydrated();
  if (!hydrated) return <div className="page" style={{ padding: 20, textAlign: "center" }}><p className="muted">Cargando...</p></div>;
  return (
    <div className="app-shell">
      <main className="app-main">
        <Suspense fallback={<PageFallback />}>
          {currentPage === "home" && <HomePage />}
          {currentPage === "start" && <StartWorkoutPage />}
          {currentPage === "workout" && <WorkoutPage />}
          {currentPage === "exercises" && <ExercisesPage />}
          {currentPage === "map" && <MapPage />}
          {currentPage === "history" && <HistoryPage />}
          {currentPage === "workoutDetail" && <WorkoutDetailPage />}
          {currentPage === "coach" && <CoachPage />}
          {currentPage === "routines" && <RoutinesPage />}
          {currentPage === "bodyMetrics" && <BodyMetricsPage />}
          {currentPage === "progress" && <ProgressPage />}
          {currentPage === "sync" && <SyncPage />}
        </Suspense>
      </main>
      <Nav />
    </div>
  );
}
