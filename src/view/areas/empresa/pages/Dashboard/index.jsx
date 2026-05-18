import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  CheckCheck,
  CircleAlert,
  Clock3,
  Info,
  Sparkles,
  Star,
  Ticket,
  TriangleAlert,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

import Button from "../../../../../components/Button";
import LoggedHeader from "../../../../../components/LoggedHeader";
import { companyAdminService } from "../../../../../services/companyAdminService";
import { ticketService } from "../../../../../services/ticketService";
import {
  buildTicketProtocol,
  formatDateTime,
  getMessageSenderLabel,
  getMessageTagLabel,
  getTicketStatusLabel,
  getTicketStatusTone,
  getUserInitials,
} from "../../../../../utils/ticket";
import * as S from "./styles";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ACTIVE_STATUSES = new Set(["aberto", "pendente", "resolvido"]);
const CONCLUDED_STATUSES = new Set(["resolvido", "fechado"]);

const QUICK_ACTIONS = [
  {
    label: "Chamados",
    title: "Central de tickets",
    description:
      "Abra a fila completa, redistribua responsáveis e acompanhe o histórico de cada atendimento.",
    buttonLabel: "Ir para chamados",
    path: "/empresa/chamados",
    variant: "primary",
  },
  {
    label: "Colaboradores",
    title: "Administradores e funcionários",
    description:
      "Veja quem está na operação, ajuste cargos e mantenha a equipe pronta para escalar.",
    buttonLabel: "Gerenciar equipe",
    path: "/empresa/administradores",
    variant: "secondary",
  },
  {
    label: "Assuntos",
    title: "Temas recorrentes",
    description:
      "Revise os motivos mais comuns dos tickets e mantenha a abertura de chamados objetiva.",
    buttonLabel: "Revisar assuntos",
    path: "/empresa/assuntos",
    variant: "transparent",
  },
];

const createDateFromValue = (value) => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getDateKey = (value) => {
  const parsedDate = createDateFromValue(value);

  if (!parsedDate) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatShortDate = (value) => {
  const parsedDate = createDateFromValue(value);

  if (!parsedDate) return "-";

  return parsedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const formatRatingLabel = (value) =>
  typeof value === "number" ? value.toFixed(1).replace(".", ",") : "—";

const formatPercentLabel = (value) => `${Math.round(value || 0)}%`;
const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

const getEmployeeAvatarUrl = (employee) => {
  const avatarUrl = employee?.avatarUrl || employee?.avatar_url || null;

  if (typeof avatarUrl !== "string") return null;

  const normalizedAvatarUrl = avatarUrl.trim();
  return normalizedAvatarUrl || null;
};

const getResolutionSourceLabel = (value) => {
  if (value === "chatbot") return "Resolvido pelo chatbot";
  if (value === "human") return "Resolvido pelo atendimento";
  return "Resolução registrada";
};

const getAiInsightToneLabel = (tone) => {
  if (tone === "success") return "Força";
  if (tone === "warning") return "Atenção";
  if (tone === "danger") return "Risco";
  return "Leitura";
};

const getAlertToneIcon = (tone) => {
  if (tone === "success") return CheckCheck;
  if (tone === "warning") return TriangleAlert;
  if (tone === "danger") return CircleAlert;
  return Info;
};

const DEFAULT_AI_INSIGHTS_STATE = {
  loading: false,
  error: "",
  data: null,
  requested: false,
};
const AI_REVEAL_STEP_MS = 36;
const AI_REVEAL_SUMMARY_DELAY_MS = 140;
const AI_REVEAL_INSIGHT_DELAY_MS = 320;
const AI_REVEAL_EVIDENCE_DELAY_MS = 140;

const IconAiInsights = () => <Sparkles size={18} strokeWidth={2.1} aria-hidden="true" />;

const splitTextForReveal = (value = "") =>
  String(value || "")
    .split(/(\s+)/)
    .filter((token) => token.length > 0);

const buildAiInsightsAnimationKey = (aiInsights) => {
  if (!aiInsights) return "ai-insights-empty";

  return [
    aiInsights.generatedAt || "",
    aiInsights.headline || "",
    aiInsights.summary || "",
    ...(Array.isArray(aiInsights.insights)
      ? aiInsights.insights.flatMap((insight) => [
          insight.title || "",
          insight.summary || "",
          insight.recommendedAction || "",
          ...(Array.isArray(insight.evidence) ? insight.evidence : []),
        ])
      : []),
  ].join("::");
};

const ProgressiveText = ({
  component: componentTag = "span",
  text = "",
  animationKey = "",
  enabled = false,
  delayMs = 0,
  stepMs = AI_REVEAL_STEP_MS,
  ...rest
}) => {
  const tokens = useMemo(() => splitTextForReveal(text), [text]);
  const [visibleTokenCount, setVisibleTokenCount] = useState(
    enabled ? 0 : tokens.length
  );
  const isAnimating = enabled && visibleTokenCount < tokens.length;

  useEffect(() => {
    if (!enabled || tokens.length === 0) {
      setVisibleTokenCount(tokens.length);
      return undefined;
    }

    let intervalId;
    let timeoutId;

    setVisibleTokenCount(0);

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleTokenCount((previousCount) => {
          const nextCount = Math.min(tokens.length, previousCount + 1);

          if (nextCount >= tokens.length && intervalId) {
            window.clearInterval(intervalId);
            intervalId = undefined;
          }

          return nextCount;
        });
      }, stepMs);
    }, delayMs);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [animationKey, delayMs, enabled, stepMs, tokens.length]);

  return createElement(
    componentTag,
    rest,
    tokens.slice(0, visibleTokenCount).join(""),
    isAnimating
      ? createElement(S.AiTypingCursor, {
          "aria-hidden": true,
          key: "typing-cursor",
        })
      : null
  );
};

const buildDailyVolume = (tickets) => {
  const countsByDay = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tickets.forEach((ticket) => {
    const dateKey = getDateKey(ticket.createdAt);
    if (!dateKey) return;

    countsByDay.set(dateKey, (countsByDay.get(dateKey) || 0) + 1);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() - (6 - index));

    const dateKey = getDateKey(currentDay);

    return {
      label: DAY_LABELS[currentDay.getDay()],
      count: countsByDay.get(dateKey) || 0,
    };
  });
};

