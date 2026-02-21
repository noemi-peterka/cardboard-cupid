import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CollectionPage from "./pages/CollectionPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <SearchBar />
      <CollectionPage />
    </>
  );
}

export default App;
