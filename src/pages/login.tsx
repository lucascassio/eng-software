import React, { useState } from 'react';
import './login.scss';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login com:', email, senha);
    // autenticação virá depois
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>

        <p className="recuperar-link" onClick={() => navigate('/recuperar-senha')}>
          Esqueceu a senha?
        </p>
        <p
        className="cadastrar-link"
        onClick={() => navigate('/cadastro')}
        >
        Não tem uma conta? Cadastre-se
        </p>
      </form>
    </div>
  );
};

export default Login;
