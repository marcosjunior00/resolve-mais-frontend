import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, RotateCcw, Sparkles } from "lucide-react";

import * as S from "./styles";

import LoggedHeader from "../LoggedHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useSnack } from "../../contexts/SnackContext";
import { chatbotService } from "../../services/chatbotService";
import { companyAdminService } from "../../services/companyAdminService";
import { ticketService } from "../../services/ticketService";
import {
  buildTicketProtocol,
  formatCompactDateTime,
  formatDateTime,
  getConversationModeLabel,
  getMessageUiMeta,
  getTicketStatusLabel,
  getTicketStatusTone,
  getUserInitials,
  TICKET_SENDER_TYPE,
  TICKET_STATUS,
} from "../../utils/ticket";

const createLocalMessage = ({
  role,
  content,
  senderType,
  senderName,
  senderUser = null,
  senderUserId = null,
}) => ({
  id: `local-${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  senderType,
  senderName,
  senderUser,
  senderUserId,
  createdAt: new Date().toISOString(),
});

const upsertById = (items, nextItem) => {
  const hasItem = items.some((item) => String(item.id) === String(nextItem.id));

  if (!hasItem) {
    return [...items, nextItem];
  }

  return items.map((item) =>
    String(item.id) === String(nextItem.id) ? { ...item, ...nextItem } : item
  );
};

const getDefaultHeroText = (mode) => {
  if (mode === "company") {
    return "Visualize os chamados da empresa, alterne entre tickets ativos e finalizados, acompanhe o histórico e troque o responsável sempre que precisar.";
  }

  if (mode === "employee") {
    return "Aceite tickets, converse em tempo real com o cliente e marque o atendimento como resolvido quando a situação estiver encaminhada.";
  }

  return "Acompanhe seus tickets, converse com o chatbot no primeiro contato e siga para o atendimento humano quando a empresa assumir o chamado.";
};

const EVALUATION_RATING_OPTIONS = [1, 2, 3, 4, 5];
const TICKET_WORKSPACE_SCOPE = Object.freeze({
  ACTIVE: "active",
  CLOSED: "closed",
});
const TICKET_SCOPE_OPTIONS = [
  { value: TICKET_WORKSPACE_SCOPE.ACTIVE, label: "Ativos" },
  { value: TICKET_WORKSPACE_SCOPE.CLOSED, label: "Finalizados" },
];
const TICKET_SEARCH_FIELD_OPTIONS = [
  { value: "all", label: "Todos os campos" },
  { value: "protocol", label: "Protocolo" },
  { value: "company", label: "Empresa" },
  { value: "customer", label: "Cliente" },
  { value: "subject", label: "Assunto" },
  { value: "responsible", label: "Responsável" },
  { value: "description", label: "Descrição" },
];
const BASE_TICKET_DATE_FIELD_OPTIONS = [
  { value: "updatedAt", label: "Última atualização" },
  { value: "createdAt", label: "Data de abertura" },
  { value: "acceptedAt", label: "Data de aceite" },
  { value: "resolvedAt", label: "Data de resolução" },
];
const createDefaultTicketFilters = (scope = TICKET_WORKSPACE_SCOPE.ACTIVE) => ({
  searchField: "all",
  status: "all",
  responsible: "all",
  dateField:
    scope === TICKET_WORKSPACE_SCOPE.CLOSED ? "closedAt" : "updatedAt",
  sortDirection: "desc",
  dateFrom: "",
  dateTo: "",
});
const DEFAULT_TICKET_PAGE = 1;
const DEFAULT_TICKET_PAGE_SIZE = 5;
const TICKET_PAGE_SIZE_OPTIONS = [5, 10, 20];

const normalizeFilterText = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getDateKey = (value) => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getRedirectEmployeeLabel = (employee) =>
  employee?.name ? String(employee.name).trim() : "";

const getTicketDateValue = (ticket, field) => {
  const value = ticket?.[field] || ticket?.updatedAt || ticket?.createdAt || "";
  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
};

const getPersonAvatarUrl = (person) => {
  const avatarUrl = person?.avatarUrl || person?.avatar_url || "";

  if (typeof avatarUrl !== "string") return "";

  return avatarUrl.trim();
};

const formatAverageRatingLabel = (averageRating) =>
  typeof averageRating === "number" && Number.isFinite(averageRating)
    ? `${averageRating.toFixed(1).replace(".", ",")}/5`
    : "—";

const getEmployeeRatingCaption = (ratingCount) => {
  const normalizedCount = Number(ratingCount || 0);

  if (normalizedCount <= 0) return "Ainda sem avaliações";

  return `Sua nota atual · ${normalizedCount} avaliação(ões)`;
};

const DEFAULT_EMPLOYEE_AI_STATE = {
  loading: false,
  error: "",
  data: null,
  requested: false,
};

const getAiInsightToneLabel = (tone) => {
  if (tone === "success") return "Força";
  if (tone === "warning") return "Atenção";
  if (tone === "danger") return "Risco";
  return "Leitura";
};

const getTicketSearchValues = (ticket, field) => {
  const valuesByField = {
    protocol: [ticket?.protocol, ticket?.id ? buildTicketProtocol(ticket.id) : ""],
    company: [ticket?.company?.name, ticket?.company?.cnpj],
    customer: [ticket?.customer?.name, ticket?.customer?.email, ticket?.customer?.cpf],
    subject: [ticket?.complaintTitle?.title, ticket?.complaintTitle?.description],
    responsible: [ticket?.assignedEmployee?.name, ticket?.assignedEmployee?.email],
    description: [ticket?.description],
  };

  if (field !== "all") return valuesByField[field] || [];

  return Object.values(valuesByField).flat();
};

const isTicketInsideDateRange = ({ ticket, dateField, dateFrom, dateTo }) => {
  if (!dateFrom && !dateTo) return true;

  const ticketDateKey = getDateKey(ticket?.[dateField]);
  if (!ticketDateKey) return false;

  if (dateFrom && ticketDateKey < dateFrom) return false;
  if (dateTo && ticketDateKey > dateTo) return false;

  return true;
};

const getEvaluationCopy = (ticket) => {
  if (ticket?.evaluation?.resolutionSource === "chatbot") {
    return {
      title: "Como foi a ajuda do chatbot?",
      description: "Seu problema foi resolvido pelo Resolve Assist. Avalie essa experiência para melhorar os próximos atendimentos.",
      successMessage: "Ticket marcado como resolvido e avaliação registrada com sucesso.",
      submitLabel: "Enviar avaliação",
    };
  }

  return {
    title: "Como foi o atendimento recebido?",
    description: "O ticket foi marcado como resolvido. Avalie o atendimento para registrar como a empresa conduziu essa solução.",
    successMessage: "Avaliação registrada com sucesso.",
    submitLabel: "Registrar avaliação",
  };
};

const getStatusFlowHelper = (ticket) => {
  if (!ticket) return null;

  const normalizedStatus = String(ticket.status || "").toLowerCase();

  if (normalizedStatus === TICKET_STATUS.ABERTO) {
    return {
      title: "Fluxo com chatbot",
      items: [
        "O cliente conversa primeiro com o Resolve Assist neste chat.",
        "O chatbot responde apenas com as informações do ticket e do contexto cadastrado.",
        "O atendimento humano começa quando a empresa aceita o chamado ou define um responsável.",
      ],
    };
  }

  if (normalizedStatus === TICKET_STATUS.PENDENTE) {
    const responsibleText = ticket.assignedEmployee?.name
      ? `Responsável atual: ${ticket.assignedEmployee.name}.`
      : "O chamado está em atendimento humano, mas ainda não tem responsável definido.";

    return {
      title: "Fluxo com atendimento humano",
      items: [
        responsibleText,
        "A conversa com o cliente continua centralizada neste mesmo chat.",
        "A equipe pode responder, revisar o histórico e marcar como resolvido quando o caso estiver encaminhado.",
      ],
    };
  }

  if (normalizedStatus === TICKET_STATUS.RESOLVIDO) {
    const evaluationText = ticket.evaluation?.pending
      ? "O cliente ainda precisa avaliar o atendimento antes do encerramento definitivo."
      : "A solução foi registrada e o chamado aguarda confirmação ou fechamento definitivo.";

    return {
      title: "Fluxo de resolução",
      items: [
        "O atendimento foi marcado como resolvido.",
        evaluationText,
        "Se o problema continuar, o cliente pode reabrir o chamado quando essa ação estiver disponível.",
      ],
    };
  }

  return null;
};

const getTicketStatusOptions = ({ isCompanyMode, ticketScope }) => {
  if (isCompanyMode && ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return [
      { value: "all", label: "Todos" },
      { value: TICKET_STATUS.FECHADO, label: "Fechado" },
    ];
  }

  return [
    { value: "all", label: "Todos" },
    { value: TICKET_STATUS.ABERTO, label: "Aberto" },
    { value: TICKET_STATUS.PENDENTE, label: "Em atendimento" },
    { value: TICKET_STATUS.RESOLVIDO, label: "Resolvido" },
  ];
};

const getTicketDateFieldOptions = (ticketScope) => {
  if (ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return [
      { value: "closedAt", label: "Data de fechamento" },
      ...BASE_TICKET_DATE_FIELD_OPTIONS,
    ];
  }

  return BASE_TICKET_DATE_FIELD_OPTIONS;
};

const getTicketSectionTitle = ({ isCompanyMode, ticketScope }) => {
  if (isCompanyMode && ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return "Tickets finalizados";
  }

  return "Tickets ativos";
};

const getTicketSectionText = ({ isCustomerMode, isCompanyMode, ticketScope }) => {
  if (isCompanyMode && ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return "Consulte chamados já encerrados, releia a conversa e audite o histórico completo sem depender da equipe operacional.";
  }

  if (isCustomerMode) {
    return "Escolha um ticket para acompanhar a conversa e o andamento.";
  }

  return "Selecione um ticket para abrir o chat, consultar o histórico quando precisar e agir no atendimento.";
};

const getTicketSearchPlaceholder = ({ isCompanyMode, ticketScope }) => {
  if (isCompanyMode && ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return "Buscar tickets finalizados";
  }

  return "Buscar tickets";
};

const getTicketEmptyStateMessage = ({ isCompanyMode, ticketScope }) => {
  if (isCompanyMode && ticketScope === TICKET_WORKSPACE_SCOPE.CLOSED) {
    return "Nenhum ticket finalizado encontrado.";
  }

  return "Nenhum ticket disponível no momento.";
};

const TicketWorkspace = ({ mode = "customer", title }) => {
  const { userData } = useAuth();
  const { showSnack } = useSnack();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesContainerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const botStreamAbortControllerRef = useRef(null);
  const pendingBotMessageRef = useRef(null);
  const promptedEvaluationKeysRef = useRef(new Set());
  const suppressExpectedStreamLossRef = useRef(false);
  const ticketContextRequestIdRef = useRef(0);

  const [workspace, setWorkspace] = useState({
    tickets: [],
    summary: {},
    company: null,
  });
  const [selectedTicketId, setSelectedTicketId] = useState(
    searchParams.get("ticketId") || ""
  );
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ticketScope, setTicketScope] = useState(TICKET_WORKSPACE_SCOPE.ACTIVE);
  const [ticketSearch, setTicketSearch] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [ticketFilters, setTicketFilters] = useState(() =>
    createDefaultTicketFilters()
  );
  const [ticketPage, setTicketPage] = useState(DEFAULT_TICKET_PAGE);
  const [ticketPageSize, setTicketPageSize] = useState(DEFAULT_TICKET_PAGE_SIZE);
  const [composerText, setComposerText] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isRedirectDialogOpen, setIsRedirectDialogOpen] = useState(false);
  const [redirectSearch, setRedirectSearch] = useState("");
  const [redirectEmployeeId, setRedirectEmployeeId] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isTicketDetailsDialogOpen, setIsTicketDetailsDialogOpen] = useState(false);
  const [isReopenConfirmationOpen, setIsReopenConfirmationOpen] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [botStreaming, setBotStreaming] = useState(false);
  const [messageAvatarErrors, setMessageAvatarErrors] = useState({});
  const [ticketAvatarErrors, setTicketAvatarErrors] = useState({});
  const [evaluationDialog, setEvaluationDialog] = useState({ isOpen: false, mode: null });
  const [evaluationRating, setEvaluationRating] = useState(0);
  const [evaluationComment, setEvaluationComment] = useState("");
  const [employeeAiPanelOpen, setEmployeeAiPanelOpen] = useState(false);
  const [employeeAiState, setEmployeeAiState] = useState(DEFAULT_EMPLOYEE_AI_STATE);

  const isCompanyMode = mode === "company";
  const isEmployeeMode = mode === "employee";
  const isCustomerMode = mode === "customer";
  const workspaceScope = isCompanyMode
    ? ticketScope
    : TICKET_WORKSPACE_SCOPE.ACTIVE;
  const ticketStatusOptions = useMemo(
    () => getTicketStatusOptions({ isCompanyMode, ticketScope: workspaceScope }),
    [isCompanyMode, workspaceScope]
  );
  const ticketDateFieldOptions = useMemo(
    () => getTicketDateFieldOptions(workspaceScope),
    [workspaceScope]
  );
  const ticketSectionTitle = getTicketSectionTitle({
    isCompanyMode,
    ticketScope: workspaceScope,
  });
  const ticketSectionText = getTicketSectionText({
    isCustomerMode,
    isCompanyMode,
    ticketScope: workspaceScope,
  });
  const ticketSearchPlaceholder = getTicketSearchPlaceholder({
    isCompanyMode,
    ticketScope: workspaceScope,
  });
  const ticketEmptyStateMessage = getTicketEmptyStateMessage({
    isCompanyMode,
    ticketScope: workspaceScope,
  });

  const filteredTickets = useMemo(() => {
    const term = normalizeFilterText(ticketSearch);

    return [...workspace.tickets]
      .filter((ticket) => {
        if (
          ticketFilters.status !== "all" &&
          String(ticket.status || "").toLowerCase() !== ticketFilters.status
        ) {
          return false;
        }

        if (ticketFilters.responsible === "assigned" && !ticket.assignedEmployee?.id) {
          return false;
        }

        if (ticketFilters.responsible === "unassigned" && ticket.assignedEmployee?.id) {
          return false;
        }

        if (
          !isTicketInsideDateRange({
            ticket,
            dateField: ticketFilters.dateField,
            dateFrom: ticketFilters.dateFrom,
            dateTo: ticketFilters.dateTo,
          })
        ) {
          return false;
        }

        if (!term) return true;

        return getTicketSearchValues(ticket, ticketFilters.searchField).some(
          (value) => normalizeFilterText(value).includes(term)
        );
      })
      .sort((left, right) => {
        const leftTime = getTicketDateValue(left, ticketFilters.dateField);
        const rightTime = getTicketDateValue(right, ticketFilters.dateField);

        if (leftTime === rightTime) {
          return Number(right.id || 0) - Number(left.id || 0);
        }

        return ticketFilters.sortDirection === "asc"
          ? leftTime - rightTime
          : rightTime - leftTime;
      });
  }, [ticketFilters, ticketSearch, workspace.tickets]);

  const ticketPagination = useMemo(() => {
    const total = filteredTickets.length;
    const totalPages = Math.max(1, Math.ceil(total / ticketPageSize));
    const page = Math.min(ticketPage, totalPages);
    const startIndex = (page - 1) * ticketPageSize;
    const endIndex = startIndex + ticketPageSize;

    return {
      page,
      pageSize: ticketPageSize,
      total,
      totalPages,
      startIndex,
      endIndex,
    };
  }, [filteredTickets.length, ticketPage, ticketPageSize]);

  const paginatedTickets = useMemo(
    () =>
      filteredTickets.slice(
        ticketPagination.startIndex,
        ticketPagination.endIndex
      ),
    [filteredTickets, ticketPagination.endIndex, ticketPagination.startIndex]
  );

  const employeeAiInsights = employeeAiState.data;
  const employeeAiGeneratedAt = employeeAiInsights?.generatedAt
    ? formatCompactDateTime(employeeAiInsights.generatedAt)
    : "";

  const composerDisabled = useMemo(() => {
    if (!selectedTicket) return true;
    if (isCompanyMode) return true;
    if (actionLoading || detailLoading || botStreaming) return true;

    const canUseChatbot = selectedTicket.permissions?.canUseChatbot;
    const canSendHuman = selectedTicket.permissions?.canSendHumanMessage;

    return !(canUseChatbot || canSendHuman);
  }, [actionLoading, botStreaming, detailLoading, isCompanyMode, selectedTicket]);

  const canManageAssignee = Boolean(
    selectedTicket &&
      ((isCompanyMode && selectedTicket.permissions?.canAssign) ||
        (isEmployeeMode && selectedTicket.permissions?.canRedirect))
  );
  const currentAssigneeId = String(selectedTicket?.assignedEmployee?.id || "");
  const normalizedSelectedAssigneeId = String(selectedAssigneeId || "");
  const assigneeActionDisabled =
    actionLoading ||
    !canManageAssignee ||
    !employees.length ||
    normalizedSelectedAssigneeId === currentAssigneeId ||
    (isEmployeeMode && !normalizedSelectedAssigneeId);
  const redirectCandidates = useMemo(
    () =>
      employees.filter(
        (employee) => Number(employee?.id || 0) !== Number(userData?.id || 0)
      ),
    [employees, userData?.id]
  );
  const filteredRedirectCandidates = useMemo(() => {
    const term = normalizeFilterText(redirectSearch);

    return redirectCandidates.filter((employee) => {
      if (!term) return true;

      return [employee?.name, employee?.email, employee?.jobTitle].some((value) =>
        normalizeFilterText(value).includes(term)
      );
    });
  }, [redirectCandidates, redirectSearch]);
  const selectedRedirectEmployee =
    redirectCandidates.find(
      (employee) => String(employee.id) === String(redirectEmployeeId)
    ) || null;
  const redirectConfirmDisabled =
    actionLoading ||
    !isEmployeeMode ||
    !selectedTicket?.permissions?.canRedirect ||
    !selectedRedirectEmployee;

  const isBotStreamAbortError = (error) =>
    error?.name === "AbortError" ||
    error?.code === 20 ||
    /abort/i.test(String(error?.message || ""));

  const cancelPendingBotResponse = () => {
    const pendingAssistantMessageId = pendingBotMessageRef.current?.assistantMessageId;

    if (botStreamAbortControllerRef.current) {
      botStreamAbortControllerRef.current.abort();
      botStreamAbortControllerRef.current = null;
    }

    pendingBotMessageRef.current = null;
    setBotStreaming(false);

    if (!pendingAssistantMessageId) return;

    setMessages((previous) =>
      previous.filter((message) => message.id !== pendingAssistantMessageId)
    );
  };

  const loadWorkspace = async ({
    silent = false,
    showError = true,
  } = {}) => {
    try {
      if (!silent) {
        setWorkspaceLoading(true);
      }

      const [workspaceResponse, employeesResponse] = await Promise.all([
        ticketService.getWorkspace({ scope: workspaceScope }),
        !isCustomerMode ? companyAdminService.listEmployees() : Promise.resolve(null),
      ]);

      setWorkspace({
        tickets: workspaceResponse.tickets || [],
        summary: workspaceResponse.summary || {},
        company: workspaceResponse.company || null,
      });

      if (employeesResponse?.employees) {
        setEmployees(employeesResponse.employees || []);
      }

      const visibleTicketIds = new Set(
        (workspaceResponse.tickets || []).map((ticket) => String(ticket.id))
      );
      const requestedTicketId = searchParams.get("ticketId") || "";
      const currentSelectedTicketId = String(selectedTicketId || "");

      const preferredTicketId = visibleTicketIds.has(String(requestedTicketId))
        ? requestedTicketId
        : visibleTicketIds.has(currentSelectedTicketId)
        ? currentSelectedTicketId
        : workspaceResponse.tickets?.[0]?.id || "";

      setSelectedTicketId(String(preferredTicketId || ""));
    } catch (error) {
      if (showError) {
        showSnack({
          variant: "error",
          message:
            error?.response?.data?.message || "Não foi possível carregar os tickets.",
        });
      }
    } finally {
      if (!silent) {
        setWorkspaceLoading(false);
      }
    }
  };

  const loadEmployeeAiInsights = async ({ force = false } = {}) => {
    if (!isEmployeeMode) return null;
    if (!force && employeeAiState.loading) return null;

    try {
      setEmployeeAiState((previous) => ({
        ...previous,
        loading: true,
        error: "",
        requested: true,
      }));

      const response = await companyAdminService.getEmployeeAiInsights();

      if (response?.status >= 400) {
        throw new Error(
          response.message || "Não foi possível gerar a leitura da IA agora."
        );
      }

      setEmployeeAiState({
        loading: false,
        error: "",
        data: response,
        requested: true,
      });

      return response;
    } catch (error) {
      const nextMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível gerar a leitura da IA agora.";

      setEmployeeAiState((previous) => ({
        ...previous,
        loading: false,
        error: nextMessage,
        requested: true,
      }));

      return null;
    }
  };

  const loadTicketContext = async (
    ticketId,
    {
      silent = false,
      showError = true,
    } = {}
  ) => {
    if (!ticketId) {
      if (!silent) {
        setSelectedTicket(null);
        setConversation(null);
        setMessages([]);
        setLogs([]);
        setSelectedAssigneeId("");
      }
      return;
    }

    const requestId = ticketContextRequestIdRef.current + 1;
    ticketContextRequestIdRef.current = requestId;
    const shouldLoadLogs = !isCustomerMode && (!silent || isHistoryDialogOpen);

    try {
      if (!silent) {
        setDetailLoading(true);
      }

      const [detailResponse, messagesResponse, logsResponse] = await Promise.all([
        silent ? Promise.resolve(null) : ticketService.getTicketDetail(ticketId),
        ticketService.getTicketMessages(ticketId),
        shouldLoadLogs
          ? ticketService.getTicketLogs(ticketId)
          : Promise.resolve(null),
      ]);

      if (requestId !== ticketContextRequestIdRef.current) return;

      const detailTicket =
        detailResponse?.ticket || messagesResponse.ticket || null;

      setSelectedTicket(detailTicket);
      setConversation(messagesResponse.conversation || null);
      setMessages(messagesResponse.messages || []);
      setSelectedAssigneeId(detailTicket?.assignedEmployee?.id || "");

      if (shouldLoadLogs) {
        setLogs(logsResponse?.logs || []);
      }

      setWorkspace((previous) => ({
        ...previous,
        tickets: previous.tickets.map((ticket) =>
          String(ticket.id) === String(detailTicket?.id) ? detailTicket : ticket
        ),
      }));
    } catch (error) {
      if (!silent) {
        setSelectedTicket(null);
        setConversation(null);
        setMessages([]);
        setLogs([]);
        setSelectedAssigneeId("");
      }
      if (showError) {
        showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Não foi possível carregar o ticket.",
      });
      }
    } finally {
      if (!silent && requestId === ticketContextRequestIdRef.current) {
        setDetailLoading(false);
      }
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceScope]);

  useEffect(() => {
    if (isEmployeeMode) return;

    setEmployeeAiPanelOpen(false);
    setEmployeeAiState(DEFAULT_EMPLOYEE_AI_STATE);
  }, [isEmployeeMode]);

  useEffect(() => {
    const refreshWorkspaceSilently = () => {
      if (document.visibilityState === "hidden") return;

      loadWorkspace({ silent: true, showError: false });
    };

    const intervalId = window.setInterval(refreshWorkspaceSilently, 8000);
    const handleFocus = () => refreshWorkspaceSilently();
    const handleVisibilityChange = () => refreshWorkspaceSilently();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompanyMode, searchParams, selectedTicketId, workspaceScope]);

  useEffect(() => {
    if (workspaceLoading) return;

    shouldStickToBottomRef.current = true;
    if (!selectedTicketId) {
      loadTicketContext("");
      return;
    }

    loadTicketContext(selectedTicketId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicketId, workspaceLoading]);

  useEffect(() => {
    if (!selectedTicketId) return undefined;

    const refreshTicketContextSilently = () => {
      if (document.visibilityState === "hidden") return;
      if (botStreaming || actionLoading || detailLoading) return;

      loadTicketContext(selectedTicketId, {
        silent: true,
        showError: false,
      });
    };

    const intervalId = window.setInterval(refreshTicketContextSilently, 8000);
    const handleFocus = () => refreshTicketContextSilently();
    const handleVisibilityChange = () => refreshTicketContextSilently();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    actionLoading,
    botStreaming,
    detailLoading,
    isHistoryDialogOpen,
    selectedTicketId,
  ]);

  useEffect(
    () => () => {
      botStreamAbortControllerRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    const currentTicketId = searchParams.get("ticketId") || "";

    if (String(currentTicketId) === String(selectedTicketId || "")) return;

    const nextParams = new URLSearchParams(searchParams);

    if (selectedTicketId) {
      nextParams.set("ticketId", selectedTicketId);
    } else {
      nextParams.delete("ticketId");
    }

    setSearchParams(nextParams);
  }, [searchParams, selectedTicketId, setSearchParams]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (!messagesContainer || !shouldStickToBottomRef.current) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [messages, selectedTicketId, botStreaming]);

  useEffect(() => {
    setIsRedirectDialogOpen(false);
    setRedirectSearch("");
    setRedirectEmployeeId("");
    setIsHistoryDialogOpen(false);
    setIsTicketDetailsDialogOpen(false);
    setIsReopenConfirmationOpen(false);
    setEvaluationDialog({
      isOpen: false,
      mode: null,
    });
    setEvaluationRating(0);
    setEvaluationComment("");
  }, [selectedTicketId]);

  useEffect(() => {
    setMessageAvatarErrors({});
  }, [selectedTicketId]);

  useEffect(() => {
    setTicketPage(DEFAULT_TICKET_PAGE);
  }, [ticketFilters, ticketSearch]);

  useEffect(() => {
    if (ticketPage <= ticketPagination.totalPages) return;

    setTicketPage(ticketPagination.totalPages);
  }, [ticketPage, ticketPagination.totalPages]);

  useEffect(() => {
    if (!isCustomerMode || !selectedTicket?.evaluation?.pending) return;
    if (evaluationDialog.isOpen) return;

    const promptKey = `${selectedTicket.id}-${selectedTicket.resolvedAt || selectedTicket.updatedAt || ""}`;

    if (promptedEvaluationKeysRef.current.has(promptKey)) {
      return;
    }

    promptedEvaluationKeysRef.current.add(promptKey);
    setEvaluationRating(0);
    setEvaluationComment("");
    setEvaluationDialog({
      isOpen: true,
      mode: "resolved-ticket",
    });
  }, [
    evaluationDialog.isOpen,
    isCustomerMode,
    selectedTicket?.evaluation?.pending,
    selectedTicket?.id,
    selectedTicket?.resolvedAt,
    selectedTicket?.updatedAt,
  ]);

  useEffect(() => {
    const hasOpenDialog =
      isRedirectDialogOpen ||
      isHistoryDialogOpen ||
      isTicketDetailsDialogOpen ||
      isReopenConfirmationOpen ||
      evaluationDialog.isOpen;

    if (!hasOpenDialog) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;

      if (isRedirectDialogOpen && !actionLoading) {
        setIsRedirectDialogOpen(false);
        setRedirectSearch("");
        setRedirectEmployeeId("");
      } else if (isTicketDetailsDialogOpen) {
        setIsTicketDetailsDialogOpen(false);
      } else if (isReopenConfirmationOpen && !actionLoading) {
        setIsReopenConfirmationOpen(false);
      } else if (isHistoryDialogOpen) {
        setIsHistoryDialogOpen(false);
      } else if (evaluationDialog.isOpen && !actionLoading) {
        setEvaluationDialog({
          isOpen: false,
          mode: null,
        });
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [
    actionLoading,
    evaluationDialog.isOpen,
    isRedirectDialogOpen,
    isHistoryDialogOpen,
    isReopenConfirmationOpen,
    isTicketDetailsDialogOpen,
  ]);

  useEffect(() => {
    if (!selectedTicketId) return undefined;

    const controller = new AbortController();

    ticketService
      .streamTicketEvents({
        ticketId: selectedTicketId,
        signal: controller.signal,
        onTicketSnapshot: ({ ticket }) => {
          if (ticket) {
            setSelectedTicket(ticket);
          }
        },
        onTicketUpdated: ({ ticket }) => {
          if (!ticket) return;

          setSelectedTicket(ticket);
          setWorkspace((previous) => ({
            ...previous,
            tickets: previous.tickets.map((item) =>
              String(item.id) === String(ticket.id) ? ticket : item
            ),
          }));
        },
        onStatusChanged: ({ ticket }) => {
          if (!ticket) return;

          setSelectedTicket(ticket);
          setWorkspace((previous) => ({
            ...previous,
            tickets: previous.tickets.map((item) =>
              String(item.id) === String(ticket.id) ? ticket : item
            ),
          }));
        },
        onMessageCreated: ({ message }) => {
          if (!message) return;

          if (
            botStreaming &&
            [TICKET_SENDER_TYPE.CLIENTE, TICKET_SENDER_TYPE.BOT].includes(
              message.senderType
            )
          ) {
            return;
          }

          setMessages((previous) => upsertById(previous, message));

          const shouldMarkAsRead = isCustomerMode
            ? message.senderType !== TICKET_SENDER_TYPE.CLIENTE
            : message.senderType === TICKET_SENDER_TYPE.CLIENTE;

          if (shouldMarkAsRead) {
            ticketService.markMessagesAsRead(selectedTicketId).catch(() => {});
          }
        },
        onLogCreated: ({ log }) => {
          if (!log) return;

          setLogs((previous) => upsertById(previous, log));
        },
        onError: () => {
          loadWorkspace({ silent: true, showError: false });
          loadTicketContext(selectedTicketId, { silent: true, showError: false });
        },
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        if (
          suppressExpectedStreamLossRef.current &&
          /nao esta mais disponivel para o seu perfil/i.test(
            String(error?.message || "")
          )
        ) {
          suppressExpectedStreamLossRef.current = false;
          return;
        }

        loadWorkspace({ silent: true, showError: false });
        loadTicketContext(selectedTicketId, { silent: true, showError: false });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botStreaming, isCustomerMode, selectedTicketId]);

  const handleTicketSelection = (ticketId) => {
    if (String(ticketId) !== String(selectedTicketId || "")) {
      cancelPendingBotResponse();
    }

    setSelectedTicketId(String(ticketId));
  };

  const updateTicketFilter = (field, value) => {
    setTicketFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const clearTicketFilters = () => {
    setTicketSearch("");
    setTicketFilters(createDefaultTicketFilters(workspaceScope));
  };

  const handleTicketScopeChange = (nextScope) => {
    if (!isCompanyMode || nextScope === workspaceScope) return;

    cancelPendingBotResponse();
    setIsFilterPanelOpen(false);
    setTicketSearch("");
    setTicketFilters(createDefaultTicketFilters(nextScope));
    setTicketPage(DEFAULT_TICKET_PAGE);
    setTicketScope(nextScope);
  };

  const handleToggleEmployeeAiPanel = async () => {
    if (!isEmployeeMode) return;

    setEmployeeAiPanelOpen(true);

    if (!employeeAiState.requested || employeeAiState.error) {
      await loadEmployeeAiInsights({
        force: !employeeAiState.requested || Boolean(employeeAiState.error),
      });
    }
  };

  const handleRefreshEmployeeAiInsights = async () => {
    setEmployeeAiPanelOpen(true);
    await loadEmployeeAiInsights({ force: true });
  };

  const closeEmployeeAiPanel = () => {
    if (employeeAiState.loading) return;
    setEmployeeAiPanelOpen(false);
  };

  const handleMessagesScroll = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom <= 48;
  };

  const handleMessageAvatarError = (messageId) => {
    setMessageAvatarErrors((previous) =>
      previous[messageId]
        ? previous
        : {
            ...previous,
            [messageId]: true,
          }
    );
  };

  const handleTicketAvatarError = (avatarKey) => {
    setTicketAvatarErrors((previous) =>
      previous[avatarKey]
        ? previous
        : {
            ...previous,
            [avatarKey]: true,
          }
    );
  };

  const closeEvaluationDialog = () => {
    if (actionLoading) return;

    setEvaluationDialog({
      isOpen: false,
      mode: null,
    });
  };

  const openEvaluationDialog = (mode) => {
    setEvaluationRating(selectedTicket?.evaluation?.rating || 0);
    setEvaluationComment(selectedTicket?.evaluation?.comment || "");
    setEvaluationDialog({
      isOpen: true,
      mode,
    });
  };

  const handleOpenPendingEvaluation = () => {
    openEvaluationDialog("resolved-ticket");
  };

  const handleStartChatbotEvaluation = () => {
    openEvaluationDialog("chatbot-resolution");
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedTicket?.id) return;

    if (!Number.isInteger(evaluationRating) || evaluationRating < 1 || evaluationRating > 5) {
      showSnack({
        variant: "error",
        message: "Selecione uma nota de 1 a 5 para continuar.",
      });
      return;
    }

    const evaluationCopy = getEvaluationCopy(selectedTicket);
    let resolvedByChatbot = false;

    try {
      setActionLoading(true);

      if (evaluationDialog.mode === "chatbot-resolution") {
        const resolveResponse = await ticketService.updateStatus(
          selectedTicket.id,
          "resolvido"
        );

        if (resolveResponse?.status >= 400) {
          throw new Error(
            resolveResponse.message || "Não foi possível marcar o ticket como resolvido."
          );
        }

        resolvedByChatbot = true;
      }

      const response = await ticketService.submitEvaluation(selectedTicket.id, {
        rating: evaluationRating,
        comment: evaluationComment,
      });

      if (response?.status >= 400) {
        throw new Error(
          response.message || "Não foi possível registrar a avaliação."
        );
      }

      closeEvaluationDialog();
      setEvaluationRating(0);
      setEvaluationComment("");
      await applyActionResult(response, evaluationCopy.successMessage);
    } catch (error) {
      if (resolvedByChatbot) {
        await refreshSelectedTicket();
        await loadWorkspace({ silent: true, showError: false });
      }

      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível registrar a avaliação.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openHistoryDialog = () => {
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
  };

  const openTicketDetailsDialog = () => {
    setIsTicketDetailsDialogOpen(true);
  };

  const closeTicketDetailsDialog = () => {
    setIsTicketDetailsDialogOpen(false);
  };

  const openRedirectDialog = () => {
    setRedirectSearch("");
    setRedirectEmployeeId("");
    setIsRedirectDialogOpen(true);
  };

  const closeRedirectDialog = () => {
    if (actionLoading) return;

    setIsRedirectDialogOpen(false);
    setRedirectSearch("");
    setRedirectEmployeeId("");
  };

  const handleRedirectSearchChange = (event) => {
    setRedirectSearch(event.target.value);
    setRedirectEmployeeId("");
  };

  const handleSelectRedirectEmployee = (employee) => {
    setRedirectEmployeeId(String(employee.id));
    setRedirectSearch(getRedirectEmployeeLabel(employee));
  };

  const openReopenConfirmation = () => {
    setIsReopenConfirmationOpen(true);
  };

  const closeReopenConfirmation = () => {
    if (actionLoading) return;

    setIsReopenConfirmationOpen(false);
  };

  const refreshSelectedTicket = async ({
    silent = false,
    showError = true,
  } = {}) => {
    if (!selectedTicketId) return;
    await loadTicketContext(selectedTicketId, { silent, showError });
  };

  const applyActionResult = async (response, successMessage) => {
    if (response?.ticketStillVisibleToRequester === false) {
      suppressExpectedStreamLossRef.current = true;

      try {
        setSelectedTicket(null);
        setConversation(null);
        setMessages([]);
        setLogs([]);
        setSelectedAssigneeId("");
        setSelectedTicketId("");
        await loadWorkspace({ silent: true });
      } finally {
        suppressExpectedStreamLossRef.current = false;
      }

      showSnack({
        variant: "success",
        message: successMessage,
      });
      return;
    }

    if (response?.ticket) {
      setSelectedTicket(response.ticket);
      setWorkspace((previous) => ({
        ...previous,
        tickets: previous.tickets.map((ticket) =>
          String(ticket.id) === String(response.ticket.id) ? response.ticket : ticket
        ),
      }));
    }

    await refreshSelectedTicket();
    await loadWorkspace({ silent: true });

    showSnack({
      variant: "success",
      message: successMessage,
    });
  };

  const runTicketAction = async (executor, successMessage) => {
    try {
      setActionLoading(true);
      const response = await executor();

      if (response?.status >= 400) {
        throw new Error(response.message || "Não foi possível concluir a ação.");
      }

      await applyActionResult(response, successMessage);
      return { success: true, response };
    } catch (error) {
      showSnack({
          variant: "error",
        message: error?.response?.data?.message || error?.message || "Não foi possível concluir a ação.",
      });
      return { success: false, error };
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRedirect = async () => {
    if (!selectedTicket?.id || !selectedRedirectEmployee) return;

    const result = await runTicketAction(
      () =>
        ticketService.updateAssignment(selectedTicket.id, selectedRedirectEmployee.id),
      "Ticket redirecionado com sucesso."
    );

    if (result?.success) {
      closeRedirectDialog();
    }
  };

  const handleConfirmReopenTicket = async () => {
    if (!selectedTicket?.id) return;

    await runTicketAction(
      () => ticketService.updateStatus(selectedTicket.id, "reabrir"),
      "Ticket reaberto com sucesso."
    );

    setIsReopenConfirmationOpen(false);
  };

  const handleHumanMessage = async () => {
    const cleanText = composerText.trim();
    if (!cleanText || !selectedTicketId) return;

    try {
      shouldStickToBottomRef.current = true;
      setActionLoading(true);
      const response = await ticketService.sendMessage(selectedTicketId, cleanText);
      setComposerText("");

      if (response?.chatMessage) {
        setMessages((previous) => upsertById(previous, response.chatMessage));
      }
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Não foi possível enviar a mensagem.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBotMessage = async () => {
    const cleanText = composerText.trim();
    if (!cleanText || !selectedTicketId) return;

    const localUserMessage = createLocalMessage({
      role: "user",
      content: cleanText,
      senderType: TICKET_SENDER_TYPE.CLIENTE,
      senderName: userData?.name || "Cliente",
      senderUserId: userData?.id || null,
      senderUser: userData
        ? {
            id: userData.id,
            name: userData.name,
            avatarUrl: userData.avatarUrl || null,
            userType: userData.userType || null,
          }
        : null,
    });
    const localAssistantMessage = createLocalMessage({
      role: "assistant",
      content: "",
      senderType: TICKET_SENDER_TYPE.BOT,
      senderName: "Resolve Assist",
    });

    shouldStickToBottomRef.current = true;
    setMessages((previous) => [
      ...previous,
      localUserMessage,
      localAssistantMessage,
    ]);
    setComposerText("");
    setBotStreaming(true);

    const streamController = new AbortController();
    botStreamAbortControllerRef.current = streamController;
    pendingBotMessageRef.current = {
      assistantMessageId: localAssistantMessage.id,
    };

    try {
      await chatbotService.streamMessage({
        message: cleanText,
        conversationId: conversation?.id || null,
        ticketId: selectedTicketId,
        signal: streamController.signal,
        onStart: (payload) => {
          if (payload?.conversationId) {
            setConversation((previous) => ({
              ...(previous || {}),
              id: payload.conversationId,
            }));
          }
        },
        onToken: (token) => {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === localAssistantMessage.id
                ? {
                    ...message,
                    content: `${message.content}${token}`,
                  }
                : message
            )
          );
        },
      });

      await refreshSelectedTicket();
    } catch (error) {
      if (isBotStreamAbortError(error)) {
        return;
      }

      showSnack({
        variant: "error",
        message:
          error?.message || "Não foi possível obter a resposta do chatbot.",
      });
      await refreshSelectedTicket();
    } finally {
      if (botStreamAbortControllerRef.current === streamController) {
        botStreamAbortControllerRef.current = null;
      }

      pendingBotMessageRef.current = null;
      setBotStreaming(false);
    }
  };

  const handleSubmitMessage = async (event) => {
    event.preventDefault();

    if (composerDisabled) return;

    if (selectedTicket?.permissions?.canUseChatbot) {
      await handleBotMessage();
      return;
    }

    await handleHumanMessage();
  };

  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent?.isComposing) {
      return;
    }

    event.preventDefault();

    if (composerDisabled || composerText.trim().length === 0) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  };

  const renderActionButtons = () => {
    if (!selectedTicket) return null;

    const buttons = [];
    const updateTicketStatusWithStreamingGuard = (status, successMessage) =>
      runTicketAction(async () => {
        if (isCustomerMode) {
          cancelPendingBotResponse();
        }

        return ticketService.updateStatus(selectedTicket.id, status);
      }, successMessage);

    if (selectedTicket.permissions?.canAccept) {
      buttons.push(
        <S.ActionButton
          key="accept"
          type="button"
          onClick={() =>
            runTicketAction(
              () =>
                ticketService.acceptTicket(
                  selectedTicket.id,
                  isEmployeeMode ? userData?.id : selectedAssigneeId || null
                ),
              "Ticket aceito com sucesso."
            )
          }
          disabled={actionLoading}
        >
          Aceitar ticket
        </S.ActionButton>
      );
    }

    if (selectedTicket.permissions?.canResolveByCustomer) {
      buttons.push(
        <S.ActionButton
          key="resolve-customer"
          type="button"
          onClick={handleStartChatbotEvaluation}
          disabled={actionLoading}
        >
          Resolvi o problema
        </S.ActionButton>
      );
    }

    if (selectedTicket.permissions?.canResolve) {
      buttons.push(
        <S.ActionButton
          key="resolve"
          type="button"
          onClick={() =>
            runTicketAction(
              () => ticketService.updateStatus(selectedTicket.id, "resolvido"),
              "Ticket marcado como resolvido."
            )
          }
          disabled={actionLoading}
        >
          Marcar resolvido
        </S.ActionButton>
      );
    }

    if (selectedTicket.permissions?.canClose) {
      buttons.push(
        <S.ActionButton
          key="close"
          type="button"
          onClick={() =>
            updateTicketStatusWithStreamingGuard(
              "fechado",
              "Ticket encerrado com sucesso."
            )
          }
          disabled={actionLoading}
        >
          Fechar ticket
        </S.ActionButton>
      );
    }

    if (selectedTicket.permissions?.canReopen) {
      buttons.push(
        <S.ActionButton
          key="reopen"
          type="button"
          $secondary
          onClick={isCustomerMode ? openReopenConfirmation : handleConfirmReopenTicket}
          disabled={actionLoading}
        >
          Reabrir ticket
        </S.ActionButton>
      );
    }

    return buttons;
  };

  const renderStatusPill = (ticket, { withHelper = false } = {}) => {
    const statusPill = (
      <S.StatusPill $tone={getTicketStatusTone(ticket.status)}>
        {getTicketStatusLabel(ticket.status)}
      </S.StatusPill>
    );
    const helper = withHelper ? getStatusFlowHelper(ticket) : null;

    if (!helper) return statusPill;

    return (
      <S.StatusHelper
        tabIndex={0}
        aria-label={`${getTicketStatusLabel(ticket.status)}. ${helper.title}`}
      >
        {statusPill}
        <S.StatusHelperTooltip role="tooltip">
          <S.StatusHelperTitle>{helper.title}</S.StatusHelperTitle>
          <S.StatusHelperList>
            {helper.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </S.StatusHelperList>
        </S.StatusHelperTooltip>
      </S.StatusHelper>
    );
  };

  const renderAssignedEmployeeSummary = (ticket) => {
    const assignedEmployee = ticket?.assignedEmployee;

    if (!assignedEmployee?.name) return null;

    const avatarUrl = getPersonAvatarUrl(assignedEmployee);
    const avatarKey = [
      "ticket-assignee",
      ticket?.id || "ticket",
      assignedEmployee.id || assignedEmployee.email || assignedEmployee.name,
      avatarUrl || "no-avatar",
    ].join("-");
    const shouldShowAvatarImage =
      Boolean(avatarUrl) && !ticketAvatarErrors[avatarKey];

    return (
      <S.TicketAssigneeRow>
        <S.TicketAssigneeAvatar aria-hidden="true">
          {shouldShowAvatarImage ? (
            <S.TicketAssigneeAvatarImage
              src={avatarUrl}
              alt=""
              onError={() => handleTicketAvatarError(avatarKey)}
            />
          ) : (
            getUserInitials(assignedEmployee.name, "RP")
          )}
        </S.TicketAssigneeAvatar>

        <S.TicketAssigneeText>
          <span>Responsável:</span>
          <strong>{assignedEmployee.name}</strong>
        </S.TicketAssigneeText>
      </S.TicketAssigneeRow>
    );
  };

  const renderTicketPagination = () => {
    const { page, pageSize, total, totalPages } = ticketPagination;
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(total, page * pageSize);

    return (
      <S.TicketPaginationBar>
        <S.TicketPaginationSummary>
          {total === 0
            ? "Nenhum resultado"
            : `${startItem}-${endItem} de ${total} ticket(s)`}
        </S.TicketPaginationSummary>

        <S.TicketPaginationControls>
          <S.TicketPageSizeLabel>
            Exibir
            <S.TicketPageSizeSelect
              value={pageSize}
              onChange={(event) => {
                setTicketPageSize(Number(event.target.value));
                setTicketPage(DEFAULT_TICKET_PAGE);
              }}
            >
              {TICKET_PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </S.TicketPageSizeSelect>
          </S.TicketPageSizeLabel>

          <S.TicketPaginationActions>
            <S.TicketPaginationButton
              type="button"
              disabled={page <= DEFAULT_TICKET_PAGE || workspaceLoading}
              onClick={() => setTicketPage((currentPage) => currentPage - 1)}
            >
              Anterior
            </S.TicketPaginationButton>

            <S.TicketPageIndicator>
              Página {page} de {totalPages}
            </S.TicketPageIndicator>

            <S.TicketPaginationButton
              type="button"
              disabled={page >= totalPages || workspaceLoading}
              onClick={() => setTicketPage((currentPage) => currentPage + 1)}
            >
              Próxima
            </S.TicketPaginationButton>
          </S.TicketPaginationActions>
        </S.TicketPaginationControls>
      </S.TicketPaginationBar>
    );
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Content>
        <S.HeroCard>
          <div>
            <S.HeroTitle>{title}</S.HeroTitle>
            <S.HeroText>{getDefaultHeroText(mode)}</S.HeroText>
          </div>

          <S.HeroMeta>
            <S.HeroBadge>
              <strong>{workspace.summary.aberto || 0}</strong>
              <span>Tickets abertos</span>
            </S.HeroBadge>
            <S.HeroBadge>
              <strong>{workspace.summary.pendente || 0}</strong>
              <span>Em atendimento</span>
            </S.HeroBadge>
            <S.HeroBadge>
              <strong>{workspace.summary.resolvido || 0}</strong>
              <span>Aguardando fechamento</span>
            </S.HeroBadge>
            {isEmployeeMode ? (
              <S.HeroBadge $withAction>
                <S.HeroBadgeActionButton
                  type="button"
                  onClick={handleToggleEmployeeAiPanel}
                  disabled={employeeAiState.loading}
                  title={
                    employeeAiState.loading
                      ? "Gerando leitura da IA"
                      : "Abrir feedback da IA"
                  }
                  aria-label={
                    employeeAiState.loading
                      ? "Gerando leitura da IA"
                      : "Abrir feedback da IA"
                  }
                >
                  <Sparkles size={15} strokeWidth={2.1} aria-hidden="true" />
                </S.HeroBadgeActionButton>
                <strong>
                  {formatAverageRatingLabel(workspace.summary.averageRating)}
                </strong>
                <span>{getEmployeeRatingCaption(workspace.summary.ratingCount)}</span>
              </S.HeroBadge>
            ) : null}
            {isCompanyMode ? (
              <S.HeroBadge>
                <strong>{workspace.summary.semResponsavel || 0}</strong>
                <span>Sem responsável</span>
              </S.HeroBadge>
            ) : null}
            {isCustomerMode ? (
              <S.HeroCtaLink as={Link} to="/cliente/closed-tickets">
                Ver tickets finalizados
              </S.HeroCtaLink>
            ) : null}
          </S.HeroMeta>
        </S.HeroCard>

        <S.Board>
          <S.Sidebar>
            <div>
              <S.SectionTitle>{ticketSectionTitle}</S.SectionTitle>
              <S.SectionText>{ticketSectionText}</S.SectionText>
            </div>

            {isCompanyMode ? (
              <S.TicketScopeSwitch
                role="tablist"
                aria-label="Escopo da lista de tickets"
              >
                {TICKET_SCOPE_OPTIONS.map((option) => (
                  <S.TicketScopeButton
                    key={option.value}
                    type="button"
                    role="tab"
                    $active={workspaceScope === option.value}
                    aria-selected={workspaceScope === option.value}
                    onClick={() => handleTicketScopeChange(option.value)}
                  >
                    {option.label}
                  </S.TicketScopeButton>
                ))}
              </S.TicketScopeSwitch>
            ) : null}

            <S.FilterAnchor>
            <S.TicketFilterHeader>
              <S.SearchInput
                value={ticketSearch}
                onChange={(event) => setTicketSearch(event.target.value)}
                placeholder={ticketSearchPlaceholder}
              />
              <S.FilterToggleButton
                type="button"
                $active={isFilterPanelOpen}
                onClick={() => setIsFilterPanelOpen((previous) => !previous)}
                title="Abrir filtros"
                aria-expanded={isFilterPanelOpen}
              >
                <Filter size={17} aria-hidden="true" />
                <span>Filtros</span>
              </S.FilterToggleButton>
            </S.TicketFilterHeader>

            {isFilterPanelOpen ? (
              <S.FilterPanel>
                <S.FilterGrid>
                  <S.FilterField>
                    <S.FilterLabel>Buscar em</S.FilterLabel>
                    <S.FilterSelect
                      value={ticketFilters.searchField}
                      onChange={(event) =>
                        updateTicketFilter("searchField", event.target.value)
                      }
                    >
                      {TICKET_SEARCH_FIELD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </S.FilterSelect>
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>Status</S.FilterLabel>
                    <S.FilterSelect
                      value={ticketFilters.status}
                      onChange={(event) =>
                        updateTicketFilter("status", event.target.value)
                      }
                    >
                      {ticketStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </S.FilterSelect>
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>Responsável</S.FilterLabel>
                    <S.FilterSelect
                      value={ticketFilters.responsible}
                      onChange={(event) =>
                        updateTicketFilter("responsible", event.target.value)
                      }
                    >
                      <option value="all">Todos</option>
                      <option value="assigned">Com responsável</option>
                      <option value="unassigned">Sem responsável</option>
                    </S.FilterSelect>
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>Data usada</S.FilterLabel>
                    <S.FilterSelect
                      value={ticketFilters.dateField}
                      onChange={(event) =>
                        updateTicketFilter("dateField", event.target.value)
                      }
                    >
                      {ticketDateFieldOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </S.FilterSelect>
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>Ordenação</S.FilterLabel>
                    <S.FilterSelect
                      value={ticketFilters.sortDirection}
                      onChange={(event) =>
                        updateTicketFilter("sortDirection", event.target.value)
                      }
                    >
                      <option value="desc">Mais recentes primeiro</option>
                      <option value="asc">Mais antigos primeiro</option>
                    </S.FilterSelect>
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>De</S.FilterLabel>
                    <S.FilterInput
                      type="date"
                      value={ticketFilters.dateFrom}
                      onChange={(event) =>
                        updateTicketFilter("dateFrom", event.target.value)
                      }
                    />
                  </S.FilterField>

                  <S.FilterField>
                    <S.FilterLabel>Até</S.FilterLabel>
                    <S.FilterInput
                      type="date"
                      value={ticketFilters.dateTo}
                      onChange={(event) =>
                        updateTicketFilter("dateTo", event.target.value)
                      }
                    />
                  </S.FilterField>
                </S.FilterGrid>

                <S.FilterFooter>
                  <S.FilterResultCount>
                    {filteredTickets.length} de {workspace.tickets.length} ticket(s)
                  </S.FilterResultCount>
                  <S.ClearFiltersButton type="button" onClick={clearTicketFilters}>
                    <RotateCcw size={15} aria-hidden="true" />
                    Limpar
                  </S.ClearFiltersButton>
                </S.FilterFooter>
              </S.FilterPanel>
            ) : (
              <S.FilterResultCount>
                {filteredTickets.length} de {workspace.tickets.length} ticket(s)
              </S.FilterResultCount>
            )}
            </S.FilterAnchor>

            <S.TicketList>
              {workspaceLoading ? (
                <S.EmptyState>Carregando tickets...</S.EmptyState>
              ) : null}

              {!workspaceLoading && filteredTickets.length === 0 ? (
                <S.EmptyState>{ticketEmptyStateMessage}</S.EmptyState>
              ) : null}

              {!workspaceLoading &&
                paginatedTickets.map((ticket) => (
                  <S.TicketButton
                    key={ticket.id}
                    type="button"
                    $active={String(ticket.id) === String(selectedTicketId)}
                    onClick={() => handleTicketSelection(ticket.id)}
                  >
                    <S.TicketRow>
                      <div>
                        <S.TicketName>{ticket.company?.name || "Resolve Mais"}</S.TicketName>
                        <S.TicketSmall>{ticket.protocol}</S.TicketSmall>
                      </div>
                      {renderStatusPill(ticket)}
                    </S.TicketRow>
                    <S.TicketSmall>
                      {ticket.complaintTitle?.title || "Sem assunto"}
                    </S.TicketSmall>
                    {renderAssignedEmployeeSummary(ticket)}
                  </S.TicketButton>
                ))}
            </S.TicketList>

            {!workspaceLoading ? renderTicketPagination() : null}
          </S.Sidebar>

          <S.Main>
            {!selectedTicket ? (
              <S.EmptyState>
                Selecione um ticket na lateral para abrir a conversa e acompanhar
                os detalhes do atendimento.
              </S.EmptyState>
            ) : (
              <>
                <S.TicketHeader>
                  <div>
                    <S.SectionTitle>
                      Ticket {buildTicketProtocol(selectedTicket.id)}
                    </S.SectionTitle>
                    <S.SectionText>
                      {selectedTicket.complaintTitle?.title || "Sem assunto"} -{" "}
                      {selectedTicket.company?.name || "Resolve Mais"}
                    </S.SectionText>
                  </div>

                  <S.TicketHeaderActions>
                    {!isCustomerMode ? (
                      <>
                        <S.ActionButton
                          type="button"
                          $secondary
                          onClick={openTicketDetailsDialog}
                        >
                          Ver detalhes
                        </S.ActionButton>
                        <S.ActionButton type="button" $secondary onClick={openHistoryDialog}>
                          Ver histórico
                        </S.ActionButton>
                      </>
                    ) : null}

                    {isCompanyMode && selectedTicket.permissions?.canAssign ? (
                      <>
                        <S.InlineSelect
                          value={selectedAssigneeId}
                          onChange={(event) =>
                            setSelectedAssigneeId(event.target.value)
                          }
                        >
                          {isCompanyMode ? (
                            <option value="">Sem responsável</option>
                          ) : null}
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name}
                            </option>
                          ))}
                        </S.InlineSelect>
                        <S.ActionButton
                          type="button"
                          $secondary
                          onClick={() =>
                            runTicketAction(
                              () =>
                                ticketService.updateAssignment(
                                  selectedTicket.id,
                                  selectedAssigneeId || null
                                ),
                              "Responsável atualizado."
                            )
                          }
                          disabled={assigneeActionDisabled}
                        >
                          Salvar responsável
                        </S.ActionButton>
                      </>
                    ) : null}

                    {isEmployeeMode && selectedTicket.permissions?.canRedirect ? (
                      <S.ActionButton
                        type="button"
                        $secondary
                        onClick={openRedirectDialog}
                        disabled={actionLoading || redirectCandidates.length === 0}
                      >
                        Redirecionar ticket
                      </S.ActionButton>
                    ) : null}

                    {renderActionButtons()}
                  </S.TicketHeaderActions>
                </S.TicketHeader>

                <S.MetaGrid>
                  <S.MetaItem>
                    <S.MetaLabel>Status</S.MetaLabel>
                    {renderStatusPill(selectedTicket, { withHelper: true })}
                  </S.MetaItem>
                  <S.MetaItem>
                    <S.MetaLabel>Modo atual</S.MetaLabel>
                    <S.MetaValue>{getConversationModeLabel(selectedTicket)}</S.MetaValue>
                  </S.MetaItem>
                  <S.MetaItem>
                    <S.MetaLabel>última atualização</S.MetaLabel>
                    <S.MetaValue>{formatDateTime(selectedTicket.updatedAt)}</S.MetaValue>
                  </S.MetaItem>
                  <S.MetaItem>
                    <S.MetaLabel>Responsável</S.MetaLabel>
                    <S.MetaValue>
                      {selectedTicket.assignedEmployee?.name || "Ainda não definido"}
                    </S.MetaValue>
                  </S.MetaItem>
                  {!isCustomerMode ? (
                    <S.MetaItem>
                      <S.MetaLabel>Cliente</S.MetaLabel>
                      <S.MetaValue>
                        {selectedTicket.customer?.name || "Não informado"}
                      </S.MetaValue>
                    </S.MetaItem>
                  ) : null}
                </S.MetaGrid>

                {isCustomerMode && selectedTicket.evaluation?.pending ? (
                  <S.EvaluationPrompt>
                    <S.EvaluationPromptContent>
                      <S.EvaluationPromptTitle>
                        {getEvaluationCopy(selectedTicket).title}
                      </S.EvaluationPromptTitle>
                      <S.EvaluationPromptText>
                        {getEvaluationCopy(selectedTicket).description}
                      </S.EvaluationPromptText>
                    </S.EvaluationPromptContent>

                    <S.ActionButton
                      type="button"
                      onClick={handleOpenPendingEvaluation}
                      disabled={actionLoading}
                    >
                      Avaliar atendimento
                    </S.ActionButton>
                  </S.EvaluationPrompt>
                ) : null}

                <S.ChatShell>
                  <S.Messages
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                  >
                    {detailLoading ? (
                      <S.EmptyState>Carregando conversa...</S.EmptyState>
                    ) : null}

                    {!detailLoading && messages.length === 0 ? (
                      <S.EmptyState>
                        Ainda não há mensagens neste ticket.
                      </S.EmptyState>
                    ) : null}

                    {!detailLoading &&
                      messages.map((message) => {
                        const messageUi = getMessageUiMeta(message, {
                          viewerType: isCustomerMode ? "customer" : "support",
                          ticketStatus: selectedTicket.status,
                          currentUser: userData,
                          ticketCustomer: selectedTicket.customer,
                        });
                        const messageContent = String(message.content || "").trim();
                        const shouldShowAvatarImage =
                          Boolean(messageUi.avatarUrl) &&
                          !messageAvatarErrors[message.id];

                        return (
                          <S.MessageRow key={message.id} $align={messageUi.align}>
                            {messageUi.isSystem ? (
                              <S.SystemMessage>
                                <S.SystemMessageText>
                                  {messageContent || "Atualização do sistema."}
                                </S.SystemMessageText>
                                <S.SystemMessageTime>
                                  {formatCompactDateTime(message.createdAt)}
                                </S.SystemMessageTime>
                              </S.SystemMessage>
                            ) : (
                              <S.MessageAvatar
                                $variant={messageUi.variant}
                                $align={messageUi.align}
                              >
                                {shouldShowAvatarImage ? (
                                  <S.MessageAvatarImage
                                    src={messageUi.avatarUrl}
                                    alt={messageUi.senderLabel}
                                    onError={() => handleMessageAvatarError(message.id)}
                                  />
                                ) : (
                                  messageUi.avatarText
                                )}
                              </S.MessageAvatar>
                            )}

                            {!messageUi.isSystem ? (
                              <S.MessageBubble
                                $align={messageUi.align}
                                $variant={messageUi.variant}
                              >
                                <S.MessageHeader>
                                  <S.MessageSender>
                                    {messageUi.senderLabel}
                                  </S.MessageSender>
                                  <S.MessageTag $variant={messageUi.variant}>
                                    {messageUi.tagLabel}
                                  </S.MessageTag>
                                </S.MessageHeader>

                                {messageContent ? (
                                  <S.MessageContent>{message.content}</S.MessageContent>
                                ) : (
                                  <S.MessagePlaceholder>
                                    {botStreaming && messageUi.variant === "bot"
                                      ? "Digitando..."
                                      : "Enviando..."}
                                  </S.MessagePlaceholder>
                                )}

                                <S.MessageTime $align={messageUi.align}>
                                  {formatDateTime(message.createdAt)}
                                </S.MessageTime>
                              </S.MessageBubble>
                            ) : null}
                          </S.MessageRow>
                        );
                      })}
                  </S.Messages>

                  <S.Composer onSubmit={handleSubmitMessage}>
                    <S.Textarea
                      value={composerText}
                      onChange={(event) => setComposerText(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder={
                        isCompanyMode
                          ? "Administradores apenas acompanham o histórico e alteram o responsável do ticket."
                          : selectedTicket.permissions?.canUseChatbot
                          ? "Conte o que aconteceu para o chatbot..."
                          : selectedTicket.permissions?.canSendHumanMessage
                          ? "Digite sua mensagem..."
                          : "Este ticket não aceita novas mensagens agora."
                      }
                      disabled={composerDisabled}
                    />
                    <S.ActionButton
                      type="submit"
                      disabled={composerDisabled || composerText.trim().length === 0}
                    >
                      {botStreaming ? "Respondendo..." : "Enviar"}
                    </S.ActionButton>
                  </S.Composer>
                </S.ChatShell>
              </>
            )}
          </S.Main>
        </S.Board>
      </S.Content>

      {isEmployeeMode && employeeAiPanelOpen ? (
        <S.HistoryDialogOverlay onClick={closeEmployeeAiPanel}>
          <S.EmployeeAiDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-ai-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.EmployeeAiEyebrow>
                  <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
                  <span>Leitura da IA sobre seu atendimento</span>
                </S.EmployeeAiEyebrow>
                <S.HistoryDialogTitle id="employee-ai-dialog-title">
                  {employeeAiInsights?.headline ||
                    "Feedback gerado a partir das avaliações dos clientes"}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  {employeeAiState.loading
                    ? "A IA está lendo suas avaliações mais recentes para apontar elogios, reclamações e oportunidades práticas de melhoria."
                    : employeeAiState.error
                    ? "Não foi possível carregar a leitura agora."
                    : employeeAiInsights?.summary ||
                      "Abra esta leitura quando quiser revisar como os clientes percebem seus atendimentos."}
                </S.HistoryDialogText>
              </div>

              <S.EmployeeAiHeaderActions>
                <S.EmployeeAiRefreshButton
                  type="button"
                  onClick={handleRefreshEmployeeAiInsights}
                  disabled={employeeAiState.loading}
                >
                  Atualizar leitura
                </S.EmployeeAiRefreshButton>
                <S.ActionButton
                  type="button"
                  $secondary
                  onClick={closeEmployeeAiPanel}
                  disabled={employeeAiState.loading}
                >
                  Fechar
                </S.ActionButton>
              </S.EmployeeAiHeaderActions>
            </S.HistoryDialogHeader>

            <S.EmployeeAiDialogBody>
              {employeeAiState.loading ? (
                <S.EmployeeAiEmptyState>Gerando leitura da IA...</S.EmployeeAiEmptyState>
              ) : null}

              {!employeeAiState.loading && employeeAiState.error ? (
                <S.EmployeeAiErrorBox>
                  <strong>Leitura indisponível no momento</strong>
                  <span>{employeeAiState.error}</span>
                </S.EmployeeAiErrorBox>
              ) : null}

              {!employeeAiState.loading && !employeeAiState.error && employeeAiInsights ? (
                <>
                  <S.EmployeeAiMeta>
                    {employeeAiGeneratedAt ? (
                      <S.EmployeeAiMetaPill>
                        Atualizado em {employeeAiGeneratedAt}
                      </S.EmployeeAiMetaPill>
                    ) : null}
                    <S.EmployeeAiMetaPill>
                      {employeeAiInsights?.sourceData?.reviewsAnalyzed || 0} avaliação(ões)
                    </S.EmployeeAiMetaPill>
                    <S.EmployeeAiMetaPill>
                      {employeeAiInsights?.sourceData?.ticketsAnalyzed || 0} ticket(s)
                    </S.EmployeeAiMetaPill>
                  </S.EmployeeAiMeta>

                  {Array.isArray(employeeAiInsights.insights) &&
                  employeeAiInsights.insights.length > 0 ? (
                    <S.EmployeeAiInsightsGrid>
                      {employeeAiInsights.insights.map((insight) => (
                        <S.EmployeeAiInsightCard
                          key={`${insight.title}-${insight.recommendedAction}`}
                        >
                          <S.EmployeeAiInsightHeader>
                            <S.EmployeeAiInsightTitle>{insight.title}</S.EmployeeAiInsightTitle>
                            <S.StatusPill $tone={insight.tone}>
                              {getAiInsightToneLabel(insight.tone)}
                            </S.StatusPill>
                          </S.EmployeeAiInsightHeader>

                          <S.EmployeeAiInsightText>{insight.summary}</S.EmployeeAiInsightText>

                          {Array.isArray(insight.evidence) && insight.evidence.length > 0 ? (
                            <S.EmployeeAiEvidenceList>
                              {insight.evidence.map((evidence, evidenceIndex) => (
                                <li key={`${insight.title}-evidence-${evidenceIndex}`}>
                                  {evidence}
                                </li>
                              ))}
                            </S.EmployeeAiEvidenceList>
                          ) : null}

                          <S.EmployeeAiActionBox>
                            <strong>Ação sugerida</strong>
                            <span>{insight.recommendedAction}</span>
                          </S.EmployeeAiActionBox>
                        </S.EmployeeAiInsightCard>
                      ))}
                    </S.EmployeeAiInsightsGrid>
                  ) : (
                    <S.EmployeeAiEmptyState>
                      Ainda não há sinais suficientes para destacar elogios ou reclamações com segurança.
                    </S.EmployeeAiEmptyState>
                  )}
                </>
              ) : null}
            </S.EmployeeAiDialogBody>
          </S.EmployeeAiDialog>
        </S.HistoryDialogOverlay>
      ) : null}

      {isEmployeeMode && selectedTicket && isRedirectDialogOpen ? (
        <S.HistoryDialogOverlay onClick={closeRedirectDialog}>
          <S.HistoryDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-redirect-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.HistoryDialogTitle id="ticket-redirect-dialog-title">
                  Redirecionar ticket{" "}
                  {selectedTicket.protocol || buildTicketProtocol(selectedTicket.id)}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  Escolha outro funcionário para assumir este atendimento. Após
                  confirmar, o ticket sai da sua fila.
                </S.HistoryDialogText>
              </div>

              <S.ActionButton
                type="button"
                $secondary
                onClick={closeRedirectDialog}
                disabled={actionLoading}
              >
                Cancelar
              </S.ActionButton>
            </S.HistoryDialogHeader>

            <S.HistoryDialogBody>
              <S.FilterField>
                <S.FilterLabel>Funcionário</S.FilterLabel>
                <S.RedirectCombobox>
                  <S.FilterInput
                    value={redirectSearch}
                    onChange={handleRedirectSearchChange}
                    placeholder="Pesquise e selecione o novo responsável"
                    autoFocus
                  />

                  {redirectCandidates.length > 0 ? (
                    <S.RedirectOptionList>
                      {filteredRedirectCandidates.map((employee) => (
                        <S.RedirectOptionButton
                          key={employee.id}
                          type="button"
                          $active={String(employee.id) === String(redirectEmployeeId)}
                          onClick={() => handleSelectRedirectEmployee(employee)}
                        >
                          <strong>{employee.name}</strong>
                          <S.RedirectOptionMeta>
                            {employee.jobTitle || "Cargo não informado"}
                            {employee.email ? ` · ${employee.email}` : ""}
                          </S.RedirectOptionMeta>
                        </S.RedirectOptionButton>
                      ))}

                      {filteredRedirectCandidates.length === 0 ? (
                        <S.RedirectOptionEmpty>
                          Nenhum funcionário encontrado com essa busca.
                        </S.RedirectOptionEmpty>
                      ) : null}
                    </S.RedirectOptionList>
                  ) : null}
                </S.RedirectCombobox>
              </S.FilterField>

              {selectedRedirectEmployee ? (
                <S.MetaItem>
                  <S.MetaLabel>Confirmação</S.MetaLabel>
                  <S.MetaValue>{selectedRedirectEmployee.name}</S.MetaValue>
                  <S.LogText>
                    {selectedRedirectEmployee.jobTitle || "Cargo não informado"}
                    {selectedRedirectEmployee.email
                      ? ` · ${selectedRedirectEmployee.email}`
                      : ""}
                  </S.LogText>
                </S.MetaItem>
              ) : null}

              {!redirectCandidates.length ? (
                <S.EmptyState>
                  Não há outro funcionário disponível para receber este ticket.
                </S.EmptyState>
              ) : null}

              <S.EvaluationActions>
                <S.ActionButton
                  type="button"
                  $secondary
                  onClick={closeRedirectDialog}
                  disabled={actionLoading}
                >
                  Voltar
                </S.ActionButton>
                <S.ActionButton
                  type="button"
                  onClick={handleConfirmRedirect}
                  disabled={redirectConfirmDisabled}
                >
                  {actionLoading ? "Redirecionando..." : "Confirmar redirecionamento"}
                </S.ActionButton>
              </S.EvaluationActions>
            </S.HistoryDialogBody>
          </S.HistoryDialog>
        </S.HistoryDialogOverlay>
      ) : null}

      {!isCustomerMode && selectedTicket && isHistoryDialogOpen ? (
        <S.HistoryDialogOverlay onClick={closeHistoryDialog}>
          <S.HistoryDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-history-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.HistoryDialogTitle id="ticket-history-dialog-title">
                  Historico do ticket {buildTicketProtocol(selectedTicket.id)}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  Consulte as movimentações do atendimento sem ocupar a área principal
                  do chat.
                </S.HistoryDialogText>
              </div>

              <S.ActionButton type="button" $secondary onClick={closeHistoryDialog}>
                Fechar
              </S.ActionButton>
            </S.HistoryDialogHeader>

            <S.HistoryDialogBody>
              {detailLoading ? (
                <S.EmptyState>Carregando histórico...</S.EmptyState>
              ) : null}

              {!detailLoading && logs.length === 0 ? (
                <S.EmptyState>Nenhum histórico encontrado para este ticket.</S.EmptyState>
              ) : null}

              {!detailLoading && logs.length > 0 ? (
                <S.LogList $stretch>
                  {logs.map((log) => (
                    <S.LogItem key={log.id}>
                      <S.LogTitle>{log.message}</S.LogTitle>
                      <S.LogText>
                        {formatDateTime(log.createdAt)}
                        {log.actor?.name ? ` - ${log.actor.name}` : ""}
                      </S.LogText>
                    </S.LogItem>
                  ))}
                </S.LogList>
              ) : null}
            </S.HistoryDialogBody>
          </S.HistoryDialog>
        </S.HistoryDialogOverlay>
      ) : null}

      {!isCustomerMode && selectedTicket && isTicketDetailsDialogOpen ? (
        <S.HistoryDialogOverlay onClick={closeTicketDetailsDialog}>
          <S.HistoryDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-details-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.HistoryDialogTitle id="ticket-details-dialog-title">
                  Detalhes do ticket {buildTicketProtocol(selectedTicket.id)}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  Dados principais do chamado para consulta da equipe.
                </S.HistoryDialogText>
              </div>

              <S.ActionButton type="button" $secondary onClick={closeTicketDetailsDialog}>
                Fechar
              </S.ActionButton>
            </S.HistoryDialogHeader>

            <S.TicketDetailsBody>
              <S.TicketDetailsGrid>
                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Protocolo</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.protocol || buildTicketProtocol(selectedTicket.id)}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Status</S.TicketDetailLabel>
                  {renderStatusPill(selectedTicket, { withHelper: true })}
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Modo atual</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {getConversationModeLabel(selectedTicket)}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Assunto</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.complaintTitle?.title || "Sem assunto"}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Empresa</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.company?.name || "Não informado"}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>CNPJ</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.company?.cnpj || "Não informado"}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Cliente</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.customer?.name || "Não informado"}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Responsável</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {selectedTicket.assignedEmployee?.name || "Ainda não definido"}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Criado em</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {formatDateTime(selectedTicket.createdAt)}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                <S.TicketDetailItem>
                  <S.TicketDetailLabel>Última atualização</S.TicketDetailLabel>
                  <S.TicketDetailValue>
                    {formatDateTime(selectedTicket.updatedAt)}
                  </S.TicketDetailValue>
                </S.TicketDetailItem>

                {selectedTicket.acceptedAt ? (
                  <S.TicketDetailItem>
                    <S.TicketDetailLabel>Aceito em</S.TicketDetailLabel>
                    <S.TicketDetailValue>
                      {formatDateTime(selectedTicket.acceptedAt)}
                    </S.TicketDetailValue>
                  </S.TicketDetailItem>
                ) : null}

                {selectedTicket.resolvedAt ? (
                  <S.TicketDetailItem>
                    <S.TicketDetailLabel>Resolvido em</S.TicketDetailLabel>
                    <S.TicketDetailValue>
                      {formatDateTime(selectedTicket.resolvedAt)}
                    </S.TicketDetailValue>
                  </S.TicketDetailItem>
                ) : null}

                <S.TicketDetailBlock>
                  <S.TicketDetailLabel>Descrição do cliente</S.TicketDetailLabel>
                  <S.TicketDetailText>
                    {selectedTicket.description || "Sem descrição registrada."}
                  </S.TicketDetailText>
                </S.TicketDetailBlock>

                <S.TicketDetailBlock>
                  <S.TicketDetailLabel>Descrição do assunto</S.TicketDetailLabel>
                  <S.TicketDetailText>
                    {selectedTicket.complaintTitle?.description ||
                      "Sem descrição complementar para este assunto."}
                  </S.TicketDetailText>
                </S.TicketDetailBlock>

                {selectedTicket.lastUpdateMessage ? (
                  <S.TicketDetailBlock>
                    <S.TicketDetailLabel>Última movimentação</S.TicketDetailLabel>
                    <S.TicketDetailText>
                      {selectedTicket.lastUpdateMessage}
                    </S.TicketDetailText>
                  </S.TicketDetailBlock>
                ) : null}
              </S.TicketDetailsGrid>
            </S.TicketDetailsBody>
          </S.HistoryDialog>
        </S.HistoryDialogOverlay>
      ) : null}

      {isCustomerMode && selectedTicket && isReopenConfirmationOpen ? (
        <S.HistoryDialogOverlay onClick={closeReopenConfirmation}>
          <S.HistoryDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-reopen-confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.HistoryDialogTitle id="ticket-reopen-confirmation-title">
                  Confirmar reabertura do ticket{" "}
                  {selectedTicket.protocol || buildTicketProtocol(selectedTicket.id)}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  Confirme apenas se o problema voltou ou ainda precisa de atendimento.
                </S.HistoryDialogText>
              </div>

              <S.ActionButton
                type="button"
                $secondary
                onClick={closeReopenConfirmation}
                disabled={actionLoading}
              >
                Cancelar
              </S.ActionButton>
            </S.HistoryDialogHeader>

            <S.HistoryDialogBody>
              <S.EvaluationHint>
                Se foi um clique sem querer, cancele. O chamado continuará no
                estado atual.
              </S.EvaluationHint>

              <S.EvaluationActions>
                <S.ActionButton
                  type="button"
                  $secondary
                  onClick={closeReopenConfirmation}
                  disabled={actionLoading}
                >
                  Manter como está
                </S.ActionButton>
                <S.ActionButton
                  type="button"
                  onClick={handleConfirmReopenTicket}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Reabrindo..." : "Confirmar reabertura"}
                </S.ActionButton>
              </S.EvaluationActions>
            </S.HistoryDialogBody>
          </S.HistoryDialog>
        </S.HistoryDialogOverlay>
      ) : null}

      {isCustomerMode && selectedTicket && evaluationDialog.isOpen ? (
        <S.HistoryDialogOverlay onClick={closeEvaluationDialog}>
          <S.HistoryDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-evaluation-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <S.HistoryDialogHeader>
              <div>
                <S.HistoryDialogTitle id="ticket-evaluation-dialog-title">
                  {getEvaluationCopy(selectedTicket).title}
                </S.HistoryDialogTitle>
                <S.HistoryDialogText>
                  {getEvaluationCopy(selectedTicket).description}
                </S.HistoryDialogText>
              </div>

              <S.ActionButton
                type="button"
                $secondary
                onClick={closeEvaluationDialog}
                disabled={actionLoading}
              >
                Depois
              </S.ActionButton>
            </S.HistoryDialogHeader>

            <S.EvaluationDialogBody>
              <div>
                <S.MetaLabel>Sua nota</S.MetaLabel>
                <S.EvaluationStars>
                  {EVALUATION_RATING_OPTIONS.map((option) => (
                    <S.EvaluationStarButton
                      key={option}
                      type="button"
                      $active={evaluationRating === option}
                      onClick={() => setEvaluationRating(option)}
                      disabled={actionLoading}
                    >
                      {option} estrela{option > 1 ? "s" : ""}
                    </S.EvaluationStarButton>
                  ))}
                </S.EvaluationStars>
              </div>

              <div>
                <S.MetaLabel>Comentario opcional</S.MetaLabel>
                <S.EvaluationTextarea
                  value={evaluationComment}
                  onChange={(event) => setEvaluationComment(event.target.value)}
                  placeholder="Conte rapidamente como foi a resolução."
                  disabled={actionLoading}
                />
              </div>

              <S.EvaluationHint>
                Essa avaliação fica vinculada ao ticket e ajuda a medir a qualidade do atendimento.
              </S.EvaluationHint>

              <S.EvaluationActions>
                <S.ActionButton
                  type="button"
                  $secondary
                  onClick={closeEvaluationDialog}
                  disabled={actionLoading}
                >
                  Cancelar
                </S.ActionButton>
                <S.ActionButton
                  type="button"
                  onClick={handleSubmitEvaluation}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Enviando..." : getEvaluationCopy(selectedTicket).submitLabel}
                </S.ActionButton>
              </S.EvaluationActions>
            </S.EvaluationDialogBody>
          </S.HistoryDialog>
        </S.HistoryDialogOverlay>
      ) : null}
    </S.Page>
  );
};

export default TicketWorkspace;
