// src/pages/Feed/index.tsx
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookCard } from '../components/BookCard';
import axios from 'axios';
import styles from './feed.module.scss';

interface Book {
  BookId: number;
  Title: string;
  Author: string;
  Genre: string;
  Publisher: string;
  Year: number;
  Sinopse?: string;
  IsAvailable: boolean;
}

const Feed = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5185/api/books');
        setBooks(response.data);
      } catch (err) {
        setError('Erro ao carregar os livros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main className={styles.main}>
        <h1 className={styles.title}>Feed de Livros</h1>
        
        {loading ? (
          <p>Carregando livros...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.booksGrid}>
            {books.map(book => (
              <BookCard key={book.BookId} book={book} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Feed;