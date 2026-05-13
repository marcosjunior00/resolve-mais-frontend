import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import LoggedHeader from "../LoggedHeader";
import { useSnack } from "../../contexts/SnackContext";
import { ticketService } from "../../services/ticketService";
import { buildTicketProtocol } from "../../utils/ticket";
import * as S from "./styles";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PendingTickets = () => {
  const navigate = useNavigate();
  const { showSnack } = useSnack();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
      const response = await ticketService.getUserOpenAndPendingTickets({
        page,
        pageSize: requestedPageSize,
      });

      setTickets(response?.tickets || []);
      setTotalTickets(Number(response?.pagination?.total || 0));
      setTotalPages(Number(response?.pagination?.totalPages || 1));

      if (
        response?.pagination?.page &&
        Number(response.pagination.page) !== currentPage
      ) {
        setCurrentPage(Number(response.pagination.page));
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
          "Não foi possível carregar os tickets em andamento.",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate, pageSize, showSnack]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicket) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setSelectedTicket(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [selectedTicket]);

  const openDetails = (ticket) => {
    setSelectedTicket(ticket);
  };

  const closeModal = () => {
    setSelectedTicket(null);
  };

  const openConversation = (ticketId) => {
    navigate(`/cliente/chatbot?ticketId=${ticketId}`);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

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

  const getCompanyName = (ticket) =>
    ticket?.company?.name || ticket?.companyName || ticket?.empresa || "Resolve +";

  const getComplaintTitleName = (ticket) =>
    ticket?.complaintTitle?.title ||
    ticket?.complaintTitleName ||
    ticket?.tituloReclamacao ||
    "Sem título registrado";

  const getTicketDescription = (ticket) =>
    ticket?.description || ticket?.descricao || "Sem descrição disponível.";

  const getTicketProtocol = (ticket) =>
    ticket?.protocol || ticket?.protocolo || buildTicketProtocol(ticket?.id);

  const getAssignedToName = (ticket) =>
    ticket?.assignedTo?.name || ticket?.assignedToName || ticket?.atribuidoPara || null;

  const getCreatedAt = (ticket) => ticket?.createdAt || ticket?.criadoEm;

  const getUpdatedAt = (ticket) =>
    ticket?.updatedAt || ticket?.atualizadoEm || ticket?.createdAt || ticket?.criadoEm;

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
          <S.PageTitle>Tickets em Andamento</S.PageTitle>
          <S.Subtitle>
            Acompanhe chamados abertos ou em atendimento humano.
          </S.Subtitle>
        </div>
        <S.HeaderActions>
          <S.HeaderCount>
            {totalTickets} chamado{totalTickets === 1 ? "" : "s"}
          </S.HeaderCount>
          <S.HeaderCtaLink as={Link} to="/cliente/closed-tickets">
            Ver tickets finalizados
          </S.HeaderCtaLink>
        </S.HeaderActions>
      </S.Header>

      {totalTickets === 0 ? (
        <S.EmptyState>Nenhum ticket em andamento encontrado.</S.EmptyState>
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
            {tickets.map((ticket) => (
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
                      <S.MetaLabel>Última movimentação</S.MetaLabel>
                      <S.MetaValue>{formatDate(getUpdatedAt(ticket))}</S.MetaValue>
                    </S.TicketMetaItem>
                    {getAssignedToName(ticket) ? (
                      <S.TicketMetaItem>
                        <S.MetaLabel>Responsável</S.MetaLabel>
                        <S.MetaValue>{getAssignedToName(ticket)}</S.MetaValue>
                      </S.TicketMetaItem>
                    ) : null}
                  </S.TicketMetaGrid>
                </S.TicketMain>

                <S.TicketActions>
                  <S.VerDetalhesButton
                    type="button"
                    onClick={() => openDetails(ticket)}
                  >
                    Ver detalhes
                  </S.VerDetalhesButton>

                  <S.ChatButton
                    type="button"
                    onClick={() => openConversation(ticket.id)}
                  >
                    Abrir atendimento
                  </S.ChatButton>
                </S.TicketActions>
              </S.TicketCard>
            ))}
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
              <strong>Criado em:</strong>{" "}
              {formatDate(getCreatedAt(selectedTicket))}
            </S.ModalInfo>

            <S.ModalInfo>
              <strong>Descrição:</strong>
              <S.DescriptionBox>{getTicketDescription(selectedTicket)}</S.DescriptionBox>
            </S.ModalInfo>

            <S.ModalActions>
              <S.SecondaryButton type="button" $full onClick={closeModal}>
                Fechar
              </S.SecondaryButton>

              <S.ChatButton
                type="button"
                onClick={() => openConversation(selectedTicket.id)}
              >
                Ir para o chat
              </S.ChatButton>
            </S.ModalActions>
          </S.ModalContent>
        </S.ModalOverlay>
      ) : null}
    </S.Container>
  );
};

export default PendingTickets;