const buildSubjectSummary = (tickets) => {
  const counts = new Map();

  tickets.forEach((ticket) => {
    const subject = ticket.complaintTitle?.title || "Sem assunto";
    counts.set(subject, (counts.get(subject) || 0) + 1);
  });

  const totalTickets = tickets.length || 1;

  return Array.from(counts.entries())
    .map(([title, count]) => ({
      title,
      count,
      share: Math.round((count / totalTickets) * 100),
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
};

const buildEmployeeReviewGroups = (employeeMetrics, tickets) =>
  employeeMetrics
    .map((employee) => {
      const reviews = tickets
        .filter(
          (ticket) =>
            String(ticket.assignedEmployee?.id || "") === String(employee.id) &&
            Number(ticket.evaluation?.rating || 0) > 0
        )
        .sort((left, right) => {
          const leftTime =
            createDateFromValue(
              left.evaluation?.submittedAt || left.updatedAt || left.createdAt
            )?.getTime() || 0;
          const rightTime =
            createDateFromValue(
              right.evaluation?.submittedAt || right.updatedAt || right.createdAt
            )?.getTime() || 0;

          return rightTime - leftTime;
        })
        .map((ticket) => ({
          ticketId: ticket.id,
          protocol: buildTicketProtocol(ticket.id),
          subject: ticket.complaintTitle?.title || "Sem assunto",
          rating: Number(ticket.evaluation?.rating || 0),
          comment: ticket.evaluation?.comment || "",
          submittedAt:
            ticket.evaluation?.submittedAt || ticket.updatedAt || ticket.createdAt,
          customerName: ticket.customer?.name || "Cliente",
          resolutionSource: ticket.evaluation?.resolutionSource || null,
        }));

      return {
        ...employee,
        reviews,
      };
    })
    .filter((employee) => employee.reviews.length > 0)
    .sort((left, right) => {
      if (right.reviews.length !== left.reviews.length) {
        return right.reviews.length - left.reviews.length;
      }

      if ((right.averageRating || 0) !== (left.averageRating || 0)) {
        return (right.averageRating || 0) - (left.averageRating || 0);
      }

      return String(left.name || "").localeCompare(String(right.name || ""));
    });

const getTicketLastActivity = (ticket) => {
  const timestamps = [
    ticket.updatedAt,
    ticket.closedAt,
    ticket.resolvedAt,
    ticket.createdAt,
  ]
    .map(createDateFromValue)
    .filter(Boolean)
    .map((date) => date.getTime());

  if (timestamps.length === 0) return null;

  return new Date(Math.max(...timestamps));
};

const buildEmployeeMetrics = (employees, tickets) => {
  const employeeRegistry = new Map();

  employees.forEach((employee) => {
    employeeRegistry.set(String(employee.id), employee);
  });

  tickets.forEach((ticket) => {
    const assignedEmployee = ticket.assignedEmployee;

    if (!assignedEmployee?.id) return;

    if (!employeeRegistry.has(String(assignedEmployee.id))) {
      employeeRegistry.set(String(assignedEmployee.id), assignedEmployee);
    }
  });

  return Array.from(employeeRegistry.values())
    .map((employee) => {
      const assignedTickets = tickets.filter(
        (ticket) =>
          String(ticket.assignedEmployee?.id || "") === String(employee.id)
      );
      const activeTickets = assignedTickets.filter((ticket) =>
        ACTIVE_STATUSES.has(ticket.status)
      );
      const pendingTickets = assignedTickets.filter(
        (ticket) => ticket.status === "pendente"
      );
      const concludedTickets = assignedTickets.filter((ticket) =>
        CONCLUDED_STATUSES.has(ticket.status)
      );
      const ratings = assignedTickets
        .map((ticket) => Number(ticket.evaluation?.rating || 0))
        .filter((rating) => rating > 0);
      const averageRating =
        ratings.length > 0
          ? Number(
              (
                ratings.reduce((accumulator, rating) => accumulator + rating, 0) /
                ratings.length
              ).toFixed(1)
            )
          : null;
      const completionRate =
        assignedTickets.length > 0
          ? Math.round((concludedTickets.length / assignedTickets.length) * 100)
          : 0;
      const lastActivity = assignedTickets
        .map(getTicketLastActivity)
        .filter(Boolean)
        .sort((left, right) => right.getTime() - left.getTime())[0] || null;

      return {
        ...employee,
        assignedCount: assignedTickets.length,
        activeCount: activeTickets.length,
        pendingCount: pendingTickets.length,
        concludedCount: concludedTickets.length,
        ratingCount: ratings.length,
        averageRating,
        completionRate,
        lastActivity,
      };
    })
    .sort((left, right) => {
      if (right.concludedCount !== left.concludedCount) {
        return right.concludedCount - left.concludedCount;
      }

      if ((right.averageRating || 0) !== (left.averageRating || 0)) {
        return (right.averageRating || 0) - (left.averageRating || 0);
      }

      if (right.activeCount !== left.activeCount) {
        return right.activeCount - left.activeCount;
      }

      return String(left.name || "").localeCompare(String(right.name || ""));
    });
};

const buildEmployeeHighlights = (employees) => {
  const employeesWithTickets = employees.filter(
    (employee) => employee.assignedCount > 0
  );
  const topResolver = employeesWithTickets.find(
    (employee) => employee.concludedCount > 0
  );
  const topRated = [...employeesWithTickets]
    .filter((employee) => employee.averageRating !== null)
    .sort((left, right) => {
      if ((right.averageRating || 0) !== (left.averageRating || 0)) {
        return (right.averageRating || 0) - (left.averageRating || 0);
      }

      return right.ratingCount - left.ratingCount;
    })[0];
  const topLoad = [...employeesWithTickets].sort(
    (left, right) => right.activeCount - left.activeCount
  )[0];

  return [
    topResolver
      ? {
          id: topResolver.id,
          label: "Mais resoluções",
          title: topResolver.name,
          helper: topResolver.jobTitle || "Funcionário da operação",
          metric: `${topResolver.concludedCount} concluídos`,
          caption: `${topResolver.activeCount} ativos na carteira`,
          avatarUrl: getEmployeeAvatarUrl(topResolver),
          initials: getUserInitials(topResolver.name, "EQ"),
        }
      : null,
    topRated
      ? {
          id: topRated.id,
          label: "Melhor satisfação",
          title: topRated.name,
          helper: topRated.jobTitle || "Funcionário da operação",
          metric: `${formatRatingLabel(topRated.averageRating)} de média`,
          caption: `${topRated.ratingCount} avaliação(ões) registrada(s)`,
          avatarUrl: getEmployeeAvatarUrl(topRated),
          initials: getUserInitials(topRated.name, "EQ"),
        }
      : null,
    topLoad
      ? {
          id: topLoad.id,
          label: "Maior carteira ativa",
          title: topLoad.name,
          helper: topLoad.jobTitle || "Funcionário da operação",
          metric: `${topLoad.activeCount} tickets ativos`,
          caption: `${topLoad.pendingCount} em atendimento humano`,
          avatarUrl: getEmployeeAvatarUrl(topLoad),
          initials: getUserInitials(topLoad.name, "EQ"),
        }
      : null,
  ].filter(Boolean);
};

const getAttentionReasons = (employee) => {
  const reasons = [];

  if (employee.pendingCount >= 3) {
    reasons.push("Fila pendente alta");
  }

  if (
    employee.activeCount >= 2 &&
    employee.activeCount >= employee.concludedCount + 2
  ) {
    reasons.push("Mais tickets ativos do que concluídos");
  }

  if (employee.averageRating !== null && employee.averageRating < 4) {
    reasons.push("Avaliação abaixo do ideal");
  }

  if (employee.concludedCount === 0 && employee.activeCount >= 2) {
    reasons.push("Nenhum ticket concluído");
  }

  return reasons.slice(0, 2);
};

const buildAttentionEmployees = (employees) =>
  employees
    .map((employee) => ({
      ...employee,
      reasons: getAttentionReasons(employee),
    }))
    .filter(
      (employee) => employee.assignedCount > 0 && employee.reasons.length > 0
    )
    .sort((left, right) => {
      if (right.pendingCount !== left.pendingCount) {
        return right.pendingCount - left.pendingCount;
      }

      if ((left.averageRating || 99) !== (right.averageRating || 99)) {
        return (left.averageRating || 99) - (right.averageRating || 99);
      }

      return right.activeCount - left.activeCount;
    })
    .slice(0, 4);

const buildOperationalAlerts = ({
  unassignedTickets,
  attentionEmployees,
  averageRating,
  createdToday,
}) => {
  const alerts = [];

  if (unassignedTickets > 0) {
    alerts.push({
      tone: "danger",
      label: `${unassignedTickets} ticket(s) sem responsável`,
      text: "Vale redistribuir a fila antes que o tempo de resposta aumente.",
    });
  }

  if (attentionEmployees.length > 0) {
    alerts.push({
      tone: "warning",
      label: `${attentionEmployees.length} profissional(is) pedem atenção`,
      text: "Há sinais de baixa efetividade ou concentração excessiva de tickets.",
    });
  }

  if (averageRating !== null && averageRating < 4) {
    alerts.push({
      tone: "neutral",
      label: `Satisfação média em ${formatRatingLabel(averageRating)}`,
      text: "Revise casos recentes e identifique os pontos de atrito do atendimento.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      tone: "success",
      label: "Operação sob controle",
      text:
        createdToday > 0
          ? `${createdToday} ticket(s) criado(s) hoje e sem alertas críticos no momento.`
          : "A fila está distribuída e sem sinais críticos agora.",
    });
  }

  return alerts.slice(0, 3);
};

const CompanyDashboard = () => {
  const [company, setCompany] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiInsightsState, setAiInsightsState] = useState(
    DEFAULT_AI_INSIGHTS_STATE
  );
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [ticketHistoryDialog, setTicketHistoryDialog] = useState({
    isOpen: false,
    loading: false,
    error: "",
    ticket: null,
    detail: null,
    messages: [],
  });

  const loadAiInsights = useCallback(async ({ preserveData = true } = {}) => {
    setAiInsightsState((previous) => ({
      loading: true,
      error: "",
      data: preserveData ? previous.data : null,
      requested: true,
    }));

    try {
      const response = await companyAdminService.getAiInsights();

      if (response?.status >= 400) {
        throw new Error(
          response.message ||
            "Não foi possível gerar a leitura da IA para os insights."
        );
      }

      setAiInsightsState({
        loading: false,
        error: "",
        data: response,
        requested: true,
      });
    } catch (requestError) {
      setAiInsightsState((previous) => ({
        loading: false,
        error:
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Não foi possível gerar a leitura da IA para os insights.",
        data: preserveData ? previous.data : null,
        requested: true,
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [workspaceResponse, employeesResponse] = await Promise.all([
          ticketService.getWorkspace({ scope: "all" }),
          companyAdminService.listEmployees(),
        ]);

        if (!active) return;

        if (workspaceResponse?.status >= 400) {
          throw new Error(
            workspaceResponse.message ||
              "Não foi possível carregar os tickets da empresa."
          );
        }

        if (employeesResponse?.status >= 400) {
          throw new Error(
            employeesResponse.message ||
              "Não foi possível carregar a equipe da empresa."
          );
        }

        setCompany(workspaceResponse.company || employeesResponse.company || null);
        setTickets(workspaceResponse.tickets || []);
        setEmployees(employeesResponse.employees || []);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Não foi possível carregar o dashboard da empresa."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [loadAiInsights]);

  useEffect(() => {
    if (!isReviewsDialogOpen && !ticketHistoryDialog.isOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;

      if (ticketHistoryDialog.isOpen) {
        setTicketHistoryDialog({
          isOpen: false,
          loading: false,
          error: "",
          ticket: null,
          detail: null,
          messages: [],
        });
      }

      if (isReviewsDialogOpen) {
        setIsReviewsDialogOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isReviewsDialogOpen, ticketHistoryDialog.isOpen]);

  const handleAvatarError = (avatarKey) => {
    setAvatarLoadErrors((previous) => {
      if (previous[avatarKey]) return previous;

      return {
        ...previous,
        [avatarKey]: true,
      };
    });
  };

  const renderEmployeeAvatar = ({
    avatarKey,
    avatarUrl,
    initials,
    name,
  }) => {
    const shouldShowAvatarImage =
      Boolean(avatarUrl) && !avatarLoadErrors[avatarKey];

    return (
      <S.Avatar>
        {shouldShowAvatarImage ? (
          <S.AvatarImage
            src={avatarUrl}
            alt={name}
            onError={() => handleAvatarError(avatarKey)}
          />
        ) : (
          initials
        )}
      </S.Avatar>
    );
  };

  const todayKey = getDateKey(new Date());
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status === "aberto").length;
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "pendente"
  ).length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolvido"
  ).length;
  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "fechado"
  ).length;
  const concludedTickets = resolvedTickets + closedTickets;
  const createdToday = tickets.filter(
    (ticket) => getDateKey(ticket.createdAt) === todayKey
  ).length;
  const activeTickets = tickets.filter((ticket) =>
    ACTIVE_STATUSES.has(ticket.status)
  ).length;
  const unassignedTickets = tickets.filter(
    (ticket) => ACTIVE_STATUSES.has(ticket.status) && !ticket.assignedEmployee
  ).length;
  const ratings = tickets
    .map((ticket) => Number(ticket.evaluation?.rating || 0))
    .filter((rating) => rating > 0);
  const averageRating =
    ratings.length > 0
      ? Number(
          (
            ratings.reduce(
              (accumulator, rating) => accumulator + rating,
              0
            ) / ratings.length
          ).toFixed(1)
        )
      : null;
  const completionRate =
    totalTickets > 0 ? (concludedTickets / totalTickets) * 100 : 0;
  const employeeMetrics = buildEmployeeMetrics(employees, tickets);
  const activeTeamCount = employeeMetrics.filter(
    (employee) => employee.assignedCount > 0
  ).length;
  const teamCoverage =
    employees.length > 0 ? (activeTeamCount / employees.length) * 100 : 0;
  const dailyVolume = buildDailyVolume(tickets);
  const statusDistribution = [
    {
      key: "aberto",
      label: "Abertos",
      count: openTickets,
      tone: getTicketStatusTone("aberto"),
    },
    {
      key: "pendente",
      label: "Em atendimento",
      count: inProgressTickets,
      tone: getTicketStatusTone("pendente"),
    },
    {
      key: "resolvido",
      label: "Resolvidos",
      count: resolvedTickets,
      tone: getTicketStatusTone("resolvido"),
    },
    {
      key: "fechado",
      label: "Fechados",
      count: closedTickets,
      tone: getTicketStatusTone("fechado"),
    },
  ].map((item) => ({
    ...item,
    share: totalTickets > 0 ? Math.round((item.count / totalTickets) * 100) : 0,
  }));
  const employeeHighlights = buildEmployeeHighlights(employeeMetrics);
  const attentionEmployees = buildAttentionEmployees(employeeMetrics);
  const heroStats = [
    {
      label: "funcionário(s) cadastrado(s)",
      value: employees.length,
      icon: Users,
    },
    {
      label: "com tickets atribuídos",
      value: activeTeamCount,
      icon: UserCheck,
    },
    {
      label: "avaliação(ões) recebida(s)",
      value: ratings.length,
      icon: Star,
    },
  ];
  const metricCards = [
    {
      label: "Total de tickets",
      value: totalTickets,
      helper: "Base completa de atendimentos da empresa.",
      icon: Ticket,
      tone: "neutral",
    },
    {
      label: "Em atendimento",
      value: inProgressTickets,
      helper: "Tickets no fluxo humano neste momento.",
      icon: Clock3,
      tone: "warning",
    },
    {
      label: "Concluídos",
      value: concludedTickets,
      helper: `${resolvedTickets} resolvido(s) e ${closedTickets} fechado(s).`,
      icon: CheckCheck,
      tone: "success",
    },
    {
      label: "Satisfação média",
      value: formatRatingLabel(averageRating),
      helper: `Considerando ${ratings.length} avaliação(ões) válidas.`,
      icon: Star,
      tone: "neutral",
    },
    {
      label: "Criados hoje",
      value: createdToday,
      helper: "Novos tickets registrados no dia atual.",
      icon: Activity,
      tone: "neutral",
    },
    {
      label: "Sem responsável",
      value: unassignedTickets,
      helper: "Tickets ativos ainda sem funcionário definido.",
      icon: UserMinus,
      tone: "danger",
    },
  ];
  const recentTickets = [...tickets]
    .sort((left, right) => {
      const leftDate = createDateFromValue(left.createdAt)?.getTime() || 0;
      const rightDate = createDateFromValue(right.createdAt)?.getTime() || 0;
      return rightDate - leftDate;
    })
    .slice(0, 6);
  const subjectSummary = buildSubjectSummary(tickets);
  const employeeReviewGroups = buildEmployeeReviewGroups(
    employeeMetrics,
    tickets
  );
  const alerts = buildOperationalAlerts({
    unassignedTickets,
    attentionEmployees,
    averageRating,
    createdToday,
  });
  const maxVolume = Math.max(
    ...dailyVolume.map((item) => item.count),
    1
  );
  const maxSubjectCount = Math.max(
    ...subjectSummary.map((item) => item.count),
    1
  );
  const canOpenTicketInWorkspace =
    (ticketHistoryDialog.detail?.status || ticketHistoryDialog.ticket?.status) !==
    "fechado";
  const aiInsights = aiInsightsState.data;
  const aiInsightsAnimationKey = buildAiInsightsAnimationKey(aiInsights);
  const aiInsightsGeneratedAt = aiInsights?.generatedAt
    ? formatDateTime(aiInsights.generatedAt)
    : null;

  const closeTicketHistoryDialog = () => {
    setTicketHistoryDialog({
      isOpen: false,
      loading: false,
      error: "",
      ticket: null,
      detail: null,
      messages: [],
    });
  };

  const handleOpenTicketHistory = async (ticket) => {
    const targetTicketId = String(ticket.id);

    setTicketHistoryDialog({
      isOpen: true,
      loading: true,
      error: "",
      ticket,
      detail: ticket,
      messages: [],
    });

    try {
      const [detailResponse, messagesResponse] = await Promise.all([
        ticketService.getTicketDetail(ticket.id),
        ticketService.getTicketMessages(ticket.id),
      ]);

      if (detailResponse?.status >= 400) {
        throw new Error(
          detailResponse.message ||
            "Não foi possível carregar os detalhes do ticket."
        );
      }

      if (messagesResponse?.status >= 400) {
        throw new Error(
          messagesResponse.message ||
            "Não foi possível carregar a troca de mensagens."
        );
      }

      setTicketHistoryDialog((previous) => {
        if (String(previous.ticket?.id || "") !== targetTicketId) {
          return previous;
        }

        return {
          ...previous,
          loading: false,
          error: "",
          detail: detailResponse.ticket || messagesResponse.ticket || ticket,
          messages: messagesResponse.messages || [],
        };
      });
    } catch (requestError) {
      setTicketHistoryDialog((previous) => {
        if (String(previous.ticket?.id || "") !== targetTicketId) {
          return previous;
        }

        return {
          ...previous,
          loading: false,
          error:
            requestError?.response?.data?.message ||
            requestError?.message ||
            "Não foi possível carregar o histórico do ticket.",
        };
      });
    }
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        {loading ? (
          <S.EmptyPanel>Carregando dashboard da empresa...</S.EmptyPanel>
        ) : null}

        {!loading && error ? <S.EmptyPanel>{error}</S.EmptyPanel> : null}

        {!loading && !error ? (
          <>
            <S.HeroSection>
              <S.HeroCard>
                <S.Eyebrow>
                  <S.EyebrowDot>
                    <Building2 size={13} strokeWidth={2.2} aria-hidden="true" />
                  </S.EyebrowDot>
                  <span>Dashboard da empresa</span>
                </S.Eyebrow>

                <S.Title>
                  {company?.name || "Insights para acompanhar a operação"}
                </S.Title>

                <S.Description>
                  {company?.description ||
                    "Acompanhe volume de tickets, saúde da operação e sinais de desempenho da equipe em uma única visão."}
                </S.Description>

                <S.HeroStats>
                  {heroStats.map((stat) => {
                    const StatIcon = stat.icon;

                    return (
                      <S.HeroStat key={stat.label}>
                        <S.HeroStatIcon aria-hidden="true">
                          <StatIcon size={18} strokeWidth={2.1} />
                        </S.HeroStatIcon>
                        <S.HeroStatContent>
                          <strong>{stat.value}</strong>
                          <span>{stat.label}</span>
                        </S.HeroStatContent>
                      </S.HeroStat>
                    );
                  })}
                </S.HeroStats>

                <S.Actions>
                  <Button variant="primary" redirect="/empresa/chamados">
                    Abrir chamados
                  </Button>
                  <Button
                    variant="secondary"
                    redirect="/empresa/administradores"
                  >
                    Gerenciar equipe
                  </Button>
                </S.Actions>
              </S.HeroCard>

              <S.OverviewCard>
                <S.OverviewLabel>
                  <Activity size={16} strokeWidth={2.1} aria-hidden="true" />
                  <span>Leitura rápida</span>
                </S.OverviewLabel>
                <S.OverviewTitle>O que merece atenção agora</S.OverviewTitle>

                <S.AlertList>
                  {alerts.map((alert) => {
                    const AlertIcon = getAlertToneIcon(alert.tone);

                    return (
                      <S.AlertItem key={alert.label}>
                        <S.AlertMarker $tone={alert.tone} aria-hidden="true">
                          <AlertIcon size={18} strokeWidth={2.2} />
                        </S.AlertMarker>
                        <div>
                          <S.AlertLabel>{alert.label}</S.AlertLabel>
                          <S.AlertText>{alert.text}</S.AlertText>
                        </div>
                      </S.AlertItem>
                    );
                  })}
                </S.AlertList>
              </S.OverviewCard>
            </S.HeroSection>

            <S.MetricsGrid>
              {metricCards.map((metric) => {
                const MetricIcon = metric.icon;

                return (
                  <S.MetricCard key={metric.label}>
                    <S.MetricCardHeader>
                      <S.MetricLabel>{metric.label}</S.MetricLabel>
                      <S.MetricIcon $tone={metric.tone} aria-hidden="true">
                        <MetricIcon size={18} strokeWidth={2.1} />
                      </S.MetricIcon>
                    </S.MetricCardHeader>
                    <S.MetricValue>{metric.value}</S.MetricValue>
                    <S.MetricHelper>{metric.helper}</S.MetricHelper>
                  </S.MetricCard>
                );
              })}
            </S.MetricsGrid>

            <S.Panel>
              <S.PanelHeader>
                <div>
                  <S.PanelTitle>Leitura pontuada pela IA</S.PanelTitle>
                  <S.PanelText>
                    Uma camada adicional para destacar sinais operacionais, riscos e ações sugeridas com base nos dados mais recentes da empresa.
                  </S.PanelText>
                </div>

                <S.DialogHeaderActions>
                  <S.AiGenerateButton
                    type="button"
                    onClick={() => loadAiInsights({ preserveData: true })}
                    disabled={aiInsightsState.loading}
                  >
                    <S.AiGenerateIcon>
                      <IconAiInsights />
                    </S.AiGenerateIcon>
                    {aiInsightsState.loading
                      ? "Gerando leitura..."
                      : aiInsightsState.requested
                      ? "Gerar nova leitura"
                      : "Gerar leitura"}
                  </S.AiGenerateButton>
                </S.DialogHeaderActions>
              </S.PanelHeader>

              {!aiInsightsState.requested ? (
                <S.EmptyInline>
                  Gere a leitura quando quiser analisar os pontos mais relevantes da operação com apoio da IA.
                </S.EmptyInline>
              ) : null}

              {aiInsightsState.loading && !aiInsights ? (
                <S.EmptyInline>Gerando leitura da IA...</S.EmptyInline>
              ) : null}

              {aiInsightsState.requested &&
              !aiInsightsState.loading &&
              aiInsightsState.error &&
              !aiInsights ? (
                <S.EmptyInline>{aiInsightsState.error}</S.EmptyInline>
              ) : null}

              {aiInsights ? (
                <>
                  <S.AiSummaryCard>
                    <div>
                      <S.AiSummaryLabel>Resumo executivo</S.AiSummaryLabel>
                      <ProgressiveText
                        component={S.AiSummaryTitle}
                        text={aiInsights.headline}
                        animationKey={`${aiInsightsAnimationKey}-headline`}
                        enabled
                        delayMs={AI_REVEAL_SUMMARY_DELAY_MS}
                      />
                      <ProgressiveText
                        component={S.AiSummaryText}
                        text={aiInsights.summary}
                        animationKey={`${aiInsightsAnimationKey}-summary`}
                        enabled
                        delayMs={AI_REVEAL_SUMMARY_DELAY_MS + 180}
                      />
                    </div>

                    <S.AiSummaryMeta>
                      <span>
                        {aiInsightsGeneratedAt
                          ? `Atualizado em ${aiInsightsGeneratedAt}`
                          : "Leitura recém-gerada"}
                      </span>
                      <span>
                        {aiInsights?.sourceData?.ticketsAnalyzed || 0} ticket(s) analisado(s)
                      </span>
                      <span>
                        {aiInsights?.sourceData?.employeesAnalyzed || 0} colaborador(es) considerado(s)
                      </span>
                    </S.AiSummaryMeta>
                  </S.AiSummaryCard>

                  {aiInsightsState.loading ? (
                    <S.AiRefreshNote>Atualizando leitura da IA...</S.AiRefreshNote>
                  ) : null}

                  {!aiInsightsState.loading && aiInsightsState.error ? (
                    <S.EmptyInline>{aiInsightsState.error}</S.EmptyInline>
                  ) : null}

                  {Array.isArray(aiInsights.insights) &&
                  aiInsights.insights.length > 0 ? (
                    <S.AiInsightGrid>
                      {aiInsights.insights.map((insight, insightIndex) => {
                        const insightEvidence = Array.isArray(insight.evidence)
                          ? insight.evidence
                          : [];
                        const insightDelay =
                          AI_REVEAL_SUMMARY_DELAY_MS +
                          360 +
                          insightIndex * AI_REVEAL_INSIGHT_DELAY_MS;

                        return (
                        <S.AiInsightCard
                          key={`${insight.title}-${insight.recommendedAction}`}
                        >
                          <S.AiInsightHeader>
                            <div>
                              <S.AiSummaryLabel>
                                {getAiInsightToneLabel(insight.tone)}
                              </S.AiSummaryLabel>
                              <ProgressiveText
                                component={S.AiInsightTitle}
                                text={insight.title}
                                animationKey={`${aiInsightsAnimationKey}-title-${insightIndex}`}
                                enabled
                                delayMs={insightDelay}
                              />
                            </div>

                            <S.StatusBadge $tone={insight.tone}>
                              {getAiInsightToneLabel(insight.tone)}
                            </S.StatusBadge>
                          </S.AiInsightHeader>

                          <ProgressiveText
                            component={S.AiInsightText}
                            text={insight.summary}
                            animationKey={`${aiInsightsAnimationKey}-insight-summary-${insightIndex}`}
                            enabled
                            delayMs={insightDelay + 140}
                          />

                          {insightEvidence.length > 0 ? (
                            <S.AiEvidenceList>
                              {insightEvidence.map((evidence, evidenceIndex) => (
                                <ProgressiveText
                                  key={`${evidence}-${evidenceIndex}`}
                                  component="li"
                                  text={evidence}
                                  animationKey={`${aiInsightsAnimationKey}-evidence-${insightIndex}-${evidenceIndex}`}
                                  enabled
                                  delayMs={
                                    insightDelay +
                                    240 +
                                    evidenceIndex * AI_REVEAL_EVIDENCE_DELAY_MS
                                  }
                                />
                              ))}
                            </S.AiEvidenceList>
                          ) : null}

                          <S.AiActionBox>
                            <strong>Ação sugerida</strong>
                            <ProgressiveText
                              component="span"
                              text={insight.recommendedAction}
                              animationKey={`${aiInsightsAnimationKey}-action-${insightIndex}`}
                              enabled
                              delayMs={
                                insightDelay +
                                320 +
                                insightEvidence.length * AI_REVEAL_EVIDENCE_DELAY_MS
                              }
                            />
                          </S.AiActionBox>
                        </S.AiInsightCard>
                        );
                      })}
                    </S.AiInsightGrid>
                  ) : (
                    <S.EmptyInline>
                      A IA não encontrou pontos relevantes o suficiente para destacar agora.
                    </S.EmptyInline>
                  )}
                </>
              ) : null}
            </S.Panel>

            <S.InsightsGrid>
              <S.Panel>
                <S.PanelHeader>
                  <div>
                    <S.PanelTitle>Volume dos últimos 7 dias</S.PanelTitle>
                    <S.PanelText>
                      Quantidade de tickets criados por dia.
                    </S.PanelText>
                  </div>
                </S.PanelHeader>

                <S.VolumeChart>
                  {dailyVolume.map((item) => (
                    <S.VolumeColumn key={item.label}>
                      <S.VolumeCount>{item.count}</S.VolumeCount>
                      <S.VolumeBarTrack>
                        <S.VolumeBarFill
                          style={{
                            height: `${Math.max(
                              14,
                              (item.count / maxVolume) * 100
                            )}%`,
                          }}
                        />
                      </S.VolumeBarTrack>
                      <S.VolumeLabel>{item.label}</S.VolumeLabel>
                    </S.VolumeColumn>
                  ))}
                </S.VolumeChart>
              </S.Panel>

              <S.Panel>
                <S.PanelHeader>
                  <div>
                    <S.PanelTitle>Status da operação</S.PanelTitle>
                    <S.PanelText>
                      Distribuição dos tickets por etapa do atendimento.
                    </S.PanelText>
                  </div>
                </S.PanelHeader>

                <S.StatusList>
                  {statusDistribution.map((status) => (
                    <S.StatusRow key={status.key}>
                      <S.StatusTop>
                        <S.StatusTitleGroup>
                          <S.StatusBullet $tone={status.tone} />
                          <S.StatusName>{status.label}</S.StatusName>
                        </S.StatusTitleGroup>
                        <S.StatusValue>
                          {status.count} • {formatPercentLabel(status.share)}
                        </S.StatusValue>
                      </S.StatusTop>
                      <S.StatusTrack>
                        <S.StatusFill
                          $tone={status.tone}
                          style={{ width: `${status.share}%` }}
                        />
                      </S.StatusTrack>
                    </S.StatusRow>
                  ))}
                </S.StatusList>

                <S.PanelSummary>
                  <S.SummaryPill>
                    <strong>{formatPercentLabel(completionRate)}</strong>
                    <span>taxa de conclusão</span>
                  </S.SummaryPill>
                  <S.SummaryPill>
                    <strong>{formatPercentLabel(teamCoverage)}</strong>
                    <span>cobertura da equipe</span>
                  </S.SummaryPill>
                  <S.SummaryPill>
                    <strong>{activeTickets}</strong>
                    <span>tickets ativos</span>
                  </S.SummaryPill>
                </S.PanelSummary>
              </S.Panel>
            </S.InsightsGrid>

            <S.SectionHeader>
              <div>
                <S.SectionTitle>Funcionários em destaque</S.SectionTitle>
                <S.SectionText>
                  Seleção automática com base em conclusões, satisfação e carteira
                  ativa.
                </S.SectionText>
              </div>
            </S.SectionHeader>

            {employeeHighlights.length === 0 ? (
              <S.EmptyPanel>
                Ainda não há dados suficientes para destacar funcionários.
              </S.EmptyPanel>
            ) : (
              <S.HighlightGrid>
                {employeeHighlights.map((highlight) => (
                  <S.HighlightCard key={`${highlight.label}-${highlight.title}`}>
                    <S.HighlightTop>
                      {renderEmployeeAvatar({
                        avatarKey: `employee-${highlight.id || highlight.title}`,
                        avatarUrl: highlight.avatarUrl,
                        initials: highlight.initials,
                        name: highlight.title,
                      })}
                      <div>
                        <S.HighlightLabel>{highlight.label}</S.HighlightLabel>
                        <S.HighlightTitle>{highlight.title}</S.HighlightTitle>
                        <S.HighlightHelper>{highlight.helper}</S.HighlightHelper>
                      </div>
                    </S.HighlightTop>
                    <S.HighlightMetric>{highlight.metric}</S.HighlightMetric>
                    <S.HighlightCaption>{highlight.caption}</S.HighlightCaption>
                  </S.HighlightCard>
                ))}
              </S.HighlightGrid>
            )}

            <S.TeamGrid>
              <S.Panel>
                <S.PanelHeader>
                  <div>
                    <S.PanelTitle>Performance da equipe</S.PanelTitle>
                    <S.PanelText>
                      Ranking com volume atribuído, entregas e qualidade percebida.
                    </S.PanelText>
                  </div>
                  {employeeReviewGroups.length > 0 ? (
                    <S.PanelActionButton
                      type="button"
                      onClick={() => setIsReviewsDialogOpen(true)}
                    >
                      Ver avaliações
                    </S.PanelActionButton>
                  ) : null}
                </S.PanelHeader>

                {employeeMetrics.length === 0 ? (
                  <S.EmptyInline>
                    Cadastre funcionários para começar a acompanhar a operação da
                    equipe.
                  </S.EmptyInline>
                ) : (
                  <S.EmployeeList>
                    {employeeMetrics.slice(0, 6).map((employee) => (
                      <S.EmployeeRow key={employee.id}>
                        <S.EmployeeIdentity>
                          {renderEmployeeAvatar({
                            avatarKey: `employee-${employee.id || employee.name}`,
                            avatarUrl: getEmployeeAvatarUrl(employee),
                            initials: getUserInitials(employee.name, "EQ"),
                            name: employee.name,
                          })}
                          <div>
                            <S.EmployeeName>{employee.name}</S.EmployeeName>
                            <S.EmployeeRole>
                              {employee.jobTitle || "Funcionário da operação"}
                            </S.EmployeeRole>
                          </div>
                        </S.EmployeeIdentity>

                        <S.EmployeeMeta>
                          <span>{employee.activeCount} ativos</span>
                          <span>{employee.concludedCount} concluídos</span>
                          <span>{formatRatingLabel(employee.averageRating)} nota</span>
                        </S.EmployeeMeta>

                        <S.ProgressTrack>
                          <S.ProgressFill
                            style={{
                              width: `${clampPercent(employee.completionRate)}%`,
                            }}
                          />
                        </S.ProgressTrack>

                        <S.EmployeeFooter>
                          <span>{formatPercentLabel(employee.completionRate)} de conclusão</span>
                          <span>
                            Última atividade: {formatShortDate(employee.lastActivity)}
                          </span>
                        </S.EmployeeFooter>
                      </S.EmployeeRow>
                    ))}
                  </S.EmployeeList>
                )}
              </S.Panel>

              <S.Panel>
                <S.PanelHeader>
                  <div>
                    <S.PanelTitle>Funcionários com atenção</S.PanelTitle>
                    <S.PanelText>
                      Sinais de baixa efetividade ou acúmulo excessivo de fila.
                    </S.PanelText>
                  </div>
                </S.PanelHeader>

                {attentionEmployees.length === 0 ? (
                  <S.EmptyInline>
                    Nenhum alerta relevante de efetividade na equipe agora.
                  </S.EmptyInline>
                ) : (
                  <S.AttentionList>
                    {attentionEmployees.map((employee) => (
                      <S.AttentionCard key={employee.id}>
                        <S.AttentionTop>
                          <div>
                            <S.EmployeeName>{employee.name}</S.EmployeeName>
                            <S.EmployeeRole>
                              {employee.jobTitle || "Funcionário da operação"}
                            </S.EmployeeRole>
                          </div>
                          <S.AttentionMetric>
                            {employee.pendingCount} pendente(s)
                          </S.AttentionMetric>
                        </S.AttentionTop>

                        <S.ReasonList>
                          {employee.reasons.map((reason) => (
                            <S.ReasonPill key={reason}>{reason}</S.ReasonPill>
                          ))}
                        </S.ReasonList>

                        <S.EmployeeFooter>
                          <span>{employee.activeCount} ativos</span>
                          <span>{employee.concludedCount} concluídos</span>
                          <span>{formatRatingLabel(employee.averageRating)} nota</span>
                        </S.EmployeeFooter>
                      </S.AttentionCard>
                    ))}
                  </S.AttentionList>
                )}
              </S.Panel>
            </S.TeamGrid>

            <S.ContentGrid>
              <S.Panel>
                <S.PanelHeader>
                  <div>
                    <S.PanelTitle>Tickets recentes</S.PanelTitle>
                    <S.PanelText>
                      Últimos tickets criados para acompanhamento rápido.
                    </S.PanelText>
                  </div>
                </S.PanelHeader>

                {recentTickets.length === 0 ? (
                  <S.EmptyInline>
                    Nenhum ticket registrado até o momento.
                  </S.EmptyInline>
                ) : (
                  <S.TableWrapper>
                    <S.Table>
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Assunto</th>
                          <th>Responsável</th>
                          <th>Status</th>
                          <th>Abertura</th>
                          <th>Histórico</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>#{ticket.id}</td>
                            <td>{ticket.complaintTitle?.title || "Sem assunto"}</td>
                            <td>{ticket.assignedEmployee?.name || "Não definido"}</td>
                            <td>
                              <S.StatusBadge $tone={getTicketStatusTone(ticket.status)}>
                                {getTicketStatusLabel(ticket.status)}
                              </S.StatusBadge>
                            </td>
                            <td>{formatShortDate(ticket.createdAt)}</td>
                            <td>
                              <S.TableActionButton
                                type="button"
                                onClick={() => handleOpenTicketHistory(ticket)}
                              >
                                Ver o histórico
                              </S.TableActionButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </S.Table>
                  </S.TableWrapper>
                )}
              </S.Panel>

              <S.SideColumn>
                <S.Panel>
                  <S.PanelHeader>
                    <div>
                      <S.PanelTitle>Assuntos mais frequentes</S.PanelTitle>
                      <S.PanelText>
                        Temas que mais aparecem na abertura de tickets.
                      </S.PanelText>
                    </div>
                  </S.PanelHeader>

                  {subjectSummary.length === 0 ? (
                    <S.EmptyInline>
                      Ainda não há volume suficiente para listar assuntos.
                    </S.EmptyInline>
                  ) : (
                    <S.SubjectList>
                      {subjectSummary.map((subject) => (
                        <S.SubjectRow key={subject.title}>
                          <S.SubjectTop>
                            <S.SubjectName>{subject.title}</S.SubjectName>
                            <S.SubjectCount>{subject.count}</S.SubjectCount>
                          </S.SubjectTop>
                          <S.SubjectTrack>
                            <S.SubjectFill
                              style={{
                                width: `${Math.max(
                                  14,
                                  (subject.count / maxSubjectCount) * 100
                                )}%`,
                              }}
                            />
                          </S.SubjectTrack>
                          <S.SubjectShare>
                            {formatPercentLabel(subject.share)} do total
                          </S.SubjectShare>
                        </S.SubjectRow>
                      ))}
                    </S.SubjectList>
                  )}
                </S.Panel>

                <S.Panel>
                  <S.PanelHeader>
                    <div>
                      <S.PanelTitle>Ações rápidas</S.PanelTitle>
                      <S.PanelText>
                        Atalhos diretos para os próximos passos da operação.
                      </S.PanelText>
                    </div>
                  </S.PanelHeader>

                  <S.QuickActionsGrid>
                    {QUICK_ACTIONS.map((action) => (
                      <S.QuickActionCard key={action.title}>
                        <S.QuickActionLabel>{action.label}</S.QuickActionLabel>
                        <S.QuickActionTitle>{action.title}</S.QuickActionTitle>
                        <S.QuickActionText>{action.description}</S.QuickActionText>
                        <S.QuickActionFooter>
                          <Button variant={action.variant} redirect={action.path}>
                            {action.buttonLabel}
                          </Button>
                        </S.QuickActionFooter>
                      </S.QuickActionCard>
                    ))}
                  </S.QuickActionsGrid>
                </S.Panel>
              </S.SideColumn>
            </S.ContentGrid>
          </>
        ) : null}
      </S.Container>

      {isReviewsDialogOpen ? (
        <S.DialogOverlay onClick={() => setIsReviewsDialogOpen(false)}>
          <S.Dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-reviews-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.DialogHeader>
              <div>
                <S.DialogTitle id="employee-reviews-dialog-title">
                  Avaliações da equipe
                </S.DialogTitle>
                <S.DialogText>
                  Consulte as notas e comentários vinculados aos tickets que foram
                  resolvidos pela equipe.
                </S.DialogText>
              </div>

              <S.DialogHeaderActions>
                <S.PanelActionButton
                  type="button"
                  onClick={() => setIsReviewsDialogOpen(false)}
                >
                  Fechar
                </S.PanelActionButton>
              </S.DialogHeaderActions>
            </S.DialogHeader>

            <S.DialogBody>
              {employeeReviewGroups.length === 0 ? (
                <S.EmptyInline>
                  Ainda não há avaliações vinculadas aos funcionários.
                </S.EmptyInline>
              ) : (
                <S.ReviewGroupList>
                  {employeeReviewGroups.map((employee) => (
                    <S.ReviewGroupCard key={employee.id}>
                      <S.ReviewGroupHeader>
                        <S.EmployeeIdentity>
                          {renderEmployeeAvatar({
                            avatarKey: `employee-${employee.id || employee.name}`,
                            avatarUrl: getEmployeeAvatarUrl(employee),
                            initials: getUserInitials(employee.name, "EQ"),
                            name: employee.name,
                          })}
                          <div>
                            <S.EmployeeName>{employee.name}</S.EmployeeName>
                            <S.EmployeeRole>
                              {employee.jobTitle || "Funcionário da operação"}
                            </S.EmployeeRole>
                          </div>
                        </S.EmployeeIdentity>

                        <S.ReviewSummary>
                          <strong>{formatRatingLabel(employee.averageRating)}</strong>
                          <span>
                            {employee.reviews.length} avaliação(ões)
                          </span>
                        </S.ReviewSummary>
                      </S.ReviewGroupHeader>

                      <S.ReviewCardList>
                        {employee.reviews.slice(0, 4).map((review) => (
                          <S.ReviewCard key={`${employee.id}-${review.ticketId}`}>
                            <S.ReviewCardTop>
                              <S.ReviewProtocol>
                                {review.protocol}
                              </S.ReviewProtocol>
                              <S.ReviewRating>
                                {review.rating}/5
                              </S.ReviewRating>
                            </S.ReviewCardTop>

                            <S.ReviewSubject>{review.subject}</S.ReviewSubject>
                            <S.ReviewComment>
                              {review.comment ||
                                "Avaliação registrada sem comentário detalhado."}
                            </S.ReviewComment>

                            <S.ReviewMeta>
                              <span>{review.customerName}</span>
                              <span>{formatDateTime(review.submittedAt)}</span>
                            </S.ReviewMeta>
                            <S.ReviewMeta>
                              <span>
                                {getResolutionSourceLabel(review.resolutionSource)}
                              </span>
                            </S.ReviewMeta>
                          </S.ReviewCard>
                        ))}
                      </S.ReviewCardList>
                    </S.ReviewGroupCard>
                  ))}
                </S.ReviewGroupList>
              )}
            </S.DialogBody>
          </S.Dialog>
        </S.DialogOverlay>
      ) : null}

      {ticketHistoryDialog.isOpen ? (
        <S.DialogOverlay onClick={closeTicketHistoryDialog}>
          <S.Dialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-history-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.DialogHeader>
              <div>
                <S.DialogTitle id="ticket-history-dialog-title">
                  Histórico do ticket{" "}
                  {buildTicketProtocol(ticketHistoryDialog.ticket?.id)}
                </S.DialogTitle>
                <S.DialogText>
                  Veja a troca de mensagens sem sair do dashboard.
                </S.DialogText>
              </div>

              <S.DialogHeaderActions>
                {ticketHistoryDialog.ticket?.id && canOpenTicketInWorkspace ? (
                  <Button
                    variant="secondary"
                    redirect={`/empresa/chamados?ticketId=${ticketHistoryDialog.ticket.id}`}
                  >
                    Abrir na central
                  </Button>
                ) : null}
                <S.PanelActionButton
                  type="button"
                  onClick={closeTicketHistoryDialog}
                >
                  Fechar
                </S.PanelActionButton>
              </S.DialogHeaderActions>
            </S.DialogHeader>

            <S.DialogBody>
              <S.TicketInfoGrid>
                <S.TicketInfoCard>
                  <strong>Status</strong>
                  <span>
                    {getTicketStatusLabel(
                      ticketHistoryDialog.detail?.status ||
                        ticketHistoryDialog.ticket?.status
                    )}
                  </span>
                </S.TicketInfoCard>
                <S.TicketInfoCard>
                  <strong>Assunto</strong>
                  <span>
                    {ticketHistoryDialog.detail?.complaintTitle?.title ||
                      ticketHistoryDialog.ticket?.complaintTitle?.title ||
                      "Sem assunto"}
                  </span>
                </S.TicketInfoCard>
                <S.TicketInfoCard>
                  <strong>Responsável</strong>
                  <span>
                    {ticketHistoryDialog.detail?.assignedEmployee?.name ||
                      ticketHistoryDialog.ticket?.assignedEmployee?.name ||
                      "Não definido"}
                  </span>
                </S.TicketInfoCard>
                <S.TicketInfoCard>
                  <strong>Cliente</strong>
                  <span>
                    {ticketHistoryDialog.detail?.customer?.name ||
                      ticketHistoryDialog.ticket?.customer?.name ||
                      "Não informado"}
                  </span>
                </S.TicketInfoCard>
              </S.TicketInfoGrid>

              {ticketHistoryDialog.loading ? (
                <S.EmptyInline>Carregando troca de mensagens...</S.EmptyInline>
              ) : null}

              {!ticketHistoryDialog.loading && ticketHistoryDialog.error ? (
                <S.EmptyInline>{ticketHistoryDialog.error}</S.EmptyInline>
              ) : null}

              {!ticketHistoryDialog.loading &&
              !ticketHistoryDialog.error &&
              ticketHistoryDialog.messages.length === 0 ? (
                <S.EmptyInline>
                  Ainda não há mensagens registradas neste ticket.
                </S.EmptyInline>
              ) : null}

              {!ticketHistoryDialog.loading &&
              !ticketHistoryDialog.error &&
              ticketHistoryDialog.messages.length > 0 ? (
                <S.MessageList>
                  {ticketHistoryDialog.messages.map((message) => (
                    <S.MessageCard
                      key={message.id}
                      $system={getMessageTagLabel(message) === "Sistema"}
                    >
                      <S.MessageTop>
                        <S.MessageAuthor>
                          {getMessageSenderLabel(message, {
                            ticketCustomer: ticketHistoryDialog.detail?.customer,
                          })}
                        </S.MessageAuthor>
                        <S.MessageBadge>
                          {getMessageTagLabel(message)}
                        </S.MessageBadge>
                      </S.MessageTop>
                      <S.MessageContent>
                        {message.content || "Mensagem sem conteúdo."}
                      </S.MessageContent>
                      <S.MessageTime>
                        {formatDateTime(message.createdAt)}
                      </S.MessageTime>
                    </S.MessageCard>
                  ))}
                </S.MessageList>
              ) : null}
            </S.DialogBody>
          </S.Dialog>
        </S.DialogOverlay>
      ) : null}
    </S.Page>
  );
};

export default CompanyDashboard;
