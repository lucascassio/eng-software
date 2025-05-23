// src/components/BookCard/index.tsx
import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import { TradeService } from '../../services/tradeServices';
import { BookService } from '../../services/bookServices';
import { Modal } from '../Modal';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface BookCardProps {
  book: {
    bookId: number;
    title: string;
    author: string;
    genre: string;
    publisher: string;
    year: number;
    sinopse?: string;
    isAvailable: boolean;
    ownerId: number;
    registrationDate: string;
    coverImageUrl?: string;  // ex.: "/images/uuid.jpg"
  };
}

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: string;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [myBooks, setMyBooks] = useState<BookCardProps['book'][]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUserId(Number(decoded.sub));
      } catch {
        console.error('Erro ao decodificar token');
      }
    }
  }, []);

  const fetchMyBooks = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const books = await BookService.getBooksByUserId(userId);
      setMyBooks(books);
    } catch {
      setError('Erro ao carregar seus livros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestClick = async () => {
    await fetchMyBooks();
    setShowTradeModal(true);
  };

  const handleTradeSubmit = async () => {
    if (!selectedBookId) {
      setError('Selecione um livro para oferecer em troca');
      return;
    }
    setIsLoading(true);
    try {
      await TradeService.createTrade({
        OfferedBookId: selectedBookId,
        TargetBookId: book.bookId
      });
      setShowTradeModal(false);
      alert('Solicitação de troca enviada com sucesso!');
    } catch {
      setError('Erro ao solicitar troca');
    } finally {
      setIsLoading(false);
    }
  };

  // monta a URL absoluta para o image src
  const imageSrc = book.coverImageUrl
    ? `http://localhost:5185${book.coverImageUrl}`
    : undefined;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.coverContainer}>
          {imageSrc
            ? <img src={imageSrc} alt={`Capa de ${book.title}`} className={styles.cover} />
            : <div className={styles.placeholder}>Sem Capa</div>
          }
        </div>

        <div className={styles.header}>
          <h3 className={styles.title}>{book.title}</h3>
          <span className={`${styles.status} ${book.isAvailable ? styles.available : styles.unavailable}`}>
            {book.isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
        </div>

        <div className={styles.details}>
          <p><strong>Autor:</strong> {book.author}</p>
          <p><strong>Gênero:</strong> {book.genre}</p>
          <p><strong>Editora:</strong> {book.publisher}</p>
          <p><strong>Ano:</strong> {book.year}</p>
        </div>

        {book.sinopse && (
          <div className={styles.sinopse}>
            <p><strong>Sinopse:</strong> {book.sinopse}</p>
          </div>
        )}

        <button
          className={styles.interesseButton}
          onClick={handleInterestClick}
          disabled={!book.isAvailable}
        >
          Tenho interesse
        </button>
      </div>

      <Modal isOpen={showTradeModal} onClose={() => setShowTradeModal(false)}>
        <h2>Solicitar Troca</h2>
        <p>Você está solicitando o livro: <strong>{book.title}</strong></p>
        <div className={styles.tradeForm}>
          <label>
            Selecione um dos seus livros para oferecer em troca:
            <select
              value={selectedBookId || ''}
              onChange={e => setSelectedBookId(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value="">Selecione um livro</option>
              {myBooks.map(myBook => (
                <option key={myBook.bookId} value={myBook.bookId}>
                  {myBook.title} - {myBook.author}
                </option>
              ))}
            </select>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowTradeModal(false)}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              className={styles.saveButton}
              onClick={handleTradeSubmit}
              disabled={isLoading || !selectedBookId}
            >
              {isLoading ? 'Enviando...' : 'Solicitar Troca'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BookCard;
