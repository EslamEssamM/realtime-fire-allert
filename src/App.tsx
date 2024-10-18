import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import client from "./client";
import { useScreens } from "./hooks/useScreens";

import ScreensContext from "./contexts/ScreensContext";

import AllScreens from "./pages/AllScreens";
import AdminPage from "./pages/AdminPage";
import ScreenPage from "./pages/ScreenPage";
import "./global.css";

function App() {
  const [screens, setScreens] = useScreens(client);

  return (
    <Router>
      <ScreensContext.Provider value={{ screens, setScreens }}>
        <div className="App container py-4 px-3">
          <Routes>
            <Route path="/" element={<Navigate to="/all-screens" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/all-screens" element={<AllScreens />} />
            <Route path="/screen/:id" element={<ScreenPage />} />
          </Routes>
        </div>
      </ScreensContext.Provider>
    </Router>
  );
}

export default App;
