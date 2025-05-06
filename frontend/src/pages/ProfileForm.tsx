import React, { useState } from 'react';
import styles from './profile.module.scss';
import { UserProfile, UpdateUserDTO } from '../services/userService';

interface ProfileFormProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: UpdateUserDTO) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [course, setCourse] = useState(user.course);
  const [isActive, setIsActive] = useState(user.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, course, isActive });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Editar Perfil</h2>
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
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Curso:
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />
          </label>

          <label>
            Status:
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
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