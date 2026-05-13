import { api } from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) throw new Error("Token nao encontrado");

  return { Authorization: `Bearer ${token}` };
};

const parseSseEvent = (rawEventBlock) => {
  const lines = rawEventBlock.split("\n");
  let eventName = "message";
  let dataPayload = "";

  lines.forEach((line) => {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
      return;
    }

    if (line.startsWith("data:")) {
      dataPayload += line.slice(5).trim();
    }
  });

  if (!dataPayload) return { eventName, data: null };

  try {
    return { eventName, data: JSON.parse(dataPayload) };
  } catch {
    return { eventName, data: null };
  }
};

export const ticketService = {
  create: async (ticketData) => {
    const response = await api.post("/tickets/create", ticketData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getCompanies: async () => {
    const response = await api.get("/tickets/companies", {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getComplaintTitles: async (companyId) => {
    const response = await api.get(`/tickets/complaint-titles/${companyId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUserTickets: async () => {
    const response = await api.get("/tickets/my-tickets", {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUserClosedTickets: async ({ page, pageSize } = {}) => {
    const response = await api.get("/tickets/user-closed-tickets", {
      headers: getAuthHeader(),
      params: {
        ...(page ? { page } : {}),
        ...(pageSize ? { pageSize } : {}),
      },
    });
    return response.data;
  },

  getUserOpenAndPendingTickets: async ({ page, pageSize } = {}) => {
    const response = await api.get("/tickets/user-open-pending-tickets", {
      headers: getAuthHeader(),
      params: {
        ...(page ? { page } : {}),
        ...(pageSize ? { pageSize } : {}),
      },
    });
    return response.data;
  },

  getRecentUpdates: async () => {
    const response = await api.get("/tickets/recent-updates", {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getWorkspace: async ({ scope = "active" } = {}) => {
    const response = await api.get("/tickets/workspace", {
      headers: getAuthHeader(),
      params: { scope },
    });
    return response.data;
  },

  getUnreadMessageNotifications: async () => {
    const response = await api.get("/tickets/message-notifications", {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getTicketDetail: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/detail`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getTicketMessages: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/messages`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  markMessagesAsRead: async (ticketId) => {
    const response = await api.post(
      `/tickets/${ticketId}/messages/read`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  sendMessage: async (ticketId, content) => {
    const response = await api.post(
      `/tickets/${ticketId}/messages`,
      { content },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  acceptTicket: async (ticketId, assignedUserId = null) => {
    const response = await api.post(
      `/tickets/${ticketId}/accept`,
      { assignedUserId },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  updateStatus: async (ticketId, status) => {
    const response = await api.patch(
      `/tickets/${ticketId}/status`,
      { status },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  submitEvaluation: async (ticketId, { rating, comment = "" }) => {
    const response = await api.post(
      `/tickets/${ticketId}/evaluation`,
      { rating, comment },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  updateAssignment: async (ticketId, assignedUserId) => {
    const response = await api.patch(
      `/tickets/${ticketId}/assignment`,
      { assignedUserId },
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getTicketLogs: async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/logs`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getCompanyLogs: async () => {
    const response = await api.get("/tickets/company-logs", {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  streamTicketEvents: async ({
    ticketId,
    signal,
    onTicketSnapshot = () => { },
    onTicketUpdated = () => { },
    onStatusChanged = () => { },
    onMessageCreated = () => { },
    onLogCreated = () => { },
    onError = () => { },
  }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuario nao autenticado.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/tickets/${ticketId}/events/stream`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }
    );

    if (!response.ok) {
      throw new Error("Nao foi possivel conectar ao stream do ticket.");
    }

    if (!response.body) {
      throw new Error("Seu navegador nao suporta stream de eventos.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let blockEndIndex = buffer.indexOf("\n\n");

      while (blockEndIndex !== -1) {
        const rawEvent = buffer.slice(0, blockEndIndex).trim();
        buffer = buffer.slice(blockEndIndex + 2);
        blockEndIndex = buffer.indexOf("\n\n");

        if (!rawEvent) continue;

        const { eventName, data } = parseSseEvent(rawEvent);

        if (eventName === "ticket_snapshot" && data) onTicketSnapshot(data);
        if (eventName === "ticket_updated" && data) onTicketUpdated(data);
        if (eventName === "status_changed" && data) onStatusChanged(data);
        if (eventName === "message_created" && data) onMessageCreated(data);
        if (eventName === "log_created" && data) onLogCreated(data);

        if (eventName === "error") {
          onError(data);
          throw new Error(data?.message || "Erro ao processar eventos do ticket.");
        }
      }
    }
  },
};

export default ticketService;
