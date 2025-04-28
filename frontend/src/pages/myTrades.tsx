import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from './myTrades.module.scss';
import { TradeService } from '../services/tradeServices';
import { BookCard } from '../components/BookCard';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  year: number;
  pages: number;
  sinopse?: string;
  isAvailable: boolean;
  ownerId: number;
  registrationDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: boolean;
}

export interface Trade {
  tradeId: number;
  requesterId: number;
  offeredBookId: number;
  targetBookId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  offeredBook: Book;
  targetBook: Book;
  requester: User;
}

const MyTrades = () => {
  const [requestedTrades, setRequestedTrades] = useState<Trade[]>([]);
  const [receivedTrades, setReceivedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrades = async () => {
      try {
          setLoading(true);
          setError('');
  
          // Faz as duas requisições em paralelo
          const [myRequests, receivedRequests] = await Promise.all([
              TradeService.getMyRequests(),
              TradeService.getReceivedRequests()
          ]);
  
          console.log('Trocas solicitadas (myRequests):', myRequests);
          console.log('Trocas recebidas (receivedRequests):', receivedRequests);
  
          setRequestedTrades(myRequests);
          setReceivedTrades(receivedRequests);
  
      } catch (err) {
          console.error('Erro ao carregar trocas:', err);
          setError('Erro ao carregar suas trocas: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      } finally {
          setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const renderStatusBadge = (status: string) => {
    const statusMap = {
      Pending: { color: '#f39c12', bg: '#fef5e6' },
      Accepted: { color: '#27ae60', bg: '#e8f8f0' },
      Rejected: { color: '#e74c3c', bg: '#fdedec' },
      Completed: { color: '#3498db', bg: '#eaf2f8' },
      Canceled: { color: '#95a5a6', bg: '#f2f4f4' },
      DEFAULT: { color: '#7f8c8d', bg: '#ecf0f1' }
    };

    const style = statusMap[status as keyof typeof statusMap] || statusMap.DEFAULT;

    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {status}
      </span>
    );
  };

  const handleTradeAction = async (tradeId: number, action: 'accept' | 'reject' | 'cancel') => {
    try {
        const statusMap = {
            accept: 'Accepted',
            reject: 'Rejected',
            cancel: 'Cancelled'
        };

        await TradeService.changeStatus(tradeId, statusMap[action]);

        // Atualiza o estado
        setRequestedTrades(prev =>
            action === 'cancel'
                ? prev.filter(t => t.tradeId !== tradeId)
                : prev.map(t => t.tradeId === tradeId ? { ...t, status: statusMap[action] } : t)
        );

        setReceivedTrades(prev =>
            prev.map(t => t.tradeId === tradeId ? { ...t, status: statusMap[action] } : t)
        );

    } catch (err) {
        console.error(`Erro ao ${action} troca`, err);
        setError(`Erro ao ${action} troca: ${(err instanceof Error) ? err.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.title}>Minhas Trocas</h1>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando suas trocas...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Trocas Solicitadas */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Trocas que você solicitou
                <span className={styles.badge}>{requestedTrades.length}</span>
              </h2>

              {requestedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você ainda não solicitou nenhuma troca</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {requestedTrades.map(trade => (
                    <div key={trade.tradeId} className={styles.tradeCard}>
                      <div className={styles.tradeHeader}>
                        <span className={styles.tradeDate}>
                          {new Date(trade.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {renderStatusBadge(trade.status)}
                      </div>

                      <div className={styles.booksContainer}>
                        <div className={styles.bookCard}>
                          <h4>Você ofereceu:</h4>
                          <BookCard book={trade.offeredBook} compact />
                        </div>

                        <div className={styles.bookCard}>
                          <h4>Você solicitou:</h4>
                          <BookCard book={trade.targetBook} compact />
                        </div>
                      </div>

                      {trade.status === 'Pending' && (
                        <div className={styles.actions}>
                          <button 
                            onClick={() => handleTradeAction(trade.tradeId, 'cancel')}
                            className={styles.cancelButton}
                          >
                            Cancelar Troca
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Trocas Recebidas */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Trocas recebidas
                <span className={styles.badge}>{receivedTrades.length}</span>
              </h2>

              {receivedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você não recebeu nenhuma solicitação de troca</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {receivedTrades.map(trade => (
                    <div key={trade.tradeId} className={styles.tradeCard}>
                      <div className={styles.tradeHeader}>
                        <span className={styles.tradeDate}>
                          {new Date(trade.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {renderStatusBadge(trade.status)}
                        <div className={styles.requesterInfo}>
                          <span>Solicitado por: {trade.requester.name}</span>
                        </div>
                      </div>

                      <div className={styles.booksContainer}>
                        <div className={styles.bookCard}>
                          <h4>Oferecido:</h4>
                          <BookCard book={trade.offeredBook} compact />
                        </div>

                        <div className={styles.bookCard}>
                          <h4>Solicitou seu livro:</h4>
                          <BookCard book={trade.targetBook} compact />
                        </div>
                      </div>

                      {trade.status === 'Pending' && (
                        <div className={styles.actions}>
                          <button 
                            onClick={() => handleTradeAction(trade.tradeId, 'accept')}
                            className={styles.acceptButton}
                          >
                            Aceitar
                          </button>
                          <button 
                            onClick={() => handleTradeAction(trade.tradeId, 'reject')}
                            className={styles.rejectButton}
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyTrades;