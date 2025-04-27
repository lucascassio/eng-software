import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from './myBooks.module.scss'; // usa o mesmo estilo dos livros
import { TradeService } from '../services/tradeServices';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface Trade {
  tradeId: number;
  offeredBookTitle: string;
  targetBookTitle: string;
  status: string;
  requesterId: number;
  ownerId: number;
  requestDate: string;
}

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: string;
}

const MyTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyTrades = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) throw new Error('Token não encontrado.');

        const decoded = jwtDecode<JwtPayload>(token);
        const userId = Number(decoded.sub);

        const myTrades = await TradeService.getTradesByUserId(userId);
        setTrades(myTrades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar suas trocas');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTrades();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Minhas Trocas</h1>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : trades.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Você ainda não realizou nenhuma troca.</p>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {trades.map((trade) => (
              <div key={trade.tradeId} className={styles.bookCardWrapper}>
                <div style={{ padding: '1rem' }}>
                  <h3>Oferta: {trade.offeredBookTitle}</h3>
                  <p>Alvo: {trade.targetBookTitle}</p>
                  <p>Status: {trade.status}</p>
                  <p>Data: {new Date(trade.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyTrades;
