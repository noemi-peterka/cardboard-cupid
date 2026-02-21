import "./App.css";
import Header from "./components/Header";
import CollectionPage from "./pages/CollectionPage";
import SwipePage from "./pages/SwipePage";
import { useGame } from "./state/GameProvider";

function App() {
  const { state } = useGame();

  return (
    <>
      <Header />
      {state.mode === "collection" && <CollectionPage />}
      {(state.mode === "feed" ||
        state.mode === "tournament" ||
        state.mode === "result") && <SwipePage />}
    </>
  );
}

export default App;
