import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
    return "Visualize os chamados da empresa, acompanhe o histórico de movimentações e troque o responsável sempre que precisar.";
  }

  if (mode === "employee") {
    return "Aceite tickets, converse em tempo real com o cliente e marque o atendimento como resolvido quando a situação estiver encaminhada.";
  }

  return "Acompanhe seus tickets, converse com o chatbot no primeiro contato e siga para o atendimento humano quando a empresa assumir o chamado.";
};

const EVALUATION_RATING_OPTIONS = [1, 2, 3, 4, 5];

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

const TicketWorkspace = ({ mode = "customer", title }) => {
  const { userData } = useAuth();
  const { showSnack } = useSnack();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesContainerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const botStreamAbortControllerRef = useRef(null);
  const pendingBotMessageRef = useRef(null);
  const promptedEvaluationKeysRef = useRef(new Set());

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
  const [ticketSearch, setTicketSearch] = useState("");
  const [composerText, setComposerText] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isTicketDetailsDialogOpen, setIsTicketDetailsDialogOpen] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [botStreaming, setBotStreaming] = useState(false);
  const [messageAvatarErrors, setMessageAvatarErrors] = useState({});
  const [evaluationDialog, setEvaluationDialog] = useState({ isOpen: false, mode: null });
  const [evaluationRating, setEvaluationRating] = useState(0);
  const [evaluationComment, setEvaluationComment] = useState("");

  const isCompanyMode = mode === "company";
  const isEmployeeMode = mode === "employee";
  const isCustomerMode = mode === "customer";

  const filteredTickets = useMemo(() => {
    const term = ticketSearch.trim().toLowerCase();

    if (!term) return workspace.tickets;

    return workspace.tickets.filter((ticket) =>
      [
        ticket.protocol,
        ticket.company?.name,
        ticket.customer?.name,
        ticket.complaintTitle?.title,
        ticket.assignedEmployee?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [ticketSearch, workspace.tickets]);

  const composerDisabled = useMemo(() => {
    if (!selectedTicket) return true;
    if (isCompanyMode) return true;
    if (actionLoading || detailLoading || botStreaming) return true;

    const canUseChatbot = selectedTicket.permissions?.canUseChatbot;
    const canSendHuman = selectedTicket.permissions?.canSendHumanMessage;

    return !(canUseChatbot || canSendHuman);
  }, [actionLoading, botStreaming, detailLoading, isCompanyMode, selectedTicket]);

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
        ticketService.getWorkspace({ scope: "active" }),
        isCompanyMode ? companyAdminService.listEmployees() : Promise.resolve(null),
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

  const loadTicketContext = async (ticketId) => {
    if (!ticketId) {
      setSelectedTicket(null);
      setConversation(null);
      setMessages([]);
      setLogs([]);
      setSelectedAssigneeId("");
      return;
    }

    try {
      setDetailLoading(true);

      const [detailResponse, messagesResponse, logsResponse] = await Promise.all([
        ticketService.getTicketDetail(ticketId),
        ticketService.getTicketMessages(ticketId),
        isCustomerMode
          ? Promise.resolve({ logs: [] })
          : ticketService.getTicketLogs(ticketId),
      ]);

      const detailTicket = detailResponse.ticket || messagesResponse.ticket || null;

      setSelectedTicket(detailTicket);
      setConversation(messagesResponse.conversation || null);
      setMessages(messagesResponse.messages || []);
      setLogs(logsResponse.logs || []);
      setSelectedAssigneeId(detailTicket?.assignedEmployee?.id || "");

      setWorkspace((previous) => ({
        ...previous,
        tickets: previous.tickets.map((ticket) =>
          String(ticket.id) === String(detailTicket?.id) ? detailTicket : ticket
        ),
      }));
    } catch (error) {
      setSelectedTicket(null);
      setConversation(null);
      setMessages([]);
      setLogs([]);
      setSelectedAssigneeId("");
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Não foi possível carregar o ticket.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [isCompanyMode, selectedTicketId, searchParams]);

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
    setIsHistoryDialogOpen(false);
    setIsTicketDetailsDialogOpen(false);
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
      isHistoryDialogOpen ||
      isTicketDetailsDialogOpen ||
      evaluationDialog.isOpen;

    if (!hasOpenDialog) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") return;

      if (isTicketDetailsDialogOpen) {
        setIsTicketDetailsDialogOpen(false);
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
  }, [actionLoading, evaluationDialog.isOpen, isHistoryDialogOpen, isTicketDetailsDialogOpen]);

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
          loadWorkspace({ silent: true });
        },
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;

        if (error?.message) {
          showSnack({
            variant: "error",
            message: error.message,
          });
        }
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

  const refreshSelectedTicket = async () => {
    if (!selectedTicketId) return;
    await loadTicketContext(selectedTicketId);
  };

  const applyActionResult = async (response, successMessage) => {
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
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || error?.message || "Não foi possível concluir a ação.",
      });
    } finally {
      setActionLoading(false);
    }
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
          onClick={() =>
            runTicketAction(
              () => ticketService.updateStatus(selectedTicket.id, "reabrir"),
              "Ticket reaberto com sucesso."
            )
          }
          disabled={actionLoading}
        >
          Reabrir ticket
        </S.ActionButton>
      );
    }

    return buttons;
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
            {isCompanyMode ? (
              <S.HeroBadge>
                <strong>{workspace.summary.semResponsavel || 0}</strong>
                <span>Sem responsável</span>
              </S.HeroBadge>
            ) : null}
          </S.HeroMeta>
        </S.HeroCard>

        <S.Board>
          <S.Sidebar>
            <div>
              <S.SectionTitle>Tickets ativos</S.SectionTitle>
              <S.SectionText>
                {isCustomerMode
                  ? "Escolha um ticket para acompanhar a conversa e o andamento."
                  : "Selecione um ticket para abrir o chat, consultar o histórico quando precisar e agir no atendimento."}
              </S.SectionText>
            </div>

            <S.SearchInput
              value={ticketSearch}
              onChange={(event) => setTicketSearch(event.target.value)}
              placeholder="Buscar por protocolo, empresa ou assunto"
            />

            <S.TicketList>
              {workspaceLoading ? (
                <S.EmptyState>Carregando tickets...</S.EmptyState>
              ) : null}

              {!workspaceLoading && filteredTickets.length === 0 ? (
                <S.EmptyState>Nenhum ticket disponível no momento.</S.EmptyState>
              ) : null}

              {!workspaceLoading &&
                filteredTickets.map((ticket) => (
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
                      <S.StatusPill $tone={getTicketStatusTone(ticket.status)}>
                        {getTicketStatusLabel(ticket.status)}
                      </S.StatusPill>
                    </S.TicketRow>
                    <S.TicketSmall>
                      {ticket.complaintTitle?.title || "Sem assunto"}
                    </S.TicketSmall>
                    {ticket.assignedEmployee?.name ? (
                      <S.TicketSmall>
                        Responsável: {ticket.assignedEmployee.name}
                      </S.TicketSmall>
                    ) : null}
                  </S.TicketButton>
                ))}
            </S.TicketList>
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
                          <option value="">Sem responsável</option>
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
                          disabled={actionLoading}
                        >
                          Salvar responsável
                        </S.ActionButton>
                      </>
                    ) : null}

                    {renderActionButtons()}
                  </S.TicketHeaderActions>
                </S.TicketHeader>

                <S.MetaGrid>
                  <S.MetaItem>
                    <S.MetaLabel>Status</S.MetaLabel>
                    <S.StatusPill $tone={getTicketStatusTone(selectedTicket.status)}>
                      {getTicketStatusLabel(selectedTicket.status)}
                    </S.StatusPill>
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

                <S.ConversationBanner
                  $warning={selectedTicket.status === TICKET_STATUS.ABERTO}
                >
                  <S.ConversationBannerLabel>Fluxo</S.ConversationBannerLabel>
                  <span>
                    {selectedTicket.status === TICKET_STATUS.ABERTO
                      ? "Chatbot ativo. O atendimento humano começa quando a empresa aceitar o chamado."
                      : "Conversa centralizada neste chat. Use o histórico para revisar movimentações."}
                  </span>
                </S.ConversationBanner>

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
                  <S.StatusPill $tone={getTicketStatusTone(selectedTicket.status)}>
                    {getTicketStatusLabel(selectedTicket.status)}
                  </S.StatusPill>
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
