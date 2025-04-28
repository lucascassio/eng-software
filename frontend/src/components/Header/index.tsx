import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.links}>
          <NavLink 
            to="/feed" 
            className={({ isActive }) => 
              isActive ? styles.activeLink : styles.link
            }
          >
            Feed de Livros
          </NavLink>
          <NavLink
            to="/myBooks"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Meus Livros
          </NavLink>
          <NavLink
            to="/myTrades"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Minhas Trocas
          </NavLink>
        </div>

        <button className={styles.notificationButton}>
          🔔
        </button>
      </nav>
    </header>
  );
}
