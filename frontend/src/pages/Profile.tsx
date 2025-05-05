import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import ProfileForm from './ProfileForm';
import { UserService, UserProfile, UpdateUserDTO } from '../services/userService';
import styles from './profile.module.scss';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string; // ID do usuário
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const token = UserService.getToken();
        if (!token) {
          throw new Error('Usuário não autenticado.');
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const userId = parseInt(decoded.sub);

        const userData = await UserService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async (updatedData: UpdateUserDTO) => {
    try {
      if (!user) return;

      await UserService.updateUser(user.id, updatedData);
      setUser({ ...user, ...updatedData });
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao salvar as alterações.');
    }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.profilePage}>
      <Header />
      <div className={styles.content}>
        <div className={styles.profileContainer}>
          {user && (
            <div className={styles.profileCard}>
              <div className={styles.profilePlaceholder}>
                <span>{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className={styles.profileName}>{user.name}</h2>
              <p className={styles.profileEmail}>{user.email}</p>
              <p className={styles.profileCourse}>
                <strong>Curso:</strong> {user.course}
              </p>
              <p className={styles.profileRegistrationDate}>
                <strong>Data de Registro:</strong> {new Date(user.registrationDate).toLocaleDateString()}
              </p>
              <p className={styles.profileStatus}>
                <strong>Status:</strong> {user.isActive ? 'Ativo' : 'Inativo'}
              </p>
              <button className={styles.editButton} onClick={() => setIsEditing(true)}>
                Editar Perfil
              </button>
            </div>
          )}
        </div>

        {isEditing && user && (
          <ProfileForm
            user={user}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveProfile}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;