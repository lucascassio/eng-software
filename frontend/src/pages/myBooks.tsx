// src/pages/MyBooks.tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import BookForm, { BookRequestDTO } from '../components/BookForm';
import { BookCard } from '../components/MyBooksCard';
import { BookService, Book } from '../services/bookServices';
import styles from './myBooks.module.scss';
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

const MyBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [newBookData, setNewBookData] = useState<BookRequestDTO>({
    title: '',
    author: '',
    genre: '',
    publisher: '',
    pages: 0,
    year: new Date().getFullYear(),
    sinopse: '',
    coverImage: undefined,
    isAvailable: true
  });

  // agora aceita coverImage no estado de edição
  const [editBookData, setEditBookData] = useState<Book & { coverImage?: File } | null>(null);

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
    const { name, value, type } = e.target;
    setNewBookData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    } as BookRequestDTO));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setNewBookData(prev => ({ ...prev, coverImage: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await BookService.createBook(newBookData);
      // refetch para obter coverImageUrl
      const full = await BookService.getBookById(created.bookId);
      setBooks(prev => [...prev, full]);
      setShowModal(false);
      setNewBookData({ title: '', author: '', genre: '', publisher: '', pages: 0, year: new Date().getFullYear(), sinopse: '', coverImage: undefined, isAvailable: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar livro');
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editBookData) return;
    const { name, value, type } = e.target;
    setEditBookData({
      ...editBookData,
      [name]: type === 'number' ? Number(value) : value
    } as Book & { coverImage?: File });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editBookData) return;
    const file = e.target.files?.[0];
    setEditBookData({ ...editBookData, coverImage: file });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBookData) return;
    try {
      const updated = await BookService.updateBook(editBookData.bookId, {
        title: editBookData.title,
        author: editBookData.author,
        genre: editBookData.genre,
        publisher: editBookData.publisher,
        pages: editBookData.pages,
        year: editBookData.year,
        sinopse: editBookData.sinopse,
        isAvailable: editBookData.isAvailable,
        coverImage: editBookData.coverImage
      });
      setBooks(prev => prev.map(b => b.bookId === updated.bookId ? updated : b));
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
          <button onClick={() => setShowModal(true)} className={styles.addBookButton}>+ Adicionar Livro</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : books.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Você ainda não tem livros cadastrados</p>
            <button onClick={() => setShowModal(true)} className={styles.addBookButton}>Adicionar Primeiro Livro</button>
          </div>
        ) : (
          <div className={styles.booksGrid}>
            {books.map(book => (
              <div key={book.bookId} className={styles.bookCardWrapper}>
                <BookCard book={book} />
                <div className={styles.actions}>
                  <button onClick={() => { setEditBookData(book); setEditModal(true); }} className={styles.editButton}>Editar</button>
                  <button onClick={() => handleDeleteBook(book.bookId)} className={styles.deleteButton}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <BookForm
            title="Adicionar Novo Livro"
            bookData={newBookData}
            onChange={handleInputChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}

        {editModal && editBookData && (
          <BookForm
            title="Editar Livro"
            bookData={editBookData}
            onChange={handleEditInputChange}
            onFileChange={handleEditFileChange}
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
