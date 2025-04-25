// src/components/BookCard/index.tsx
import React from 'react';
import styles from './styles.module.scss';

interface BookCardProps {
  book: {
    BookId: number;
    Title: string;
    Author: string;
    Genre: string;
    Publisher: string;
    Year: number;
    Sinopse?: string;
    IsAvailable: boolean;
  };
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{book.Title}</h3>
        <span className={`${styles.status} ${book.IsAvailable ? styles.available : styles.unavailable}`}>
          {book.IsAvailable ? 'Disponível' : 'Indisponível'}
        </span>
      </div>
      
      <div className={styles.details}>
        <p><strong>Autor:</strong> {book.Author}</p>
        <p><strong>Gênero:</strong> {book.Genre}</p>
        <p><strong>Editora:</strong> {book.Publisher}</p>
        <p><strong>Ano:</strong> {book.Year}</p>
      </div>
      
      {book.Sinopse && (
        <div className={styles.sinopse}>
          <p><strong>Sinopse:</strong> {book.Sinopse}</p>
        </div>
      )}
      
      <button className={styles.interesseButton}>
        Tenho interesse
      </button>
    </div>
  );
};