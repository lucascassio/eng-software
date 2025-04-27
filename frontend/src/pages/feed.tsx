// src/pages/Feed/index.tsx
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BookCard } from '../components/BookCard';
import { BookService } from '../services/bookServices';
import styles from './feed.module.scss';
import Cookies from 'js-cookie';
import { jwtDecode }  from 'jwt-decode';

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

interface JwtPayload {
    sub: string; // ID do usuário como string
    name: string;
    email: string;
    course: string;
    registrationDate: string;
    isActive: string;
}

const Feed = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Obter o ID do usuário atual do token JWT
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setCurrentUserId(decoded.sub); // Usando sub como ID do usuário
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
    if (currentUserId !== null && books.length > 0) {
      // Filtra os livros para mostrar apenas os que não pertencem ao usuário atual
      // Convertendo ownerId para string para comparar com o sub (que é string)
      const filtered = books.filter(book => book.ownerId.toString() !== currentUserId);
      setFilteredBooks(filtered);
    } else {
      // Se não houver usuário logado, mostra todos os livros
      setFilteredBooks(books);
    }
  }, [books, currentUserId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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