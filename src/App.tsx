import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import LoginScreen from "@/screens/LoginScreen";
import HomeScreen from "@/screens/HomeScreen";
import PontoScreen from "@/screens/PontoScreen";
import FeriasScreen from "@/screens/FeriasScreen";
import AtestadoScreen from "@/screens/AtestadoScreen";
import FeedScreen from "@/screens/FeedScreen";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <main className="main-content">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { user, carregando } = useAuth();

  if (carregando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <LoginScreen />}
        />
        <Route
          path="/home"
          element={
            <AuthGuard>
              <AppLayout>
                <HomeScreen />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/ponto"
          element={
            <AuthGuard>
              <AppLayout>
                <PontoScreen />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/ferias"
          element={
            <AuthGuard>
              <AppLayout>
                <FeriasScreen />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/atestado"
          element={
            <AuthGuard>
              <AppLayout>
                <AtestadoScreen />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/feed"
          element={
            <AuthGuard>
              <AppLayout>
                <FeedScreen />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
