// src/components/BookCard/index.tsx
import React from 'react';
import styles from './styles.module.scss';

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
    coverImageUrl?: string; // ex.: "/images/uuid.jpg"
  };
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  // monta a URL absoluta para o image src
  const imageSrc = book.coverImageUrl
    ? `http://localhost:5185${book.coverImageUrl}`
    : undefined;

  return (
    <div className={styles.card}>
      <div className={styles.coverContainer}>
        {imageSrc ? (
          <img src={imageSrc} alt={`Capa de ${book.title}`} className={styles.cover} />
        ) : (
          <div className={styles.placeholder}>Sem Capa</div>
        )}
      </div>

      <div className={styles.header}>
        <h3 className={styles.title}>{book.title}</h3>
        <span
          className={`${styles.status} ${
            book.isAvailable ? styles.available : styles.unavailable
          }`}
        >
          {book.isAvailable ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      <div className={styles.details}>
        <p>
          <strong>Autor:</strong> {book.author}
        </p>
        <p>
          <strong>Gênero:</strong> {book.genre}
        </p>
        <p>
          <strong>Editora:</strong> {book.publisher}
        </p>
        <p>
          <strong>Ano:</strong> {book.year}
        </p>
      </div>

      {book.sinopse && (
        <div className={styles.sinopse}>
          <p>
            <strong>Sinopse:</strong> {book.sinopse}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCard;