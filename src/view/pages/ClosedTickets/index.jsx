import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LoggedHeader from "../../../components/LoggedHeader";
import { useSnack } from "../../../contexts/SnackContext";
import { ticketService } from "../../../services/ticketService";
import {
  buildTicketProtocol,
  getMessageSenderLabel,
  getMessageTagLabel,
} from "../../../utils/ticket";
import * as S from "./styles";

const REOPENABLE_STATUSES = ["fechado", "finalizado", "resolvido"];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const ClosedTickets = () => {
  const navigate = useNavigate();
  const { showSnack } = useSnack();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reopeningTicketId, setReopeningTicketId] = useState(null);
  const [reopenConfirmation, setReopenConfirmation] = useState({
    isOpen: false,
    ticket: null,
  });
  const [chatHistory, setChatHistory] = useState({
    isOpen: false,
    loading: false,
    error: "",
    ticket: null,
    messages: [],
  });

  const firstVisibleTicketIndex =
    totalTickets === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisibleTicketIndex =
    totalTickets === 0
      ? 0
      : Math.min((currentPage - 1) * pageSize + tickets.length, totalTickets);

  const loadTickets = useCallback(async ({
    page = currentPage,
    pageSize: requestedPageSize = pageSize,
  } = {}) => {
    try {
      const response = await ticketService.getUserClosedTickets({
        page,
        pageSize: requestedPageSize,
      });

      if (response.status === 200) {
        setTickets(response.tickets || []);
        setTotalTickets(Number(response.pagination?.total || 0));
        setTotalPages(Number(response.pagination?.totalPages || 1));

        if (
          response.pagination?.page &&
          Number(response.pagination.page) !== currentPage
        ) {
          setCurrentPage(Number(response.pagination.page));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);

      if (
        error.response?.status === 401 ||
        error.message?.includes("Não autorizado") ||
        error.message?.includes("Nao autorizado")
      ) {
        navigate("/login");
        return;
      }

      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message ||
          "Não foi possível carregar os tickets finalizados.",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate, pageSize, showSnack]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  const closeChatHistory = () => {
    setChatHistory({
      isOpen: false,
      loading: false,
      error: "",
      ticket: null,
      messages: [],
    });
  };

  const openReopenConfirmation = (ticket) => {
    if (!ticket?.id) return;

    setReopenConfirmation({
      isOpen: true,
      ticket,
    });
  };

  const closeReopenConfirmation = useCallback(() => {
    if (reopeningTicketId) return;

    setReopenConfirmation({
      isOpen: false,
      ticket: null,
    });
  }, [reopeningTicketId]);

  const openChatHistory = async (ticket) => {
    const targetTicketId = String(ticket.id);

    setChatHistory({
      isOpen: true,
      loading: true,
      error: "",
      ticket,
      messages: [],
    });

    try {
      const response = await ticketService.getTicketMessages(ticket.id);

      if (response?.status >= 400) {
        throw new Error(
          response.message || "Não foi possível carregar a conversa do chamado.",
        );
      }

      setChatHistory((previous) => {
        if (String(previous.ticket?.id || "") !== targetTicketId) {
          return previous;
        }

        return {
          ...previous,
          loading: false,
          error: "",
          ticket: response.ticket || ticket,
          messages: response.messages || [],
        };
      });
    } catch (error) {
      setChatHistory((previous) => {
        if (String(previous.ticket?.id || "") !== targetTicketId) {
          return previous;
        }

        return {
          ...previous,
          loading: false,
          error:
            error?.response?.data?.message ||
            error?.message ||
            "Não foi possível carregar a conversa do chamado.",
        };
      });
    }
  };

  useEffect(() => {
    if (!selectedTicket && !chatHistory.isOpen && !reopenConfirmation.isOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;

      if (reopenConfirmation.isOpen && !reopeningTicketId) {
        closeReopenConfirmation();
      } else if (chatHistory.isOpen) {
        closeChatHistory();
      } else {
        closeModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [
    chatHistory.isOpen,
    closeReopenConfirmation,
    reopenConfirmation.isOpen,
    reopeningTicketId,
    selectedTicket,
  ]);

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Data não disponível";

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "aberto":
        return "Aberto";
      case "pendente":
        return "Pendente";
      case "fechado":
      case "finalizado":
        return "Fechado";
      case "resolvido":
        return "Resolvido";
      default:
        return status;
    }
  };

  const canReopenTicket = (ticket) =>
    REOPENABLE_STATUSES.includes(String(ticket?.status || "").toLowerCase());

  const getCompanyName = (ticket) =>
    ticket?.company?.name || ticket?.companyName || "Resolve +";

  const getComplaintTitleName = (ticket) =>
    ticket?.complaintTitle?.title ||
    ticket?.complaintTitleName ||
    "Sem título registrado";

  const getTicketDescription = (ticket) =>
    ticket?.description || "Sem descrição disponível.";

  const getTicketProtocol = (ticket) =>
    ticket?.protocol || buildTicketProtocol(ticket?.id);

  const getCreatedAt = (ticket) => ticket?.createdAt;

  const getFinishedAt = (ticket) =>
    ticket?.closedAt ||
    ticket?.closed_at ||
    ticket?.updatedAt;

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleReopenTicket = async (ticket) => {
    if (!ticket?.id) return;

    try {
      setReopeningTicketId(ticket.id);

      const response = await ticketService.updateStatus(ticket.id, "reabrir");

      if (response?.status >= 400) {
        throw new Error(
          response.message || "Não foi possível reabrir o chamado.",
        );
      }

      setTickets((previous) =>
        previous.filter((item) => String(item.id) !== String(ticket.id)),
      );
      const nextTotalTickets = Math.max(0, totalTickets - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotalTickets / pageSize));
      setTotalTickets(nextTotalTickets);
      setTotalPages(nextTotalPages);
      setCurrentPage((page) => Math.min(page, nextTotalPages));
      setSelectedTicket((current) =>
        String(current?.id) === String(ticket.id) ? null : current,
      );
      setReopenConfirmation({
        isOpen: false,
        ticket: null,
      });

      showSnack({
        variant: "success",
        message: "Chamado reaberto com sucesso.",
      });

      navigate(`/cliente/chatbot?ticketId=${ticket.id}`);
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível reabrir o chamado.",
      });
    } finally {
      setReopeningTicketId(null);
    }
  };

  const handleConfirmReopenTicket = () => {
    handleReopenTicket(reopenConfirmation.ticket);
  };

  if (loading) {
    return (
      <S.Container>
        <LoggedHeader />
        <S.Loading>Carregando tickets...</S.Loading>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <LoggedHeader />

      <S.Header>
        <div>
          <S.PageTitle>Tickets Finalizados</S.PageTitle>
          <S.Subtitle>
            Se o problema voltar, você pode reabrir o chamado e continuar o
            atendimento.
          </S.Subtitle>
        </div>
        <S.HeaderCount>
          {totalTickets} chamado{totalTickets === 1 ? "" : "s"}
        </S.HeaderCount>
      </S.Header>

      {totalTickets === 0 ? (
        <S.EmptyState>Nenhum ticket finalizado encontrado.</S.EmptyState>
      ) : (
        <>
          <S.ListToolbar>
            <S.PageSizeControl>
              <span>Chamados por página</span>
              <S.PageSizeSelect value={pageSize} onChange={handlePageSizeChange}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </S.PageSizeSelect>
            </S.PageSizeControl>

            <S.PageRange>
              Mostrando {firstVisibleTicketIndex}-{lastVisibleTicketIndex} de{" "}
              {totalTickets}
            </S.PageRange>
          </S.ListToolbar>

          <S.TicketsList>
            {tickets.map((ticket) => {
            const isReopening = reopeningTicketId === ticket.id;
            const canReopen = canReopenTicket(ticket);

            return (
              <S.TicketCard key={ticket.id}>
                <S.TicketMain>
                  <S.TicketInfo>
                    <S.TicketTitle>
                      Chamado {getCompanyName(ticket)}
                    </S.TicketTitle>

                    <S.TicketStatus $status={ticket.status}>
                      {getStatusText(ticket.status)}
                    </S.TicketStatus>
                  </S.TicketInfo>

                  <S.TicketSubject>
                    {getComplaintTitleName(ticket)}
                  </S.TicketSubject>

                  <S.TicketDescription>
                    {getTicketDescription(ticket)}
                  </S.TicketDescription>

                  <S.TicketMetaGrid>
                    <S.TicketMetaItem>
                      <S.MetaLabel>Protocolo</S.MetaLabel>
                      <S.MetaValue>{getTicketProtocol(ticket)}</S.MetaValue>
                    </S.TicketMetaItem>
                    <S.TicketMetaItem>
                      <S.MetaLabel>Finalizado em</S.MetaLabel>
                      <S.MetaValue>{formatDate(getFinishedAt(ticket))}</S.MetaValue>
                    </S.TicketMetaItem>
                  </S.TicketMetaGrid>
                </S.TicketMain>

                <S.TicketActions>
                  <S.VerDetalhesButton onClick={() => openDetails(ticket)}>
                    Ver detalhes
                  </S.VerDetalhesButton>

                  <S.ChatHistoryButton onClick={() => openChatHistory(ticket)}>
                    Ver conversa
                  </S.ChatHistoryButton>

                  {canReopen ? (
                    <S.ReopenButton
                      onClick={() => openReopenConfirmation(ticket)}
                      disabled={isReopening}
                    >
                      {isReopening ? "Reabrindo..." : "Reabrir chamado"}
                    </S.ReopenButton>
                  ) : null}
                </S.TicketActions>
              </S.TicketCard>
            );
            })}
          </S.TicketsList>

          <S.PaginationBar>
            <S.PaginationButton
              type="button"
              $icon
              aria-label="Página anterior"
              title="Página anterior"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft aria-hidden="true" />
            </S.PaginationButton>

            <S.PageIndicator>
              Página {currentPage} de {totalPages}
            </S.PageIndicator>

            <S.PaginationButton
              type="button"
              $icon
              aria-label="Próxima página"
              title="Próxima página"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage >= totalPages}
            >
              <ChevronRight aria-hidden="true" />
            </S.PaginationButton>
          </S.PaginationBar>
        </>
      )}

      {selectedTicket ? (
        <S.ModalOverlay onClick={closeModal}>
          <S.ModalContent onClick={(event) => event.stopPropagation()}>
            <S.ModalTitle>Detalhes do Chamado</S.ModalTitle>

            <S.ModalInfo>
              <strong>Empresa:</strong>{" "}
              {getCompanyName(selectedTicket)}
            </S.ModalInfo>

            {getComplaintTitleName(selectedTicket) ? (
              <S.ModalInfo>
                <strong>Título:</strong> {getComplaintTitleName(selectedTicket)}
              </S.ModalInfo>
            ) : null}

            <S.ModalInfo>
              <strong>Status:</strong>
              <S.ModalStatus $status={selectedTicket.status}>
                {getStatusText(selectedTicket.status)}
              </S.ModalStatus>
            </S.ModalInfo>

            <S.ModalInfo>
                <strong>Protocolo:</strong>{" "}
              {getTicketProtocol(selectedTicket)}
            </S.ModalInfo>

            <S.ModalInfo>
              <strong>Criado em:</strong> {formatDate(getCreatedAt(selectedTicket))}
            </S.ModalInfo>

            {(selectedTicket.status === "finalizado" ||
              selectedTicket.status === "fechado") && (
              <S.ModalInfo>
                <strong>Finalizado em:</strong>{" "}
                {formatDate(getFinishedAt(selectedTicket))}
              </S.ModalInfo>
            )}

            <S.ModalInfo>
              <strong>Descrição:</strong>
              <S.DescriptionBox>{getTicketDescription(selectedTicket)}</S.DescriptionBox>
            </S.ModalInfo>

            <S.ModalActions>
              <S.SecondaryButton onClick={closeModal}>Fechar</S.SecondaryButton>

              <S.SecondaryButton
                onClick={() => {
                  closeModal();
                  openChatHistory(selectedTicket);
                }}
              >
                Ver conversa
              </S.SecondaryButton>

              {canReopenTicket(selectedTicket) ? (
                <S.CloseButton
                  onClick={() => openReopenConfirmation(selectedTicket)}
                  disabled={reopeningTicketId === selectedTicket.id}
                >
                  {reopeningTicketId === selectedTicket.id
                    ? "Reabrindo..."
                    : "Reabrir chamado"}
                </S.CloseButton>
              ) : null}
            </S.ModalActions>
          </S.ModalContent>
        </S.ModalOverlay>
      ) : null}

      {chatHistory.isOpen ? (
        <S.ModalOverlay onClick={closeChatHistory}>
          <S.ChatModalContent onClick={(event) => event.stopPropagation()}>
            <S.ModalTitle>
              Conversa do chamado{" "}
              {chatHistory.ticket?.id ? getTicketProtocol(chatHistory.ticket) : ""}
            </S.ModalTitle>

            <S.ChatModalSubtitle>
              Histórico completo das mensagens registradas neste ticket.
            </S.ChatModalSubtitle>

            {chatHistory.loading ? (
              <S.ChatEmptyState>Carregando conversa...</S.ChatEmptyState>
            ) : null}

            {!chatHistory.loading && chatHistory.error ? (
              <S.ChatEmptyState>{chatHistory.error}</S.ChatEmptyState>
            ) : null}

            {!chatHistory.loading &&
            !chatHistory.error &&
            chatHistory.messages.length === 0 ? (
              <S.ChatEmptyState>
                Ainda não há mensagens registradas neste chamado.
              </S.ChatEmptyState>
            ) : null}

            {!chatHistory.loading &&
            !chatHistory.error &&
            chatHistory.messages.length > 0 ? (
              <S.ChatMessageList>
                {chatHistory.messages.map((message) => {
                  const tagLabel = getMessageTagLabel(message);

                  return (
                    <S.ChatMessageCard
                      key={message.id}
                      $system={tagLabel === "Sistema"}
                    >
                      <S.ChatMessageTop>
                        <S.ChatMessageAuthor>
                          {getMessageSenderLabel(message, {
                            ticketCustomer: chatHistory.ticket?.customer,
                          })}
                        </S.ChatMessageAuthor>
                        <S.ChatMessageBadge>{tagLabel}</S.ChatMessageBadge>
                      </S.ChatMessageTop>

                      <S.ChatMessageContent>
                        {message.content || "Mensagem sem conteúdo."}
                      </S.ChatMessageContent>

                      <S.ChatMessageTime>
                        {formatDate(message.createdAt)}
                      </S.ChatMessageTime>
                    </S.ChatMessageCard>
                  );
                })}
              </S.ChatMessageList>
            ) : null}

            <S.ModalActions>
              <S.SecondaryButton onClick={closeChatHistory}>Fechar</S.SecondaryButton>

              {chatHistory.ticket && canReopenTicket(chatHistory.ticket) ? (
                <S.CloseButton
                  onClick={() => openReopenConfirmation(chatHistory.ticket)}
                  disabled={reopeningTicketId === chatHistory.ticket.id}
                >
                  {reopeningTicketId === chatHistory.ticket.id
                    ? "Reabrindo..."
                    : "Reabrir chamado"}
                </S.CloseButton>
              ) : null}
            </S.ModalActions>
          </S.ChatModalContent>
        </S.ModalOverlay>
      ) : null}

      {reopenConfirmation.isOpen && reopenConfirmation.ticket ? (
        <S.ModalOverlay onClick={closeReopenConfirmation}>
          <S.ModalContent
            role="dialog"
            aria-modal="true"
            aria-labelledby="reopen-confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.ModalTitle id="reopen-confirmation-title">
              Confirmar reabertura
            </S.ModalTitle>

            <S.ModalInfo>
              Deseja reabrir o chamado{" "}
              <strong>{getTicketProtocol(reopenConfirmation.ticket)}</strong>?
            </S.ModalInfo>

            <S.DescriptionBox>
              Confirme apenas se o problema voltou ou ainda precisa de atendimento.
              Se foi um clique sem querer, cancele para manter o chamado no estado atual.
            </S.DescriptionBox>

            <S.ModalActions>
              <S.SecondaryButton
                type="button"
                onClick={closeReopenConfirmation}
                disabled={Boolean(reopeningTicketId)}
              >
                Cancelar
              </S.SecondaryButton>

              <S.CloseButton
                type="button"
                onClick={handleConfirmReopenTicket}
                disabled={reopeningTicketId === reopenConfirmation.ticket.id}
              >
                {reopeningTicketId === reopenConfirmation.ticket.id
                  ? "Reabrindo..."
                  : "Confirmar reabertura"}
              </S.CloseButton>
            </S.ModalActions>
          </S.ModalContent>
        </S.ModalOverlay>
      ) : null}
    </S.Container>
  );
};

export default ClosedTickets;
