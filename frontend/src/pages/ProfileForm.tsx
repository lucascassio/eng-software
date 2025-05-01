import React, { useState } from 'react';
import styles from './profile.module.scss';

interface UserProfile {
  name: string;
  bio: string;
  photo: string;
}

interface ProfileFormProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [photo, setPhoto] = useState(user.photo);

  // Função chamada ao submeter o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, bio, photo });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Editar Perfil</h2>
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <label>
            Nome:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Biografia:
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </label>

          <label>
            Foto (URL):
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </label>

          <div className={styles.modalButtons}>
            <button type="submit" className={styles.saveButton}>
              Salvar
            </button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
