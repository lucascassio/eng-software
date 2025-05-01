import React, { useState } from 'react';
import BookCard from '../components/BookCard';
import ProfileForm from './ProfileForm';
import styles from './profile.module.scss';

interface Book {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
}

interface UserProfile {
  name: string;
  bio: string;
  photo: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    name: 'Fulano de Tal',
    bio: 'Entusiasta de livros de ficção científica e fantasia.',
    photo: 'https://via.placeholder.com/150'
  });

  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: '1984', author: 'George Orwell', coverUrl: 'https://via.placeholder.com/100x150' },
    { id: 2, title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', coverUrl: 'https://via.placeholder.com/100x150' },
    { id: 3, title: 'Dom Casmurro', author: 'Machado de Assis', coverUrl: 'https://via.placeholder.com/100x150' }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  // Função para salvar as alterações do perfil
  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setIsEditing(false);
    // No futuro, aqui você chamaria a API para salvar as alterações
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileInfo}>
        <img src={user.photo} alt="Foto do usuário" className={styles.profileImage} />
        <h2 className={styles.profileName}>{user.name}</h2>
        <p className={styles.profileBio}>{user.bio}</p>
        <button className={styles.editButton} onClick={() => setIsEditing(true)}>
          Editar Perfil
        </button>
      </div>

      <h3>Meus Livros para Troca</h3>
      <div className={styles.bookList}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {isEditing && (
        <ProfileForm user={user} onClose={() => setIsEditing(false)} onSave={handleSaveProfile} />
      )}
    </div>
  );
};

export default Profile;