import "./App.css";
import Header from "./components/Header";
import CollectionPage from "./pages/CollectionPage";
import SwipePage from "./pages/SwipePage";
import { useGame } from "./state/GameProvider";

function App() {
  const { state } = useGame();

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        {state.mode === "collection" && <CollectionPage />}
        {(state.mode === "feed" ||
          state.mode === "tournament" ||
          state.mode === "result") && <SwipePage />}
      </main>
    </div>
  );
}

export default App;
