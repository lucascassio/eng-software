// src/components/MyBookCard/index.tsx (ou onde quer que ele esteja)
import React from 'react';
import styles from './styles.module.scss'; // Assume que os estilos necessários estão aqui

// Interface para as props, incluindo a URL da imagem
interface MyBookCardProps {
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
    coverImageUrl?: string; // A URL da imagem
  };
  // Adicione outras props se necessário
}

export const MyBookCard: React.FC<MyBookCardProps> = ({ book }) => {

  // Lógica para montar a URL da imagem
  const API_BASE_URL = 'http://localhost:5185';
  const imageSrc = book.coverImageUrl && book.coverImageUrl.startsWith('/')
    ? `${API_BASE_URL}${book.coverImageUrl}` // Monta URL completa
    : book.coverImageUrl; // Usa como está se já for completa ou nula

  return (
    // O container principal do card.
    // Para layout lado a lado, o CSS para .card deve ter 'display: flex;'
    <div className={styles.card}>

      {/* Coluna da Imagem */}
      <div className={styles.coverContainer}>
        {imageSrc
          ? <img src={imageSrc} alt={`Capa de ${book.title}`} className={styles.cover} />
          : <div className={styles.placeholder}>Sem Capa</div>
        }
      </div>

      {/* Coluna do Conteúdo Textual */}
      {/* Note que contentContainer foi removido como div extra,
          o conteúdo agora é irmão direto da imagem */}
      <div className={styles.contentArea}> {/* Nova classe para estilizar esta coluna se necessário */}
        <div className={styles.header}>
          <h3 className={styles.title}>{book.title}</h3>
          <span className={`${styles.status} ${book.isAvailable ? styles.available : styles.unavailable}`}>
            {book.isAvailable ? 'Disponível' : 'Indisponível'}
          </span>
        </div>

        <div className={styles.details}>
          <p><strong>Autor:</strong> {book.author}</p>
          <p><strong>Gênero:</strong> {book.genre}</p>
          <p><strong>Editora:</strong> {book.publisher}</p>
          <p><strong>Ano:</strong> {book.year}</p>
        </div>

        {book.sinopse && (
          <div className={styles.sinopse}>
            <p><strong>Sinopse:</strong> {book.sinopse}</p>
          </div>
        )}
         {/* Espaço para futuros botões, se necessário */}
      </div>
    </div>
  );
};

// export default MyBookCard; // Descomente se estiver em arquivo separado
