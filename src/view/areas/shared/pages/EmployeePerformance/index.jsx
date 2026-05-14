import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useParams } from "react-router-dom";

import LoggedHeader from "../../../../../components/LoggedHeader";
import { useAuth } from "../../../../../contexts/AuthContext";
import { useSnack } from "../../../../../contexts/SnackContext";
import { companyAdminService } from "../../../../../services/companyAdminService";
import { ticketService } from "../../../../../services/ticketService";
import {
  buildTicketProtocol,
  formatCompactDateTime,
  formatDateTime,
  getMessageUiMeta,
  getUserInitials,
  TICKET_SENDER_TYPE,
} from "../../../../../utils/ticket";
import { normalizeUserType, USER_TYPES } from "../../../../../utils/userType";
import * as S from "./styles";

const RATING_FILTER_OPTIONS = ["all", 5, 4, 3, 2, 1];
const SORT_OPTIONS = [
  { value: "desc", label: "Mais recentes primeiro" },
  { value: "asc", label: "Mais antigos primeiro" },
];

const getRatingStarsLabel = (rating) =>
  `${"★".repeat(Math.max(0, Number(rating || 0)))}${"☆".repeat(
    Math.max(0, 5 - Number(rating || 0))
  )} (${Number(rating || 0)}/5)`;

const getRatingFilterLabel = (rating) =>
  rating === "all" ? "Todas" : `${rating} estrela${rating > 1 ? "s" : ""}`;

const getResolutionSourceLabel = (source) => {
  if (source === "chatbot") return "Resolvido pelo chatbot";
  if (source === "human") return "Resolvido pelo atendimento";
  return "Resolução registrada";
};

const getConversationChannelLabel = (message) => {
  if (message?.senderType === TICKET_SENDER_TYPE.BOT) return "Chatbot";
  if (message?.senderType === TICKET_SENDER_TYPE.SISTEMA) return "Sistema";
  if (message?.senderType === TICKET_SENDER_TYPE.CLIENTE) return "Cliente";
  return "Equipe";
};

const buildReviewItem = (ticket) => {
  const rating = Number(ticket?.evaluation?.rating || 0);

  if (!rating) return null;

  return {
    ticketId: ticket.id,
    protocol: ticket.protocol || buildTicketProtocol(ticket.id),
    rating,
    comment: ticket.evaluation?.comment || "",
    submittedAt:
      ticket.evaluation?.submittedAt ||
      ticket.closedAt ||
      ticket.resolvedAt ||
      ticket.updatedAt ||
      ticket.createdAt ||
      null,
    resolutionSource: ticket.evaluation?.resolutionSource || "human",
    subject: ticket.complaintTitle?.title || "Atendimento registrado",
    description: ticket.description || "",
    customerName: ticket.customer?.name || "Cliente",
    customerEmail: ticket.customer?.email || "",
    ticket,
  };
};

const getReviewTime = (review) => {
  const parsedDate = new Date(review?.submittedAt || "");
  return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
};

const sortReviewsByDate = (reviews, sortDirection = "desc") =>
  [...reviews].sort((leftReview, rightReview) => {
    const leftTime = getReviewTime(leftReview);
    const rightTime = getReviewTime(rightReview);

    if (leftTime === rightTime) {
      return Number(rightReview.ticketId || 0) - Number(leftReview.ticketId || 0);
    }

    return sortDirection === "asc"
      ? leftTime - rightTime
      : rightTime - leftTime;
  });

const buildEmployeeSnapshot = (userData) => ({
  id: userData?.id || null,
  name: userData?.name || "Funcionário",
  email: userData?.email || "",
  jobTitle: userData?.jobTitle || "",
  avatarUrl: userData?.avatarUrl || "",
});

const DEFAULT_CONVERSATION_STATE = {
  isOpen: false,
  loading: false,
  error: "",
  review: null,
  ticket: null,
  messages: [],
};

export default function EmployeePerformancePage() {
  const { employeeId } = useParams();
  const { userData } = useAuth();
  const { showSnack } = useSnack();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState(null);
  const [assignedTicketsCount, setAssignedTicketsCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [messageAvatarErrors, setMessageAvatarErrors] = useState({});
  const [conversationState, setConversationState] = useState(
    DEFAULT_CONVERSATION_STATE
  );

  const userType = normalizeUserType(userData?.userType);
  const isEmployeeMode = userType === USER_TYPES.FUNCIONARIO;
  const isCompanyMode = userType === USER_TYPES.EMPRESA;
  const targetEmployeeId = isEmployeeMode ? userData?.id : employeeId;
  const backPath = isCompanyMode
    ? "/empresa/administradores"
    : "/funcionario/home";

  useEffect(() => {
    setAvatarLoadError(false);
  }, [employee?.avatarUrl]);

  useEffect(() => {
    setMessageAvatarErrors({});
  }, [conversationState.isOpen]);

  useEffect(() => {
    if (!conversationState.isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setConversationState(DEFAULT_CONVERSATION_STATE);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [conversationState.isOpen]);

  useEffect(() => {
    let active = true;

    const loadPerformance = async () => {
      if (isEmployeeMode && !userData?.id) return;

      if (!targetEmployeeId) {
        setLoading(false);
        setError("Funcionário não encontrado.");
        setEmployee(null);
        setAssignedTicketsCount(0);
        setReviews([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [workspaceResponse, employeesResponse] = await Promise.all([
          ticketService.getWorkspace({ scope: "all" }),
          isCompanyMode
            ? companyAdminService.listEmployees({ page: 1, pageSize: 1000 })
            : Promise.resolve(null),
        ]);

        if (!active) return;

        const workspaceTickets = Array.isArray(workspaceResponse?.tickets)
          ? workspaceResponse.tickets
          : [];
        const employeeTickets = workspaceTickets.filter(
          (ticket) =>
            String(ticket?.assignedEmployee?.id || "") ===
            String(targetEmployeeId || "")
        );

        const listedEmployee = isCompanyMode
          ? (employeesResponse?.employees || []).find(
              (item) => String(item?.id || "") === String(targetEmployeeId || "")
            ) || null
          : null;
        const ticketEmployee = employeeTickets[0]?.assignedEmployee || null;
        const resolvedEmployee = isEmployeeMode
          ? buildEmployeeSnapshot(userData)
          : listedEmployee || ticketEmployee;

        if (!resolvedEmployee) {
          setEmployee(null);
          setAssignedTicketsCount(0);
          setReviews([]);
          setError("Funcionário não encontrado na empresa.");
          return;
        }

        setEmployee(resolvedEmployee);
        setAssignedTicketsCount(employeeTickets.length);
        setReviews(employeeTickets.map(buildReviewItem).filter(Boolean));
      } catch (requestError) {
        if (!active) return;

        setEmployee(null);
        setAssignedTicketsCount(0);
        setReviews([]);
        setError("Não foi possível carregar o desempenho deste funcionário.");
        showSnack({
          variant: "error",
          message:
            requestError?.response?.data?.message ||
            "Não foi possível carregar o desempenho deste funcionário.",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPerformance();

    return () => {
      active = false;
    };
  }, [
    isCompanyMode,
    isEmployeeMode,
    showSnack,
    targetEmployeeId,
    userData,
  ]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
      const reviewRating = Number(review.rating || 0);

      if (distribution[reviewRating] !== undefined) {
        distribution[reviewRating] += 1;
      }
    });

    return distribution;
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null;

    const total = reviews.reduce(
      (accumulator, review) => accumulator + Number(review.rating || 0),
      0
    );

    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const latestReview = useMemo(
    () => sortReviewsByDate(reviews, "desc")[0] || null,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    const baseReviews =
      ratingFilter === "all"
        ? reviews
        : reviews.filter((review) => Number(review.rating) === Number(ratingFilter));

    return sortReviewsByDate(baseReviews, sortDirection);
  }, [ratingFilter, reviews, sortDirection]);

  const messageViewerType = isCompanyMode ? "company" : "employee";
  const overallRatingLabel =
    typeof averageRating === "number" ? averageRating.toFixed(1) : "—";
  const headerEyebrow = isCompanyMode
    ? "Desempenho do funcionário"
    : "Meu desempenho";
  const headerDescription = isCompanyMode
    ? "Acompanhe a nota média, o histórico de avaliações e abra a conversa de cada atendimento quando precisar revisar o contexto."
    : "Veja como seus atendimentos foram avaliados e consulte a conversa de cada nota para entender melhor o contexto de cada caso.";
  const summaryCaption =
    reviews.length > 0
      ? `Baseado em ${reviews.length} avaliação(ões) registradas.`
      : "Este funcionário ainda não possui avaliações registradas.";
  const latestRatingLabel = latestReview
    ? `${latestReview.rating}/5 em ${formatCompactDateTime(latestReview.submittedAt)}`
    : "Sem notas ainda";

  const handleMessageAvatarError = (messageId) => {
    setMessageAvatarErrors((previous) => ({
      ...previous,
      [messageId]: true,
    }));
  };

  const closeConversation = () => {
    setConversationState(DEFAULT_CONVERSATION_STATE);
  };

  const openConversation = async (review) => {
    setConversationState({
      isOpen: true,
      loading: true,
      error: "",
      review,
      ticket: review.ticket || null,
      messages: [],
    });

    try {
      const [detailResponse, messagesResponse] = await Promise.all([
        ticketService.getTicketDetail(review.ticketId),
        ticketService.getTicketMessages(review.ticketId),
      ]);

      setConversationState({
        isOpen: true,
        loading: false,
        error: "",
        review,
        ticket: detailResponse?.ticket || messagesResponse?.ticket || review.ticket,
        messages: messagesResponse?.messages || [],
      });
    } catch (requestError) {
      setConversationState({
        isOpen: true,
        loading: false,
        error:
          requestError?.response?.data?.message ||
          "Não foi possível carregar a conversa deste atendimento.",
        review,
        ticket: review.ticket || null,
        messages: [],
      });

      showSnack({
        variant: "error",
        message:
          requestError?.response?.data?.message ||
          "Não foi possível carregar a conversa deste atendimento.",
      });
    }
  };

  const renderEmployeeAvatar = () => {
    const avatarUrl =
      typeof employee?.avatarUrl === "string" ? employee.avatarUrl.trim() : "";

    if (avatarUrl && !avatarLoadError) {
      return (
        <S.EmployeeAvatarImage
          src={avatarUrl}
          alt=""
          onError={() => setAvatarLoadError(true)}
        />
      );
    }

    return getUserInitials(employee?.name, "AT");
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        <S.BackLink to={backPath}>
          <ArrowLeft size={16} />
          <span>{isCompanyMode ? "Voltar para colaboradores" : "Voltar para a home"}</span>
        </S.BackLink>

        <S.HeroSection>
          <S.HeroCard>
            <S.Eyebrow>
              <S.EyebrowDot />
              <span>{headerEyebrow}</span>
            </S.Eyebrow>

            <S.EmployeeRow>
              <S.EmployeeAvatar>{renderEmployeeAvatar()}</S.EmployeeAvatar>
              <div>
                <S.EmployeeName>{employee?.name || "Funcionário"}</S.EmployeeName>
                <S.EmployeeRole>
                  {employee?.jobTitle || "Cargo não informado"}
                </S.EmployeeRole>
              </div>
            </S.EmployeeRow>

            <S.HeroTitle>
              {isCompanyMode
                ? "Avaliações e histórico de atendimento"
                : "Como o seu atendimento está sendo percebido"}
            </S.HeroTitle>

            <S.HeroText>{headerDescription}</S.HeroText>

            <S.HeroMeta>
              <S.MetaPill>
                <strong>Tickets atribuídos</strong>
                <span>{loading ? "—" : assignedTicketsCount}</span>
              </S.MetaPill>
              <S.MetaPill>
                <strong>Avaliações registradas</strong>
                <span>{loading ? "—" : reviews.length}</span>
              </S.MetaPill>
              <S.MetaPill>
                <strong>Última nota</strong>
                <span>{loading ? "—" : latestRatingLabel}</span>
              </S.MetaPill>
            </S.HeroMeta>
          </S.HeroCard>

          <S.SummaryCard>
            <S.SummaryLabel>Nota geral do atendimento</S.SummaryLabel>
            <S.SummaryValue>{loading ? "—" : overallRatingLabel}</S.SummaryValue>
            <S.SummaryStars>
              {loading
                ? "Carregando avaliações..."
                : averageRating === null
                ? "Sem avaliações registradas"
                : getRatingStarsLabel(Math.round(averageRating))}
            </S.SummaryStars>
            <S.SummaryCaption>{summaryCaption}</S.SummaryCaption>

            <S.DistributionList>
              {[5, 4, 3, 2, 1].map((rating) => (
                <S.DistributionPill key={rating}>
                  <span>{rating}★</span>
                  <strong>{loading ? "—" : ratingDistribution[rating]}</strong>
                </S.DistributionPill>
              ))}
            </S.DistributionList>
          </S.SummaryCard>
        </S.HeroSection>

        {error ? <S.EmptyState>{error}</S.EmptyState> : null}

        <S.MetricsGrid>
          <S.MetricCard>
            <S.MetricValue>{loading ? "—" : assignedTicketsCount}</S.MetricValue>
            <S.MetricLabel>Tickets atribuídos</S.MetricLabel>
            <S.MetricHelper>Volume total de atendimentos vinculados a este funcionário.</S.MetricHelper>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricValue>{loading ? "—" : reviews.length}</S.MetricValue>
            <S.MetricLabel>Avaliações recebidas</S.MetricLabel>
            <S.MetricHelper>Quantidade de tickets que receberam nota do cliente.</S.MetricHelper>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricValue>{loading ? "—" : ratingDistribution[5]}</S.MetricValue>
            <S.MetricLabel>Notas máximas</S.MetricLabel>
            <S.MetricHelper>Atendimentos avaliados com cinco estrelas.</S.MetricHelper>
          </S.MetricCard>
        </S.MetricsGrid>

        <S.SectionCard>
          <S.SectionHeader>
            <div>
              <S.SectionTitle>Últimas notas</S.SectionTitle>
              <S.SectionText>
                Filtre por estrela e altere a ordenação para revisar os atendimentos com mais contexto.
              </S.SectionText>
            </div>
          </S.SectionHeader>

          <S.ControlBar>
            <S.FilterChipGroup>
              {RATING_FILTER_OPTIONS.map((option) => (
                <S.FilterChip
                  key={option}
                  type="button"
                  $active={ratingFilter === option}
                  onClick={() => setRatingFilter(option)}
                >
                  <span>{getRatingFilterLabel(option)}</span>
                  <strong>
                    {option === "all"
                      ? reviews.length
                      : ratingDistribution[Number(option)] || 0}
                  </strong>
                </S.FilterChip>
              ))}
            </S.FilterChipGroup>

            <S.SortControl>
              <S.SortLabel htmlFor="review-sort-select">Ordenação</S.SortLabel>
              <S.SortSelect
                id="review-sort-select"
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </S.SortSelect>
            </S.SortControl>
          </S.ControlBar>

          {loading ? <S.EmptyState>Carregando avaliações...</S.EmptyState> : null}

          {!loading && filteredReviews.length === 0 ? (
            <S.EmptyState>
              {reviews.length === 0
                ? "Ainda não há avaliações registradas para este funcionário."
                : "Nenhuma avaliação encontrada para o filtro selecionado."}
            </S.EmptyState>
          ) : null}

          {!loading && filteredReviews.length > 0 ? (
            <S.ReviewList>
              {filteredReviews.map((review) => {
                const isConversationLoading =
                  conversationState.loading &&
                  String(conversationState.review?.ticketId || "") ===
                    String(review.ticketId);

                return (
                  <S.ReviewCard key={`${review.ticketId}-${review.submittedAt || review.rating}`}>
                    <S.ReviewTop>
                      <div>
                        <S.ReviewStars>{getRatingStarsLabel(review.rating)}</S.ReviewStars>
                        <S.ReviewSubject>{review.subject}</S.ReviewSubject>
                      </div>
                      <S.ReviewDate>{formatDateTime(review.submittedAt)}</S.ReviewDate>
                    </S.ReviewTop>

                    <S.ReviewComment>
                      {review.comment || "Avaliação registrada sem comentário detalhado."}
                    </S.ReviewComment>

                    <S.ReviewMeta>
                      <S.ReviewMetaItem>
                        <span>Ticket</span>
                        <strong>{review.protocol}</strong>
                      </S.ReviewMetaItem>
                      <S.ReviewMetaItem>
                        <span>Cliente</span>
                        <strong>{review.customerName}</strong>
                      </S.ReviewMetaItem>
                      <S.ReviewMetaItem>
                        <span>Origem</span>
                        <strong>{getResolutionSourceLabel(review.resolutionSource)}</strong>
                      </S.ReviewMetaItem>
                    </S.ReviewMeta>

                    <S.ReviewActionButton
                      type="button"
                      onClick={() => openConversation(review)}
                      disabled={isConversationLoading}
                    >
                      <MessageSquareText size={16} />
                      <span>
                        {isConversationLoading ? "Carregando conversa..." : "Ver conversa"}
                      </span>
                    </S.ReviewActionButton>
                  </S.ReviewCard>
                );
              })}
            </S.ReviewList>
          ) : null}
        </S.SectionCard>
      </S.Container>

      {conversationState.isOpen ? (
        <S.DialogOverlay onClick={closeConversation}>
          <S.Dialog onClick={(event) => event.stopPropagation()}>
            <S.DialogHeader>
              <div>
                <S.DialogTitle>
                  {conversationState.ticket?.complaintTitle?.title ||
                    conversationState.review?.subject ||
                    "Conversa do atendimento"}
                </S.DialogTitle>
                <S.DialogText>
                  Ticket {conversationState.review?.protocol || "—"} •{" "}
                  {conversationState.review
                    ? getRatingStarsLabel(conversationState.review.rating)
                    : "Sem nota"}
                </S.DialogText>
              </div>

              <S.DialogCloseButton type="button" onClick={closeConversation}>
                Fechar
              </S.DialogCloseButton>
            </S.DialogHeader>

            <S.DialogBody>
              <S.ConversationMeta>
                <S.ConversationPill>
                  <strong>Cliente</strong>
                  <span>{conversationState.review?.customerName || "Cliente"}</span>
                </S.ConversationPill>
                <S.ConversationPill>
                  <strong>Nota</strong>
                  <span>
                    {conversationState.review
                      ? `${conversationState.review.rating}/5`
                      : "—"}
                  </span>
                </S.ConversationPill>
                <S.ConversationPill>
                  <strong>Registrada em</strong>
                  <span>{formatDateTime(conversationState.review?.submittedAt)}</span>
                </S.ConversationPill>
              </S.ConversationMeta>

              {conversationState.review?.comment ? (
                <S.ConversationHighlight>
                  <strong>Comentário da avaliação</strong>
                  <p>{conversationState.review.comment}</p>
                </S.ConversationHighlight>
              ) : null}

              {conversationState.loading ? (
                <S.EmptyState>Carregando conversa...</S.EmptyState>
              ) : null}

              {!conversationState.loading && conversationState.error ? (
                <S.EmptyState>{conversationState.error}</S.EmptyState>
              ) : null}

              {!conversationState.loading &&
              !conversationState.error &&
              conversationState.messages.length === 0 ? (
                <S.EmptyState>Nenhuma mensagem registrada para este atendimento.</S.EmptyState>
              ) : null}

              {!conversationState.loading &&
              !conversationState.error &&
              conversationState.messages.length > 0 ? (
                <S.MessageList>
                  {conversationState.messages.map((message) => {
                    const messageUiMeta = getMessageUiMeta(message, {
                      viewerType: messageViewerType,
                      currentUser: userData,
                      ticketCustomer: conversationState.ticket?.customer,
                    });
                    const avatarUrl =
                      typeof messageUiMeta.avatarUrl === "string"
                        ? messageUiMeta.avatarUrl.trim()
                        : "";
                    const canShowAvatar =
                      avatarUrl && !messageAvatarErrors[message.id];

                    if (messageUiMeta.isSystem) {
                      return (
                        <S.SystemMessage key={message.id}>
                          <span>{message.content}</span>
                          <small>{formatCompactDateTime(message.createdAt)}</small>
                        </S.SystemMessage>
                      );
                    }

                    return (
                      <S.MessageRow
                        key={message.id}
                        $align={messageUiMeta.align}
                      >
                        <S.MessageCard
                          $align={messageUiMeta.align}
                          $variant={messageUiMeta.variant}
                        >
                          <S.MessageCardHeader>
                            <S.MessageIdentity>
                              <S.MessageAvatar>
                                {canShowAvatar ? (
                                  <S.MessageAvatarImage
                                    src={avatarUrl}
                                    alt=""
                                    onError={() => handleMessageAvatarError(message.id)}
                                  />
                                ) : (
                                  messageUiMeta.avatarText
                                )}
                              </S.MessageAvatar>
                              <div>
                                <S.MessageSender>
                                  {messageUiMeta.senderLabel}
                                </S.MessageSender>
                                <S.MessageTag>
                                  {messageUiMeta.tagLabel} •{" "}
                                  {getConversationChannelLabel(message)}
                                </S.MessageTag>
                              </div>
                            </S.MessageIdentity>

                            <S.MessageTime>
                              {formatCompactDateTime(message.createdAt)}
                            </S.MessageTime>
                          </S.MessageCardHeader>

                          <S.MessageContent>{message.content}</S.MessageContent>
                        </S.MessageCard>
                      </S.MessageRow>
                    );
                  })}
                </S.MessageList>
              ) : null}
            </S.DialogBody>
          </S.Dialog>
        </S.DialogOverlay>
      ) : null}
    </S.Page>
  );
}
