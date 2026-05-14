import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as S from "./styles";
import { useAuth } from "../../../../../contexts/AuthContext";
import LoggedHeader from "../../../../../components/LoggedHeader";
import { ticketService } from "../../../../../services/ticketService";

const IconInbox = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V16H8.56C9.25 17.19 10.54 18 12 18C13.46 18 14.75 17.19 15.44 16H19V19ZM19 14H14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14H5V5H19V14Z" />
  </svg>
);

const IconLogs = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 14H16V16H8V14ZM8 10H11V12H8V10Z" />
  </svg>
);

const IconPerformance = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11V3H21V11H16ZM3 13H8V21H3V13ZM10 21V8H15V21H10ZM16 21V13H21V21H16ZM3 11V3H8V11H3Z" />
  </svg>
);

const STATUS_LABEL = {
  aberto: "Aberto",
  pendente: "Pendente",
  resolvido: "Resolvido",
  finalizado: "Finalizado",
};

const STATUS_VARIANT = {
  aberto: "open",
  pendente: "pending",
  resolvido: "resolved",
  finalizado: "closed",
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "Data não disponível";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "há poucos segundos";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} minutos`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} horas`;
  if (diff < 2592000) return `há ${Math.floor(diff / 86400)} dias`;
  return `há ${Math.floor(diff / 2592000)} meses`;
};

export default function EmployeeHome() {
  const { userData } = useAuth();
  const [workspace, setWorkspace] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    if (isFetching.current) return;

    const fetchData = async () => {
      isFetching.current = true;
      setLoading(true);
      try {
        const [wsRes, allRes] = await Promise.all([
          ticketService.getWorkspace({ scope: "active" }),
          ticketService.getWorkspace({ scope: "all" }),
        ]);

        setWorkspace(wsRes?.tickets || wsRes || []);
        setAllTickets(allRes?.tickets || allRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchData();
  }, []);

  // Todos os tickets atribuídos ao funcionário (independente do status)
  const atribuidos = workspace.length;

  // Tickets da empresa sem nenhum funcionário atribuído e status aberto
  const aguardando = allTickets.filter(
    (t) => t.status === "aberto" && !t.assignedUserId
  ).length;

  // Tickets atribuídos ao funcionário com status pendente
  const emAndamento = workspace.filter((t) => t.status === "pendente").length;

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        {/* Hero */}
        <S.HeroSection>
          <S.Eyebrow>
            <S.EyebrowDot />
            <span>Área do funcionário</span>
          </S.Eyebrow>

          <S.WelcomeTitle>
            Olá, <span>{userData?.name || ""}</span>
          </S.WelcomeTitle>

          {userData?.jobTitle && (
            <S.JobTitle>{userData.jobTitle}</S.JobTitle>
          )}

          <S.WelcomeSubtitle>
            Acompanhe seus tickets e mantenha o atendimento em dia.
          </S.WelcomeSubtitle>

          <S.ActionsGrid>
            <S.ActionCard as={Link} to="/funcionario/atendimentos" aria-label="Workspace">
              <S.ActionIcon><IconInbox /></S.ActionIcon>
              Meus Atendimentos
            </S.ActionCard>

            <S.ActionCard as={Link} to="/funcionario/desempenho" aria-label="Meu desempenho">
              <S.ActionIcon><IconPerformance /></S.ActionIcon>
              Meu desempenho
            </S.ActionCard>

            <S.ActionCard as={Link} to="/funcionario/CompanyInfo" aria-label="Informações da empresa" $secondary>
              <S.ActionIcon><IconLogs /></S.ActionIcon>
              Informações da empresa
            </S.ActionCard>
          </S.ActionsGrid>
        </S.HeroSection>

        {/* Métricas */}
        <S.MetricsGrid>
          <S.MetricCard>
            <S.MetricValue>{loading ? "—" : atribuidos}</S.MetricValue>
            <S.MetricLabel>Tickets atribuídos</S.MetricLabel>
          </S.MetricCard>
          <S.MetricCard>
            <S.MetricValue $accent>{loading ? "—" : aguardando}</S.MetricValue>
            <S.MetricLabel>Aguardando atendimento</S.MetricLabel>
          </S.MetricCard>
          <S.MetricCard>
            <S.MetricValue>{loading ? "—" : emAndamento}</S.MetricValue>
            <S.MetricLabel>Em andamento</S.MetricLabel>
          </S.MetricCard>
        </S.MetricsGrid>

        {/* Tickets recentes */}
        <S.SectionHeader>
          <div>
            <S.SectionTitle>Tickets atribuídos a você</S.SectionTitle>
            <S.SectionText>Os tickets ativos do seu workspace.</S.SectionText>
          </div>
        </S.SectionHeader>

        {loading && <S.EmptyState>Carregando tickets...</S.EmptyState>}

        {!loading && workspace.length === 0 && (
          <S.EmptyState>Nenhum ticket atribuído no momento.</S.EmptyState>
        )}

        {!loading && workspace.length > 0 && (
          <S.TicketList>
            {workspace.slice(0, 6).map((ticket) => (
              <S.TicketCard key={ticket.id} as={Link} to={`/funcionario/atendimentos?ticketId=${ticket.id}`}>
                <S.TicketCardTop>
                  <S.TicketId>#{ticket.id}</S.TicketId>
                  <S.StatusBadge $variant={STATUS_VARIANT[ticket.status] || "open"}>
                    {STATUS_LABEL[ticket.status] || ticket.status}
                  </S.StatusBadge>
                </S.TicketCardTop>
                <S.TicketDescription>{ticket.description}</S.TicketDescription>
                <S.TicketMeta>
                  {ticket.tituloReclamacao?.title && (
                    <S.TicketTag>{ticket.tituloReclamacao.title}</S.TicketTag>
                  )}
                  <S.TicketTime>{formatTimeAgo(ticket.updatedAt || ticket.createdAt)}</S.TicketTime>
                </S.TicketMeta>
              </S.TicketCard>
            ))}
          </S.TicketList>
        )}
      </S.Container>
    </S.Page>
  );
}
