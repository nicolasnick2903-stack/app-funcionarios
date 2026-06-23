import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SplashScreen from "@/screens/SplashScreen";
import BottomNav from "@/components/BottomNav";
import LoginScreen from "@/screens/LoginScreen";
import HomeScreen from "@/screens/HomeScreen";
import PontoScreen from "@/screens/PontoScreen";
import FeriasScreen from "@/screens/FeriasScreen";
import AtestadoScreen from "@/screens/AtestadoScreen";
import FeedScreen from "@/screens/FeedScreen";
import FuncionariosScreen from "@/screens/admin/FuncionariosScreen";
import CadastroFuncionarioScreen from "@/screens/admin/CadastroFuncionarioScreen";
import AdminPontoScreen from "@/screens/admin/AdminPontoScreen";
import AdminFeriasScreen from "@/screens/admin/AdminFeriasScreen";
import CondominiosScreen from "@/screens/admin/CondominiosScreen";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, carregando } = useAuth();
  if (carregando) {
    return (
      <div className="loading-screen">
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
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (carregando) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <LoginScreen />} />
        <Route path="/home" element={<AuthGuard><AppLayout><HomeScreen /></AppLayout></AuthGuard>} />
        <Route path="/ponto" element={<AuthGuard><AppLayout><PontoScreen /></AppLayout></AuthGuard>} />
        <Route path="/ferias" element={<AuthGuard><AppLayout><FeriasScreen /></AppLayout></AuthGuard>} />
        <Route path="/atestado" element={<AuthGuard><AppLayout><AtestadoScreen /></AppLayout></AuthGuard>} />
        <Route path="/feed" element={<AuthGuard><AppLayout><FeedScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/funcionarios" element={<AuthGuard><AppLayout><FuncionariosScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/funcionarios/novo" element={<AuthGuard><AppLayout><CadastroFuncionarioScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/ponto" element={<AuthGuard><AppLayout><AdminPontoScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/ferias" element={<AuthGuard><AppLayout><AdminFeriasScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/condominios" element={<AuthGuard><AppLayout><CondominiosScreen /></AppLayout></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
