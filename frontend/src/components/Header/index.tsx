import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
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
          to="/myTrades" // <--- adicionado aqui
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.link
          }
        >
          Minhas Trocas
        </NavLink>
      </nav>
    </header>
  );
}
