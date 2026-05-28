import HomePage from "./pages/HomePage.jsx";
import StartWorkoutPage from "./pages/StartWorkoutPage.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx";
import ExercisesPage from "./pages/ExercisesPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import WorkoutDetailPage from "./pages/WorkoutDetailPage.jsx";
import CoachPage from "./pages/CoachPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import BodyMetricsPage from "./pages/BodyMetricsPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import Nav from "./components/Nav.jsx";
import useStore from "./store/useStore.js";

export default function App() {
  const currentPage = useStore((state) => state.currentPage);
  return (
    <div className="app-shell">
      <main className="app-main">
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
      </main>
      <Nav />
    </div>
  );
}
