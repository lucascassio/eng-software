import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./styles.module.scss";
import logo from '../../assets/logo.jpg';

export function Header() {
  const navigate = useNavigate();

  // Função de logout
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5185/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${Cookies.get("authToken")},
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao fazer logout");
      }

      Cookies.remove("authToken");
      navigate("/"); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.leftLinks}>
          <NavLink to="/feed" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Feed de Livros
          </NavLink>
          <NavLink to="/myBooks" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Meus Livros
          </NavLink>
          <NavLink to="/myTrades" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Minhas Trocas
          </NavLink>
        </div>

        <div className={styles.logoContainer}>
          <a href="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </a>
        </div>
        <div className={styles.rightLinks}>
          <button onClick={handleLogout} className={styles.logoutLink}>Logout</button>
          <NavLink to="/profile" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Perfil
          </NavLink>
        </div>
      </nav>
    </header>
  );
}