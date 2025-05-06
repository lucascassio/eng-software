import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from './myTrades.module.scss';
import { TradeService } from '../services/tradeServices';

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
  coverImageUrl?: string;
}

interface Trade {
  tradeId: number;
  requesterId: number;
  offeredBookId: number;
  targetBookId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  contactInfo?: string; // Adicionado para incluir o campo contactInfo
  offeredBook: Book;
  targetBook: Book;
}

const MyTrades = () => {
  const [requestedTrades, setRequestedTrades] = useState<Trade[]>([]);
  const [receivedTrades, setReceivedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactInput, setContactInput] = useState<{ [key: number]: string }>({}); // Estado para armazenar contactInfo por ID de troca

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError('');
        const [myRequests, receivedRequests] = await Promise.all([
          TradeService.getMyRequests(),
          TradeService.getReceivedRequests()
        ]);

        setRequestedTrades(myRequests);
        setReceivedTrades(receivedRequests);
      } catch (err) {
        setError('Erro ao carregar suas trocas: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
        console.error('[ERRO] Falha ao buscar trocas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  const renderStatusBadge = (status: string) => {
    const statusMap = {
      Pending: { color: '#f39c12', bg: '#fef5e6', text: 'Pendente' },
      Accepted: { color: '#27ae60', bg: '#e8f8f0', text: 'Aceita' },
      Rejected: { color: '#e74c3c', bg: '#fdedec', text: 'Rejeitada' },
      Completed: { color: '#3498db', bg: '#eaf2f8', text: 'Concluída' },
      Cancelled: { color: '#95a5a6', bg: '#f2f4f4', text: 'Cancelada' },
      DEFAULT: { color: '#7f8c8d', bg: '#ecf0f1', text: status }
    };
    const style = statusMap[status as keyof typeof statusMap] || statusMap.DEFAULT;
    const text = style.text;
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
      >
        {text}
      </span>
    );
  };

  const handleTradeAction = async (
    tradeId: number,
    action: 'accept' | 'reject' | 'cancel' | 'complete'
  ) => {
    const statusMapToAction = {
      accept: 'Accepted',
      reject: 'Rejected',
      cancel: 'Cancelled',
      complete: 'Completed'
    };
    const actionTextMap = {
      accept: 'aceitar',
      reject: 'rejeitar',
      cancel: 'cancelar',
      complete: 'concluir'
    };
    const newStatus = statusMapToAction[action];
    const actionText = actionTextMap[action];
    try {
      setError('');
      await TradeService.changeStatus(tradeId, newStatus);
      setRequestedTrades((prev) =>
        prev.map((t) => (t.tradeId === tradeId ? { ...t, status: newStatus } : t))
      );
      setReceivedTrades((prev) =>
        prev.map((t) => (t.tradeId === tradeId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(`Erro ao ${actionText} troca ${tradeId}`, err);
      setError(
        `Erro ao ${actionText} troca: ${
          err instanceof Error ? err.message : 'Erro desconhecido'
        }`
      );
    }
  };

  const handleContactInfoSubmit = async (tradeId: number) => {
    const contactInfo = contactInput[tradeId];
    if (!contactInfo) {
      setError('Você precisa fornecer informações de contato.');
      return;
    }
    try {
      setError('');
      const updatedTrade = await TradeService.updateContactInfo(tradeId, contactInfo);
      setRequestedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === tradeId ? { ...trade, contactInfo } : trade
        )
      );
      setReceivedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === tradeId ? { ...trade, contactInfo } : trade
        )
      );
      setContactInput((prev) => ({ ...prev, [tradeId]: '' })); // Limpa o valor do input após o envio
    } catch (err) {
      console.error('Erro ao enviar informações de contato:', err);
      setError(
        `Erro ao enviar informações de contato: ${
          err instanceof Error ? err.message : 'Erro desconhecido'
        }`
      );
    }
  };

  const TradeBook = ({ book }: { book: Book }) => {
    return (
      <div className={styles.tradeBookCard}>
        <div className={styles.bookCover}>
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`Capa de ${book.title}`}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.placeholder}>Sem Capa</div>
          )}
        </div>
        <div className={styles.bookInfo}>
          <div className={styles.bookTitle} title={book.title}>
            {book.title}
          </div>
          <div className={styles.bookAuthor}>{book.author}</div>
          <div className={styles.bookMeta}>
            <span className={styles.tag}>{book.genre}</span>
            <span className={styles.tag}>{book.year}</span>
          </div>
        </div>
      </div>
    );
  };

  const TradeCardDisplay = ({
    trade,
    type
  }: {
    trade: Trade;
    type: 'requested' | 'received';
  }) => {
    const isReceived = type === 'received';

    return (
      <div className={styles.tradeCard}>
        <div className={styles.tradeHeader}>
          <span className={styles.tradeDate}>
            {new Date(trade.createdAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          {renderStatusBadge(trade.status)}
        </div>
        <div className={styles.booksContainer}>
          <div className={styles.tradeBookSection}>
            <h4>{isReceived ? 'Livro Oferecido por quem solicitou:' : 'Você ofereceu:'}</h4>
            <TradeBook book={trade.offeredBook} />
          </div>
          <div className={styles.tradeBookSection}>
            <h4>{isReceived ? 'Seu livro solicitado:' : 'Você solicitou:'}</h4>
            <TradeBook book={trade.targetBook} />
          </div>
        </div>
        <div className={styles.actions}>
          {trade.status === 'Completed' && !trade.contactInfo && (
            <div className={styles.contactForm}>
              <input
                type="text"
                placeholder="Forneça informações de contato"
                value={contactInput[trade.tradeId] || ''}
                onChange={(e) =>
                  setContactInput((prev) => ({
                    ...prev,
                    [trade.tradeId]: e.target.value
                  }))
                }
              />
              <button
                onClick={() => handleContactInfoSubmit(trade.tradeId)}
                className={`${styles.actionButton} ${styles.contactButton}`}
              >
                Enviar Contato
              </button>
            </div>
          )}
          {trade.contactInfo && (
            <p className={styles.contactInfo}>
              Contato: <strong>{trade.contactInfo}</strong>
            </p>
          )}
        </div>
      </div>
    );
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
            <p>⚠️ {error}</p>
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Trocas que você solicitou</h2>
              {requestedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você ainda não solicitou nenhuma troca.</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {requestedTrades.map((trade) => (
                    <TradeCardDisplay
                      key={`req-${trade.tradeId}`}
                      trade={trade}
                      type="requested"
                    />
                  ))}
                </div>
              )}
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Solicitações de troca recebidas</h2>
              {receivedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você não recebeu nenhuma solicitação de troca.</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {receivedTrades.map((trade) => (
                    <TradeCardDisplay
                      key={`rec-${trade.tradeId}`}
                      trade={trade}
                      type="received"
                    />
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