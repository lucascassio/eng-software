import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "./myTrades.module.scss";
import { TradeService } from "../services/tradeServices";

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  year: number;
  pages: number;
  sinopse?: string;
  isAvailable: boolean;
  ownerId: number;
  registrationDate: string;
  coverImageUrl?: string;
}

interface Trade {
  tradeId: number;
  requesterId: number;
  offeredBookId: number;
  targetBookId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  email?: string; // Atualizado para armazenar diretamente o email
  telefone?: string; // Atualizado para armazenar diretamente o telefone
  offeredBook: Book;
  targetBook: Book;
}

const MyTrades = () => {
  const [requestedTrades, setRequestedTrades] = useState<Trade[]>([]);
  const [receivedTrades, setReceivedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTradeId, setModalTradeId] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState<{ email?: string; telefone?: string }>({
    email: "",
    telefone: ""
  });

  // Função para lidar com ações dos botões de troca
  const handleTradeAction = async (
    tradeId: number,
    action: "accept" | "reject" | "cancel" | "complete"
  ) => {
    const statusMap = {
      accept: "Accepted",
      reject: "Rejected",
      cancel: "Cancelled",
      complete: "Completed",
    };

    const actionTextMap = {
      accept: "aceitar",
      reject: "rejeitar",
      cancel: "cancelar",
      complete: "concluir",
    };

    try {
      setError(""); // Limpa os erros antes da ação

      // Atualiza o status no backend
      const updatedTrade = await TradeService.changeStatus(
        tradeId,
        statusMap[action]
      );

      // Atualiza o estado local para refletir a mudança
      setRequestedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === tradeId
            ? { ...trade, status: updatedTrade.status }
            : trade
        )
      );

      setReceivedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === tradeId
            ? { ...trade, status: updatedTrade.status }
            : trade
        )
      );
    } catch (err) {
      console.error(`Erro ao ${actionTextMap[action]} troca ${tradeId}`, err);
      setError(
        `Erro ao ${actionTextMap[action]} troca: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`
      );
    }
  };

  // Função para enviar as informações de contato
  const handleContactInfoSubmit = async () => {
    if (!contactInfo.email?.trim() && !contactInfo.telefone?.trim()) {
      alert("Por favor, insira pelo menos um e-mail ou telefone.");
      return;
    }

    try {
      const updatedTrade = await TradeService.updateContactInfo(modalTradeId!, {
        email: contactInfo.email?.trim() || null,
        telefone: contactInfo.telefone?.trim() || null,
      });

      // Atualiza o estado local com os dados retornados do backend
      setRequestedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === modalTradeId
            ? { ...trade, email: updatedTrade.email, telefone: updatedTrade.telefone }
            : trade
        )
      );

      setReceivedTrades((prev) =>
        prev.map((trade) =>
          trade.tradeId === modalTradeId
            ? { ...trade, email: updatedTrade.email, telefone: updatedTrade.telefone }
            : trade
        )
      );

      setShowModal(false);
      setContactInfo({ email: "", telefone: "" });
    } catch (err) {
      console.error("Erro ao enviar informações de contato:", err);
      alert(
        "Ocorreu um erro ao enviar as informações de contato. Tente novamente."
      );
    }
  };

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      setError("");
      let myRequests: Trade[] = [];
      let receivedRequests: Trade[] = [];

      try {
        // Busca as trocas solicitadas e recebidas separadamente
        myRequests = await TradeService.getMyRequests();
      } catch (err) {
        console.error("[ERRO] Falha ao buscar trocas solicitadas:", err);
        setError("Erro ao carregar suas solicitações.");
      }

      try {
        receivedRequests = await TradeService.getReceivedRequests();
      } catch (err) {
        console.error("[ERRO] Falha ao buscar trocas recebidas:", err);
        setError((prevError) =>
          prevError
            ? prevError + " E ao carregar solicitações recebidas."
            : "Erro ao carregar solicitações recebidas."
        );
      }

      // Atualiza os estados mesmo que uma das requisições falhe
      setRequestedTrades(myRequests);
      setReceivedTrades(receivedRequests);
      setLoading(false);
    };

    fetchTrades();
  }, []);

  const renderStatusBadge = (status: string) => {
    const statusMap = {
      Pending: { color: "#f39c12", bg: "#fef5e6", text: "Pendente" },
      Accepted: { color: "#27ae60", bg: "#e8f8f0", text: "Aceita" },
      Rejected: { color: "#e74c3c", bg: "#fdedec", text: "Rejeitada" },
      Completed: { color: "#3498db", bg: "#eaf2f8", text: "Concluída" },
      Cancelled: { color: "#95a5a6", bg: "#f2f4f4", text: "Cancelada" },
      DEFAULT: { color: "#7f8c8d", bg: "#ecf0f1", text: status },
    };
    const style = statusMap[status as keyof typeof statusMap] || statusMap.DEFAULT;
    const text = style.text;
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          fontSize: "0.85rem",
          fontWeight: "600",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    );
  };

  const TradeBook = ({ book }: { book: Book }) => {
    const baseUrl = "http://localhost:5185"; // Ajuste conforme necessário para o seu ambiente
    const imageSrc = book.coverImageUrl?.startsWith("/")
      ? `${baseUrl}${book.coverImageUrl}`
      : `${baseUrl}/images/${book.coverImageUrl}`;

    return (
      <div className={styles.tradeBookCard}>
        <div className={styles.bookCover}>
          {book.coverImageUrl ? (
            <img
              src={imageSrc}
              alt={`Capa de ${book.title}`}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.placeholder}>Sem Capa</div>
          )}
        </div>
        <div className={styles.bookInfo}>
          <div className={styles.bookTitle} title={book.title}>
            {book.title}
          </div>
          <div className={styles.bookAuthor}>{book.author}</div>
          <div className={styles.bookMeta}>
            <span className={styles.tag}>{book.genre}</span>
            <span className={styles.tag}>{book.year}</span>
          </div>
        </div>
      </div>
    );
  };

  const TradeCardDisplay = ({
    trade,
    type,
  }: {
    trade: Trade;
    type: "requested" | "received";
  }) => {
    const isReceived = type === "received";

    return (
      <div className={styles.tradeCard}>
        <div className={styles.tradeHeader}>
          <span className={styles.tradeDate}>
            {new Date(trade.createdAt).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {renderStatusBadge(trade.status)}
        </div>
        <div className={styles.booksContainer}>
          <div className={styles.tradeBookSection}>
            <h4>
              {isReceived
                ? "Livro Oferecido por quem solicitou:"
                : "Você ofereceu:"}
            </h4>
            <TradeBook book={trade.offeredBook} />
          </div>
          <div className={styles.tradeBookSection}>
            <h4>{isReceived ? "Seu livro solicitado:" : "Você solicitou:"}</h4>
            <TradeBook book={trade.targetBook} />
          </div>
        </div>
        <div className={styles.actions}>
          {trade.status === "Pending" && isReceived && (
            <>
              <button
                onClick={() => handleTradeAction(trade.tradeId, "accept")}
                className={`${styles.actionButton} ${styles.acceptButton}`}
              >
                Aceitar
              </button>
              <button
                onClick={() => handleTradeAction(trade.tradeId, "reject")}
                className={`${styles.actionButton} ${styles.rejectButton}`}
              >
                Recusar
              </button>
            </>
          )}
          {trade.status === "Pending" && !isReceived && (
            <button
              onClick={() => handleTradeAction(trade.tradeId, "cancel")}
              className={`${styles.actionButton} ${styles.cancelButton}`}
            >
              Cancelar
            </button>
          )}
          {trade.status === "Accepted" && !isReceived && (
            <button
              onClick={() => handleTradeAction(trade.tradeId, "complete")}
              className={`${styles.actionButton} ${styles.completeButton}`}
            >
              Concluir
            </button>
          )}
          {trade.status === "Completed" && !isReceived && !trade.email && !trade.telefone && (
            <button
              onClick={() => {
                setShowModal(true);
                setModalTradeId(trade.tradeId);
              }}
              className={`${styles.actionButton} ${styles.contactButton}`}
            >
              Enviar Contato
            </button>
          )}
          
          
          {(trade.email || trade.telefone) && (
            <div className={styles.contactCard}>
              <h4 className={styles.contactTitle}>Informações de Contato</h4>
              {trade.email && (
                <p className={styles.contactItem}>
                  <span className={styles.contactIcon}>📧</span>
                  {trade.email}
                </p>
              )}
              {trade.telefone && (
                <p className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  {trade.telefone}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Minhas Trocas</h1>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando suas trocas...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>⚠️ {error}</p>
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Trocas que você solicitou</h2>
              {requestedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você ainda não solicitou nenhuma troca.</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {requestedTrades.map((trade) => (
                    <TradeCardDisplay
                      key={`req-${trade.tradeId}`}
                      trade={trade}
                      type="requested"
                    />
                  ))}
                </div>
              )}
            </section>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Solicitações de troca recebidas
              </h2>
              {receivedTrades.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Você não recebeu nenhuma solicitação de troca.</p>
                </div>
              ) : (
                <div className={styles.tradesList}>
                  {receivedTrades.map((trade) => (
                    <TradeCardDisplay
                      key={`rec-${trade.tradeId}`}
                      trade={trade}
                      type="received"
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Envie suas Informações de Contato</h2>
            <form
              className={styles.contactForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleContactInfoSubmit();
              }}
            >
              <label htmlFor="email" className={styles.modalLabel}>
                E-mail:
                <input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Digite seu e-mail"
                  className={styles.modalInput}
                />
              </label>
              <label htmlFor="telefone" className={styles.modalLabel}>
                Telefone:
                <input
                  id="telefone"
                  type="text"
                  value={contactInfo.telefone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  placeholder="Digite seu telefone"
                  className={styles.modalInput}
                />
              </label>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitButton}>
                  Enviar
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTrades;