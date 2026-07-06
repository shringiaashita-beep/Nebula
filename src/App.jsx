import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import useScreenshotPrevention from "./hooks/useScreenshotPrevention";

import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useScreenshotPrevention();

  return (
    <ThemeProvider>
      {/* Overlay shown when tab loses focus — prevents task-switcher screenshots on Android */}
      <div
        id="nebula-screenshot-overlay"
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: "#090A0F",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🔒</div>
        <p style={{ color: "#94A3B8", fontFamily: "Inter, sans-serif", fontSize: "0.9rem" }}>
          Content protected
        </p>
      </div>

      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
