import { NavLink } from "react-router-dom";
import styles from "./styles.module.scss";
import { useNavigate } from "react-router-dom"; // Para redirecionamento após logout
import Cookies from "js-cookie"; // Para manipulação de cookies

export function Header() {
  const navigate = useNavigate(); // Usando o useNavigate para redirecionar após o logout

  // Função de logout
  const handleLogout = async () => {
    try {
      // Enviar a requisição para o backend de logout
      const response = await fetch("http://localhost:5185/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("authToken")}`, // Passando o token para a API
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao fazer logout");
      }

      // Se o logout for bem-sucedido, remove o token de autenticação
      Cookies.remove("authToken"); // Remove o token dos cookies
      navigate("/"); // Redireciona para a página de login
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

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
        <div className={styles.rightLinks}>
          <button
            onClick={handleLogout}
            className={styles.logoutLink} // Aplica a classe 'logoutLink' diretamente
          >
            Logout
          </button>
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
