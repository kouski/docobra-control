import { useAuthUser } from './hooks/useAuthUser';
import { LoginScreen } from './components/LoginScreen';
import { AppShell } from './components/AppShell';

export default function App() {
  const { profile, loading } = useAuthUser();

  if (loading) {
    return <div className="loading-screen">Cargando aplicación...</div>;
  }

  if (!profile) {
    return <LoginScreen />;
  }

  return <AppShell user={profile} />;
}
