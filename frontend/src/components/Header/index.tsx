import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./styles.module.scss";
import logo from '../../assets/logo.jpg'; // Certifique-se que este caminho está correto

// Interface Notification corrigida para corresponder à estrutura de dados do backend
// (assumindo que o backend serializa em camelCase: notificationId, isRead, createdAt)
interface Notification {
  notificationId: number; // Era id: string
  message: string;
  isRead: boolean;      // Era read: boolean
  createdAt: string;    // Era timestamp: string. Backend DateTime é geralmente serializado como string ISO.
  // Outros campos como userId, tradeId podem ser adicionados se enviados pelo backend e necessários no frontend
  // userId: number;
  // tradeId: number;
}

// Função para buscar notificações (movida para fora para clareza, ou pode ser interna)
const fetchNotifications = async (): Promise<Notification[]> => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    console.error("Erro ao buscar notificações: authToken não encontrado.");
    return [];
  }

  try {
    const response = await fetch("http://localhost:5185/api/notifications/get-notifications", {
      method: "GET",
      headers: {
        "Authorization": Bearer ${authToken},
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data as Notification[]; // Confia que 'data' corresponde à interface Notification
    } else {
      console.error("Erro ao buscar notificações:", response.status, await response.text());
      return [];
    }
  } catch (error) {
    console.error("Falha na requisição ao buscar notificações:", error);
    return [];
  }
};

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Função para marcar notificação como lida
  const markAsRead = async (notificationIdToMark: number): Promise<void> => {
    const authToken = Cookies.get("authToken");
    if (!authToken) {
      console.error("Erro ao marcar como lida: authToken não encontrado.");
      return;
    }

    if (isNaN(notificationIdToMark)) {
      console.error("Erro: ID da notificação inválido para marcar como lida.");
      return;
    }

    try {
      const response = await fetch(http://localhost:5185/api/notifications/${notificationIdToMark}/mark-as-read, {
        method: "PUT", // Corrigido de POST para PUT
        headers: {
          "Authorization": Bearer ${authToken},
          // "Content-Type": "application/json", // Opcional para PUT sem corpo, mas boa prática
        },
      });

      if (response.ok) {
        console.log(Notificação ${notificationIdToMark} marcada como lida);
        // Atualiza o estado local para refletir a mudança
        setNotifications(prevNotifications => {
          const updatedNotifications = prevNotifications.map(n =>
            n.notificationId === notificationIdToMark ? { ...n, isRead: true } : n
          );
          // Recalcula a contagem de não lidas com base nas notificações atualizadas
          const newUnreadCount = updatedNotifications.filter(notif => !notif.isRead).length;
          setUnreadCount(newUnreadCount);
          return updatedNotifications;
        });
      } else {
        const errorBody = await response.text();
        console.error(Erro ao marcar notificação ${notificationIdToMark} como lida: ${response.status} - ${errorBody});
      }
    } catch (error) {
        console.error(Falha na requisição ao marcar notificação ${notificationIdToMark} como lida:, error);
    }
  };

  // Função de logout
  const handleLogout = async () => {
    const authToken = Cookies.get("authToken");
    // Mesmo sem token, limpar localmente e redirecionar
    if (!authToken) {
        console.warn("Tentativa de logout sem authToken. Removendo localmente e redirecionando.");
        Cookies.remove("authToken");
        navigate("/");
        return;
    }

    try {
      const response = await fetch("http://localhost:5185/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${authToken},
        },
      });

      if (!response.ok) {
        // Mesmo se o logout no servidor falhar, prossiga com o logout do cliente
        console.warn(Falha ao fazer logout no servidor: ${response.status}. Prosseguindo com logout local.);
      }
    } catch (error) {
      console.error("Erro na requisição de logout:", error);
    } finally {
      // Garante que o cookie seja removido e o usuário redirecionado
      Cookies.remove("authToken");
      navigate("/");
    }
  };

  // Função para carregar e definir notificações
  const loadAndSetNotifications = async () => {
    const fetchedNotifications = await fetchNotifications();
    setNotifications(fetchedNotifications);
    setUnreadCount(fetchedNotifications.filter(notification => !notification.isRead).length); // Usar isRead
  };

  // Carregar notificações ao montar o componente
  useEffect(() => {
    loadAndSetNotifications();
  }, []); // Array vazio executa uma vez ao montar

  // Atualizar notificações ao abrir a lista
  const handleNotificationClick = async () => {
    if (!isNotificationsOpen) { // Carrega/atualiza notificações apenas se estiver abrindo
      await loadAndSetNotifications();
    }
    setNotificationsOpen(prev => !prev); // Alterna a visibilidade
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
          <div className={styles.notifications} onClick={handleNotificationClick}>
            <span className={styles.notificationIcon}>🔔</span>
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </div>

          {isNotificationsOpen && (
            <div className={styles.notificationsList}>
              {notifications.length === 0 ? (
                <p>Sem notificações</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.notificationId} className={styles.notificationItem}> {/* Usar notificationId */}
                    <p>{notification.message}</p>
                    {!notification.isRead && ( // Usar isRead
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Impede que o clique feche o dropdown se ele também for um alvo
                          markAsRead(notification.notificationId); // Passar notificationId (number)
                        }}
                        className={styles.markAsReadButton}
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <button onClick={handleLogout} className={styles.logoutLink}>Logout</button>
          <NavLink to="/profile" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Perfil
          </NavLink>
        </div>
      </nav>
    </header>
  );