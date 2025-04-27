import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import RecoverPassword from './pages/recoverPassword';
import Register from './pages/register';
import Feed from './pages/feed';
import MyBooks from './pages/myBooks';
import MyTrades from './pages/myTrades';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/myBooks" element={< MyBooks/>} />
        <Route path="/myTrades" element={<MyTrades />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
