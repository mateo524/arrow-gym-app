import { useEffect, Component } from "react";
import { Router, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "./pages/HomePage.jsx";
import StartWorkoutPage from "./pages/StartWorkoutPage.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx";
import ExercisesPage from "./pages/ExercisesPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import WorkoutDetailPage from "./pages/WorkoutDetailPage.jsx";
import CoachPage from "./pages/CoachPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import TrainerPage from "./pages/TrainerPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PRPage from "./pages/PRPage.jsx";
import Nav from "./components/Nav.jsx";
import useStore from "./store/useStore.js";
import useAuthStore from "./store/useAuthStore.js";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Algo salió mal</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "monospace", wordBreak: "break-word" }}>
            {this.state.error.message}
          </p>
          <button className="primary" onClick={() => this.setState({ error: null })}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: .25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: .18, ease: "easeIn" } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
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
  admin: AdminPage,
  trainer: TrainerPage,
  profile: ProfilePage,
  prs: PRPage,
};

function AppContent() {
  const [location, setLocation] = useLocation();
  const currentPage = useStore((s) => s.currentPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const amoled = useStore((s) => s.amoled);
  const setPage = useStore((s) => s.setPage);

  const { user, profile, loading, init } = useAuthStore();

  // Init auth in background — the cached session already set user synchronously
  useEffect(() => { init(); }, []);

  // Backup active workout to sessionStorage every time it changes.
  // sessionStorage survives iOS PWA app switches (unlike in-memory state).
  useEffect(() => {
    if (activeWorkout) {
      sessionStorage.setItem("arrow-gym-active-workout", JSON.stringify(activeWorkout));
    } else {
      sessionStorage.removeItem("arrow-gym-active-workout");
    }
  }, [activeWorkout]);

  // On mount: if Zustand lost the active workout (iOS killed the process) but
  // sessionStorage still has it, restore it immediately before any render.
  useEffect(() => {
    const stored = sessionStorage.getItem("arrow-gym-active-workout");
    if (stored && !activeWorkout) {
      try {
        const recovered = JSON.parse(stored);
        useStore.setState({ activeWorkout: recovered, currentPage: "workout" });
      } catch {}
    }
  }, []);

  // Sync URL → store. When an active workout exists it always wins over URL.
  useEffect(() => {
    const path = location.replace("/", "") || "home";
    if (activeWorkout) {
      if (currentPage !== "workout") setPage("workout");
      return;
    }
    if (PAGE_MAP[path] && path !== currentPage) setPage(path);
  }, [location, activeWorkout]);

  // Sync store → URL
  useEffect(() => {
    const path = "/" + currentPage;
    if (path !== location) setLocation(path, { replace: true });
  }, [currentPage]);

  // Show a minimal splash ONLY when there's no cached session at all
  // (first load, logged out). If there's a cached user we skip the splash
  // entirely so returning to the app feels instant.
  if (loading && !user) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M8 24L24 8L40 24L24 40L8 24Z" stroke="var(--green)" strokeWidth="2.5" fill="none" />
            <path d="M24 14L34 24L24 34L14 24L24 14Z" fill="var(--green)" opacity=".3" />
          </svg>
          <span>Pulse</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const role = profile?.role;
  const PageComponent = PAGE_MAP[currentPage] || HomePage;

  return (
    <div className={`app-shell${amoled ? " amoled" : ""}`}>
      <main className="app-main">
        <AnimatePresence mode="wait">
          <AnimatedPage key={currentPage}>
            <ErrorBoundary key={currentPage}>
              <PageComponent />
            </ErrorBoundary>
          </AnimatedPage>
        </AnimatePresence>
      </main>
      <Nav role={role} />
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
