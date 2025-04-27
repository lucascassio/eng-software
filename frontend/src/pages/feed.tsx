// src/pages/Feed/index.tsx
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookCard } from '../components/BookCard';
import { BookService } from '../services/bookServices';
import styles from './feed.module.scss';

interface Book {
    bookId: number;
    title: string;
    author: string;
    genre: string;
    publisher: string;
    year: number;
    sinopse?: string;
    isAvailable: boolean;
    pages: number;
    ownerId: number;
    registrationDate: string;
  }

const Feed = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await BookService.getAllBooks();
        console.log(booksData);
        setBooks(booksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar os livros');
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
              <BookCard 
                key={book.bookId} 
                book={book}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Feed;