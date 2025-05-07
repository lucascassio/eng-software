import React, { useState } from 'react';
import './recoverPassword.scss';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('E-mail digitado:', email);
  };

  return (
    <div className="recover-container">
      <form onSubmit={handleSubmit}>
        <h2>Recuperar Senha</h2>
        <label htmlFor="email">Digite seu e-mail</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seuemail@exemplo.com"
        />
        <button type="submit">Enviar link de recuperação</button>
      </form>
    </div>
  );
};

export default RecoverPassword;
