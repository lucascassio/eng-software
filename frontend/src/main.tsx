import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import RecoverPassword from './pages/recoverPassword';
import Register from './pages/register';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar-senha" element={<RecoverPassword />} />
        <Route path="/cadastro" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
