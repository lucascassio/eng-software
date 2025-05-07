import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss';
import logo from '.frontend/public/logo.jpg';

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.leftLinks}>
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

        <div className={styles.logoContainer}>
          <a href="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </a>
        </div>


        <div className={styles.rightLinks}>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Perfil
          </NavLink>
        </div>
      </nav>
    </header>
  );
}