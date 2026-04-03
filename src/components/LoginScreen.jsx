import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Usuario o contraseña incorrectos. Compruébalo e inténtalo de nuevo.');
      } else {
        setError('No se pudo iniciar sesión. Comprueba tu conexión o intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        <section className="hero-card">
          <h1>PROYSESA</h1>
          <p>Gestión de documentación de obras.</p>
          <ul>
            <li>Login de usuarios</li>
            <li>Checklist por obra</li>
            <li>Subida documental</li>
            <li>Aprobación por cliente</li>
          </ul>
        </section>
        <form className="panel card" onSubmit={handleSubmit}>
          <h2>Acceder</h2>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <div className="error">{error}</div> : null}
          <button disabled={loading} style={{ marginTop: '16px' }}>{loading ? 'Entrando...' : 'Iniciar sesión'}</button>
        </form>
      </div>
    </div>
  );
}
