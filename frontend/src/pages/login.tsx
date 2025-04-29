// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/userService';
import './login.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await AuthService.authenticate({
        Email: email,
        Password: password
      });
      
      navigate('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Carregando...' : 'Entrar'}
        </button>

        <div className="links">
          <p className="cadastrar-link" onClick={() => !isLoading && navigate('/register')}>
            Criar conta
          </p>
          <p className="recuperar-link" onClick={() => !isLoading && navigate('/recover-password')}>
            Esqueci minha senha
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;