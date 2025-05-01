// components/BookForm.tsx
import React from 'react';
import styles from './styles.module.scss';

interface Book {
  title: string;
  author: string;
  genre: string;
  publisher: string;
  year: number;
  pages: number;
  sinopse?: string;
  isAvailable?: boolean;
}

interface BookFormProps {
  title: string;
  bookData: Book;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ title, bookData, onChange, onSubmit, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label>Título*</label>
            <input
              type="text"
              name="title"
              value={bookData.title}
              onChange={onChange}
              required
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Autor*</label>
            <input
              type="text"
              name="author"
              value={bookData.author}
              onChange={onChange}
              required
              maxLength={50}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Gênero*</label>
            <input
              type="text"
              name="genre"
              value={bookData.genre}
              onChange={onChange}
              required
              maxLength={50}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Editora*</label>
            <input
              type="text"
              name="publisher"
              value={bookData.publisher}
              onChange={onChange}
              required
              maxLength={50}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ano de Publicação*</label>
              <input
                type="number"
                name="year"
                value={bookData.year}
                onChange={onChange}
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Páginas*</label>
              <input
                type="number"
                name="pages"
                value={bookData.pages}
                onChange={onChange}
                required
                min="1"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Sinopse (Opcional)</label>
            <textarea
              name="sinopse"
              value={bookData.sinopse || ''}
              onChange={onChange}
              rows={4}
            />
          </div>

          {title === "Editar Livro" && (
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={bookData.isAvailable ?? false}
                  onChange={onChange}
                />
                Disponível para troca
              </label>
            </div>
          )}

          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>
              Salvar {title === "Editar Livro" ? "Alterações" : "Livro"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;