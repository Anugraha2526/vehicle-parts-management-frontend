import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response);

      const role = response.role?.toLowerCase() || '';
      if (role === 'customer') {
        navigate(`/my-profile/${response.id}`);
      } else if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/'); // Default fallback
      }
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', padding: '20px' }}>
      <div className="cs-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--accent)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, margin: '0 auto 16px' }}>C</div>
            <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 700 }}>Welcome Back</h1>
            <p style={{ color: 'var(--ink-500)', marginTop: '8px' }}>Login to manage your profile</p>
        </div>

        <form onSubmit={handleLogin} className="cs-form">
          {error && <div className="cs-alert cs-alert--error" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          <div className="cs-field">
            <label>Email Address</label>
            <input type="email" className="cs-input" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="cs-field" style={{ marginTop: '16px' }}>
            <label>Password</label>
            <input type="password" className="cs-input" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="cs-button cs-button--primary" style={{ width: '100%', marginTop: '24px', padding: '14px' }}>Sign In</button>
          
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--ink-500)' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
