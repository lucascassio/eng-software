// src/pages/Feed/index.tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookCard } from '../components/BookCard';
import { BookService, Book } from '../services/bookServices';
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
      try {
        const booksData = await BookService.getAllBooks();
        setBooks(booksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar os livros');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      const filtered = books.filter(b => b.ownerId.toString() !== currentUserId);
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [books, currentUserId]);

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Livros Disponíveis</h1>

        {loading ? (
          <p>Carregando livros...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.booksGrid}>
            {filteredBooks.map(book => (
              <BookCard key={book.bookId} book={book} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
