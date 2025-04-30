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
  isActive: string; }

const Feed: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // useEffect para buscar User ID (sem alterações)
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setCurrentUserId(decoded.sub);
      } catch (err) { console.error('Erro ao decodificar o token:', err); }
    }
  }, []);

  // Efeito para buscar TODOS os livros da API (VOLTANDO A USAR DADOS DIRETOS)
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Busca os dados brutos
        const booksData = await BookService.getAllBooks();

        // DEBUG: Verificar dados brutos recebidos (ainda útil)
        console.log('[DEBUG Feed] Dados BRUTOS recebidos de BookService.getAllBooks():', JSON.stringify(booksData, null, 2));

        // 2. Define o estado DIRETAMENTE com os dados recebidos
        // REMOVEMOS O PROCESSAMENTO DA API_BASE_URL DAQUI
        setBooks(booksData || []); // Usa array vazio como fallback se booksData for null/undefined

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar os livros');
        console.error('[ERRO Feed] Falha ao buscar livros:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []); // Executa apenas uma vez

  // Efeito para FILTRAR os livros (LÓGICA CORRIGIDA COM isAvailable MANTIDA)
  useEffect(() => {
    let filtered: Book[] = [];
    // Certifica que 'books' é um array antes de filtrar
    const booksArray = Array.isArray(books) ? books : [];

    if (currentUserId !== null) {
      // Filtra livros que NÃO são do usuário E ESTÃO disponíveis
      filtered = booksArray.filter(
        b => b.ownerId.toString() !== currentUserId && b.isAvailable
      );
    } else {
      // Se não há usuário logado, mostra apenas os livros disponíveis
      filtered = booksArray.filter(b => b.isAvailable);
    }
    // DEBUG: Log do resultado do filtro
    console.log(`[DEBUG Feed] Resultado do filtro (currentUserId: ${currentUserId}):`, filtered);
    setFilteredBooks(filtered);
  }, [books, currentUserId]); // Re-executa quando 'books' ou 'currentUserId' mudam

  // --- RESTANTE DO COMPONENTE (JSX para renderização) ---
  // Nenhuma alteração necessária aqui, pois 'books' agora terá a URL correta vinda da API
  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Livros Disponíveis para Troca</h1>
        {loading ? (
          <div className={styles.loading}> <div className={styles.spinner}></div> <p>Carregando livros...</p> </div>
        ) : error ? (
          <div className={styles.error}> <p>⚠️ {error}</p> </div>
        ) : (
          filteredBooks.length > 0 ? (
            <div className={styles.booksGrid}>
              {filteredBooks.map(book => (
                <BookCard key={book.bookId} book={book} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
               <p>Nenhum livro disponível para troca no momento que corresponda aos critérios.</p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Feed;