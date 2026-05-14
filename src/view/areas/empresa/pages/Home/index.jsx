import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../../../../components/Button";
import LoggedHeader from "../../../../../components/LoggedHeader";
import { companyAdminService } from "../../../../../services/companyAdminService";
import { ticketService } from "../../../../../services/ticketService";
import * as S from "./styles";

const ACTIVE_STATUSES = new Set(["aberto", "pendente", "resolvido"]);

const QUICK_ACTIONS = [
  {
    label: "Insights",
    meta: "Visão executiva",
    title: "Leia as métricas da operação",
    description:
      "Acompanhe indicadores da empresa, veja destaques da equipe e identifique funcionários que precisam de mais atenção.",
    buttonLabel: "Abrir insights",
    path: "/empresa/insights",
    variant: "primary",
    featured: true,
  },
  {
    label: "Chamados",
    meta: "Operação diária",
    title: "Acompanhe a operação em tempo real",
    description:
      "Visualize tickets abertos, redistribua responsáveis e acompanhe o histórico completo de cada atendimento.",
    buttonLabel: "Abrir central",
    path: "/empresa/chamados",
    variant: "primary",
  },
  {
    label: "Assuntos recorrentes",
    meta: "Padronização",
    title: "Monte os temas mais comuns dos tickets",
    description:
      "Cadastre opções como demora na entrega, problemas no site e defeitos no produto para agilizar a abertura de chamados.",
    buttonLabel: "Gerenciar assuntos",
    path: "/empresa/assuntos",
    variant: "primary",
  },
  {
    label: "Dados da empresa",
    meta: "Perfil público",
    title: "Mantenha as informações sempre atualizadas",
    description:
      "Revise nome, descrição e dados cadastrais para que o cliente encontre sua empresa com clareza.",
    buttonLabel: "Abrir configurações",
    path: "/empresa/configuracoes",
    variant: "secondary",
  },
  {
    label: "Colaboradores",
    meta: "Governança",
    title: "Defina quem cuida da operação",
    description:
      "Organize os responsáveis pela empresa e mantenha a administração pronta para crescer sem confusões.",
    buttonLabel: "Ver colaboradores",
    path: "/empresa/administradores",
    variant: "transparent",
  },
];

const getDateKey = (value) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const IconInbox = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V16H8.56C9.25 17.19 10.54 18 12 18C13.46 18 14.75 17.19 15.44 16H19V19ZM19 14H14C14 15.1 13.1 16 12 16C10.9 16 10 15.1 10 14H5V5H19V14Z" />
  </svg>
);

const IconProfile = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 14H16V16H8V14ZM8 10H11V12H8V10Z" />
  </svg>
);

const CompanyHome = () => {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    if (isFetching.current) return;

    const loadHomeData = async () => {
      isFetching.current = true;
      setLoading(true);

      try {
        const [workspaceResult, employeesResult] = await Promise.allSettled([
          ticketService.getWorkspace({ scope: "all" }),
          companyAdminService.listEmployees(),
        ]);

        if (workspaceResult.status === "fulfilled") {
          setTickets(workspaceResult.value?.tickets || []);
        }

        if (employeesResult.status === "fulfilled") {
          setEmployees(employeesResult.value?.employees || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    loadHomeData();
  }, []);

  const todayKey = getDateKey(new Date());
  const activeTickets = tickets.filter((ticket) =>
    ACTIVE_STATUSES.has(ticket.status)
  ).length;
  const unassignedTickets = tickets.filter(
    (ticket) => ACTIVE_STATUSES.has(ticket.status) && !ticket.assignedEmployee
  ).length;
  const createdToday = tickets.filter(
    (ticket) => getDateKey(ticket.createdAt) === todayKey
  ).length;
  const assignedEmployeeIds = new Set(
    tickets
      .filter((ticket) => ticket.assignedEmployee?.id)
      .map((ticket) => String(ticket.assignedEmployee.id))
  );
  const activeEmployeeCount =
    employees.length > 0
      ? employees.filter((employee) =>
          assignedEmployeeIds.has(String(employee.id))
        ).length
      : assignedEmployeeIds.size;

  const metrics = [
    {
      value: loading ? "—" : activeTickets,
      label: "Chamados ativos",
      tone: "default",
    },
    {
      value: loading ? "—" : unassignedTickets,
      label: "Sem responsável",
      tone: unassignedTickets > 0 ? "warning" : "default",
    },
    {
      value: loading ? "—" : createdToday,
      label: "Criados hoje",
      tone: "success",
    },
    {
      value: loading ? "—" : activeEmployeeCount,
      label: "Equipe acionada",
      tone: "default",
    },
  ];

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        <S.HeroSection>
          <S.HeroContent>
            <S.Eyebrow>
              <S.EyebrowDot />
              <span>Área da empresa</span>
            </S.Eyebrow>

            <S.Title>Painel inicial para administrar a operação</S.Title>

            <S.Description>
              Acompanhe os tickets, organize o fluxo e gerencie seus atendimentos.
            </S.Description>

            <S.Actions>
              <S.HeroActionCard
                as={Link}
                to="/empresa/chamados"
                aria-label="Abrir central de chamados"
              >
                <S.HeroActionIcon>
                  <IconInbox />
                </S.HeroActionIcon>
                Central de chamados
              </S.HeroActionCard>

              <S.HeroActionCard
                as={Link}
                to="/empresa/configuracoes"
                aria-label="Ajustar perfil"
                $secondary
              >
                <S.HeroActionIcon>
                  <IconProfile />
                </S.HeroActionIcon>
                Ajustar perfil
              </S.HeroActionCard>
            </S.Actions>
          </S.HeroContent>
        </S.HeroSection>

        <S.MetricsGrid>
          {metrics.map((metric) => (
            <S.MetricCard
              key={metric.label}
              $tone={metric.tone}
            >
              <S.MetricValue $tone={metric.tone}>
                {metric.value}
              </S.MetricValue>
              <S.MetricLabel>{metric.label}</S.MetricLabel>
            </S.MetricCard>
          ))}
        </S.MetricsGrid>

        <S.SectionHeader>
          <div>
            <S.SectionTitle>Atalhos principais</S.SectionTitle>
            <S.SectionText>
              Aqui estão alguns atalhos para facilitar o acesso às principais
              funcionalidades.
            </S.SectionText>
          </div>
        </S.SectionHeader>

        <S.CardGrid>
          {QUICK_ACTIONS.map((action, index) => (
            <S.ActionCard key={action.title} $featured={action.featured}>
              <S.CardTop>
                <div>
                  <S.CardLabel>{action.label}</S.CardLabel>
                  <S.CardMeta>{action.meta}</S.CardMeta>
                </div>
                <S.CardBadge $featured={action.featured}>
                  {String(index + 1).padStart(2, "0")}
                </S.CardBadge>
              </S.CardTop>

              <S.CardBody>
                <S.CardHeading>{action.title}</S.CardHeading>
                <S.CardText>{action.description}</S.CardText>
              </S.CardBody>

              <S.CardFooter>
                <Button variant={action.variant} redirect={action.path}>
                  {action.buttonLabel}
                </Button>
              </S.CardFooter>
            </S.ActionCard>
          ))}
        </S.CardGrid>
      </S.Container>
    </S.Page>
  );
};

export default CompanyHome;
