import { api } from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
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

export const chatbotService = {
  getConversation: async ({ ticketId } = {}) => {
    const headers = getAuthHeader();
    const params = ticketId ? { ticketId } : undefined;
    const response = await api.get("/chatbot/conversation", { headers, params });
    return response.data;
  },

  streamMessage: async ({
    message,
    conversationId = null,
    ticketId = null,
    signal,
    onStart = () => { },
    onToken = () => { },
    onDone = () => { },
    onError = () => { },
  }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Usuario nao autenticado.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chatbot/message/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message, conversationId, ticketId }),
        signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erro ao iniciar stream.");
    }

    if (!response.body) {
      throw new Error("Navegador nao suporta stream de resposta.");
    }

    const streamReader = response.body.getReader();
    const streamDecoder = new TextDecoder("utf-8");
    let streamBuffer = "";

    while (true) {
      const { done, value } = await streamReader.read();

      if (done) break;

      streamBuffer += streamDecoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let blockEndIndex = streamBuffer.indexOf("\n\n");

      while (blockEndIndex !== -1) {
        const rawEvent = streamBuffer.slice(0, blockEndIndex).trim();
        streamBuffer = streamBuffer.slice(blockEndIndex + 2);
        blockEndIndex = streamBuffer.indexOf("\n\n");

        if (!rawEvent) continue;

        const { eventName, data } = parseSseEvent(rawEvent);

        if (eventName === "start" && data) onStart(data);
        if (eventName === "token" && data?.token) onToken(data.token);
        if (eventName === "done" && data) onDone(data);

        if (eventName === "error") {
          const streamError = data?.message || "Erro ao processar a resposta da IA.";
          onError(streamError);
          throw new Error(streamError);
        }
      }
    }
  },
};

export default chatbotService;
