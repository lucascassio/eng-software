// pages/MyBooks.tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MyBookCard } from '../components/MyBookCard';
import { BookService } from '../services/bookServices';
import styles from './myBooks.module.scss';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import BookForm from '../components/BookForm';

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

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: string;
}

const MyBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [newBookData, setNewBookData] = useState<Omit<Book, 'bookId' | 'ownerId' | 'registrationDate'>>({
    title: '',
    author: '',
    genre: '',
    publisher: '',
    year: new Date().getFullYear(),
    pages: 0,
    sinopse: '',
    isAvailable: true
  });
  const [editBookData, setEditBookData] = useState<Book | null>(null);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) throw new Error('Token não encontrado.');

        const decoded = jwtDecode<JwtPayload>(token);
        const userId = Number(decoded.sub);

        const myBooks = await BookService.getBooksByUserId(userId);
        setBooks(myBooks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar seus livros');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBookData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'pages' ? Number(value) : value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editBookData) return;

    const { name, value } = e.target;
    setEditBookData({
      ...editBookData,
      [name]: name === 'year' || name === 'pages' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBook: Omit<Book, 'bookId'> = {
        ...newBookData,
        ownerId: 1, 
        registrationDate: new Date().toISOString(),
      };

      const createdBook = await BookService.createBook(newBook);
      setBooks(prev => [...prev, createdBook]);
      setShowModal(false);
      setNewBookData({
        title: '',
        author: '',
        genre: '',
        publisher: '',
        year: new Date().getFullYear(),
        pages: 0,
        sinopse: '',
        isAvailable: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar livro');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBookData) return;

    try {
      await BookService.updateBook(editBookData.bookId, {
        ...editBookData
      });

      setBooks(prev => prev.map(book =>
        book.bookId === editBookData.bookId ? editBookData : book
      ));
      setEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar livro');
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este livro?')) return;

    try {
      await BookService.deleteBook(bookId);
      setBooks(prev => prev.filter(book => book.bookId !== bookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir livro');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.main}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Meus Livros</h1>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addBookButton}
          >
            + Adicionar Livro
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Você ainda não tem livros cadastrados</p>
            <button
              onClick={() => setShowModal(true)}
              className={styles.addBookButton}
            >
              Adicionar Primeiro Livro
            </button>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map(book => (
              <div key={book.bookId} className={styles.bookCardWrapper}>
                <MyBookCard book={book} />
                <div className={styles.actions}>
                  <button
                    onClick={() => {
                      setEditBookData(book);
                      setEditModal(true);
                    }}
                    className={styles.editButton}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.bookId)}
                    className={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Criação */}
        {showModal && (
          <BookForm
            title="Adicionar Novo Livro"
            bookData={newBookData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}

        {/* Modal de Edição */}
        {editModal && editBookData && (
          <BookForm
            title="Editar Livro"
            bookData={editBookData}
            onChange={handleEditInputChange}
            onSubmit={handleEditSubmit}
            onClose={() => setEditModal(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyBooks;
