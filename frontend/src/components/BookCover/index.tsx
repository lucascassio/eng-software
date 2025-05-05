import React from 'react';
import styles from './BookCover.module.scss';

interface BookCoverProps {
  title: string;
  coverImageUrl?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ title, coverImageUrl }) => {
  // --- DEBUG: Verificar lógica de renderização ---
  console.log(`[DEBUG] Renderizando capa do livro '${title}'. URL: ${coverImageUrl || 'Sem URL'}`);
  // --- FIM DEBUG ---

  return (
    <div className={styles.bookCover}>
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt={`Capa de ${title}`}
          className={styles.coverImage}
        />
      ) : (
        <div className={styles.placeholder}>Sem Capa</div>
      )}
    </div>
  );
};

export default BookCover;