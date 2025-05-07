// src/pages/Feed/index.tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookCard } from '../components/BookCard';
import { BookService } from '../services/bookServices';
import type { Book } from '../services/bookServices';
import styles from './feed.module.scss';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: string;
}

const Feed: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setCurrentUserId(decoded.sub);
      } catch (err) {
        console.error('Erro ao decodificar o token:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const booksData = await BookService.getAllBooks();
        setBooks(booksData || []);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError('Ainda não há livros disponíveis.');
        } else {
          setError(err.message || 'Erro ao carregar os livros');
        }
        console.error('[ERRO Feed] Falha ao buscar livros:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    let filtered: Book[] = [];
    const booksArray = Array.isArray(books) ? books : [];

    if (currentUserId !== null) {
      filtered = booksArray.filter(
        b => b.ownerId.toString() !== currentUserId && b.isAvailable
      );
    } else {
      filtered = booksArray.filter(b => b.isAvailable);
    }
    setFilteredBooks(filtered);
  }, [books, currentUserId]);

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Livros Disponíveis para Troca</h1>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando livros...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>⚠️ {error}</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className={styles.booksGrid}>
            {filteredBooks.map(book => (
              <div key={book.bookId} className={styles.cardWrapper}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum livro disponível para troca no momento que corresponda aos critérios.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Feed;