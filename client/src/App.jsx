import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ExploreSearch from "./pages/ExploreSearch";
import PublicProfile from "./pages/PublicProfile";
import SwapChat from "./pages/SwapChat";
import AdminPanel from "./pages/AdminPanel";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuth();
  if (!user || !token) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <SocketProvider>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Authentication Routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Member Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExploreSearch />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<Navigate to="/explore" replace />} />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/swaps"
          element={
            <ProtectedRoute>
              <SwapChat />
            </ProtectedRoute>
          }
        />

        {/* Protected Administrative Route (FR12) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}
