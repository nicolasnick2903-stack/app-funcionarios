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
import PerfilScreen from "@/screens/PerfilScreen";
import FuncionariosScreen from "@/screens/admin/FuncionariosScreen";
import CadastroFuncionarioScreen from "@/screens/admin/CadastroFuncionarioScreen";
import AdminPontoScreen from "@/screens/admin/AdminPontoScreen";
import AdminFeriasScreen from "@/screens/admin/AdminFeriasScreen";
import AdminAtestadosScreen from "@/screens/admin/AdminAtestadosScreen";
import CondominiosScreen from "@/screens/admin/CondominiosScreen";
import FornecedoresScreen from "@/screens/admin/FornecedoresScreen";
import FinanceiroScreen from "@/screens/admin/FinanceiroScreen";
import OrdemServicoScreen from "@/screens/admin/OrdemServicoScreen";
import ChecklistScreen from "@/screens/admin/ChecklistScreen";
import RelatorioMensalScreen from "@/screens/admin/RelatorioMensalScreen";
import OcorrenciaScreen from "@/screens/admin/OcorrenciaScreen";
import AvaliacaoScreen from "@/screens/admin/AvaliacaoScreen";
import EscalaScreen from "@/screens/admin/EscalaScreen";
import ReciboScreen from "@/screens/admin/ReciboScreen";
import PesquisaSatisfacaoScreen from "@/screens/admin/PesquisaSatisfacaoScreen";

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
        <Route path="/perfil" element={<AuthGuard><AppLayout><PerfilScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/funcionarios" element={<AuthGuard><AppLayout><FuncionariosScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/funcionarios/novo" element={<AuthGuard><AppLayout><CadastroFuncionarioScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/ponto" element={<AuthGuard><AppLayout><AdminPontoScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/ferias" element={<AuthGuard><AppLayout><AdminFeriasScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/atestados" element={<AuthGuard><AppLayout><AdminAtestadosScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/condominios" element={<AuthGuard><AppLayout><CondominiosScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/fornecedores" element={<AuthGuard><AppLayout><FornecedoresScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/financeiro" element={<AuthGuard><AppLayout><FinanceiroScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/os" element={<AuthGuard><AppLayout><OrdemServicoScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/checklist" element={<AuthGuard><AppLayout><ChecklistScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/relatorio" element={<AuthGuard><AppLayout><RelatorioMensalScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/ocorrencia" element={<AuthGuard><AppLayout><OcorrenciaScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/avaliacao" element={<AuthGuard><AppLayout><AvaliacaoScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/escala" element={<AuthGuard><AppLayout><EscalaScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/recibo" element={<AuthGuard><AppLayout><ReciboScreen /></AppLayout></AuthGuard>} />
        <Route path="/admin/pesquisa" element={<AuthGuard><AppLayout><PesquisaSatisfacaoScreen /></AppLayout></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
