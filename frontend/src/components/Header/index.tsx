import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./styles.module.scss";
import logo from '../../assets/logo.png'; // Mantido de fe_logo_teste

// Interface Notification corrigida para corresponder à estrutura de dados do backend
// (assumindo que o backend serializa em camelCase: notificationId, isRead, createdAt)
interface Notification {
  notificationId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Outros campos como userId, tradeId podem ser adicionados se enviados pelo backend e necessários no frontend
  // userId: number;
  // tradeId: number;
}

// Função para buscar notificações (de fe_logo_teste)
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
        "Authorization": `Bearer ${authToken}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data as Notification[];
    } else {
      console.error(`Erro ao buscar notificações: ${response.status}`, await response.text());
      return [];
    }
  } catch (error) {
    console.error("Falha na requisição ao buscar notificações:", error);
    return [];
  }
};

export function Header() {
  // Estados e hooks de fe_logo_teste
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Função markAsRead de fe_logo_teste
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
      const response = await fetch(`http://localhost:5185/api/notifications/${notificationIdToMark}/mark-as-read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        console.log(`Notificação ${notificationIdToMark} marcada como lida`);
        setNotifications(prevNotifications => {
          const updatedNotifications = prevNotifications.map(n =>
            n.notificationId === notificationIdToMark ? { ...n, isRead: true } : n
          );
          const newUnreadCount = updatedNotifications.filter(notif => !notif.isRead).length;
          setUnreadCount(newUnreadCount);
          return updatedNotifications;
        });
      } else {
        const errorBody = await response.text();
        console.error(`Erro ao marcar notificação ${notificationIdToMark} como lida: ${response.status} - ${errorBody}`);
      }
    } catch (error) {
        console.error(`Falha na requisição ao marcar notificação ${notificationIdToMark} como lida:`, error);
    }
  };

  // Função de logout (de fe_logo_teste)
  const handleLogout = async () => {
    const authToken = Cookies.get("authToken");
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
          "Authorization": `Bearer ${authToken}`, // Mantido de fe_logo_teste
        },
      });

      if (!response.ok) {
        console.warn(`Falha ao fazer logout no servidor: ${response.status}. Prosseguindo com logout local.`); // Mantido de fe_logo_teste
      }
    } catch (error) {
      console.error("Erro na requisição de logout:", error); // Mantido de fe_logo_teste
    } finally {
      // Mantido de fe_logo_teste
      Cookies.remove("authToken");
      navigate("/");
    }
  };

  // Funções de notificação de fe_logo_teste
  const loadAndSetNotifications = async () => {
    const fetchedNotifications = await fetchNotifications();
    setNotifications(fetchedNotifications);
    setUnreadCount(fetchedNotifications.filter(notification => !notification.isRead).length);
  };

  useEffect(() => {
    loadAndSetNotifications();
  }, []);

  const handleNotificationClick = async () => {
    if (!isNotificationsOpen) {
      await loadAndSetNotifications();
    }
    setNotificationsOpen(prev => !prev);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.leftLinks}>
          {/* NavLink de fe_logo_teste */}
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
          {/* Seção de notificações de fe_logo_teste */}
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
                  <div key={notification.notificationId} className={styles.notificationItem}>
                    <p>{notification.message}</p>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.notificationId);
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

          {/* Botão de logout e NavLink de perfil de fe_logo_teste */}
          <button onClick={handleLogout} className={styles.logoutLink}>Logout</button>
          <NavLink to="/profile" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Perfil
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
