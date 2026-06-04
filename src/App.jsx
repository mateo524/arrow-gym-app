import { useEffect } from "react";
import { Router, Route, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "./pages/HomePage.jsx";
import StartWorkoutPage from "./pages/StartWorkoutPage.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx";
import ExercisesPage from "./pages/ExercisesPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import WorkoutDetailPage from "./pages/WorkoutDetailPage.jsx";
import CoachPage from "./pages/CoachPage.jsx";
import Nav from "./components/Nav.jsx";
import useStore from "./store/useStore.js";

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: .25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: .18, ease: "easeIn" } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

const PAGE_MAP = {
  home: HomePage,
  start: StartWorkoutPage,
  workout: WorkoutPage,
  exercises: ExercisesPage,
  map: MapPage,
  history: HistoryPage,
  workoutDetail: WorkoutDetailPage,
  coach: CoachPage,
};

function AppContent() {
  const [location, setLocation] = useLocation();
  const currentPage = useStore((state) => state.currentPage);
  const setPage = useStore((state) => state.setPage);

  useEffect(() => {
    const path = location.replace("/", "") || "home";
    if (PAGE_MAP[path] && path !== currentPage) {
      setPage(path);
    }
  }, [location]);

  useEffect(() => {
    const path = "/" + currentPage;
    if (path !== location) setLocation(path, { replace: true });
  }, [currentPage]);

  const PageComponent = PAGE_MAP[currentPage] || HomePage;

  return (
    <div className="app-shell">
      <main className="app-main">
        <AnimatePresence mode="wait">
          <AnimatedPage key={currentPage}>
            <PageComponent />
          </AnimatedPage>
        </AnimatePresence>
      </main>
      <Nav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
