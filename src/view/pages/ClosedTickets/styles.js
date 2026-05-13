import styled from "styled-components";

const statusStyles = {
  aberto: {
    color: "#f59e0b",
    background: "#fef3c7",
    border: "#f59e0b",
  },
  pendente: {
    color: "#ef4444",
    background: "#fee2e2",
    border: "#ef4444",
  },
  fechado: {
    color: "#6b7280",
    background: "#f3f4f6",
    border: "#6b7280",
  },
  finalizado: {
    color: "#6b7280",
    background: "#f3f4f6",
    border: "#6b7280",
  },
  resolvido: {
    color: "#10b981",
    background: "#d1fae5",
    border: "#10b981",
  },
  default: {
    color: "#6b7280",
    background: "#f3f4f6",
    border: "#6b7280",
  },
};

const getStatusStyle = ($status, prop) =>
  (statusStyles[$status] || statusStyles.default)[prop];

export const Container = styled.div`
  margin-top: 60px;
  width: 100%;
  min-height: 100vh;
  background-color: #f4f7f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 18px 64px;
`;

export const Loading = styled.div`
  margin-top: 120px;
  font-size: 18px;
  color: #555;
`;

export const Header = styled.div`
  width: min(1180px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 18px 0 22px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const PageTitle = styled.h1`
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: 0.92rem;
  color: #64748b;
  margin: 6px 0 0;
  line-height: 1.5;
`;

export const HeaderCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid #d7e0e6;
  border-radius: 999px;
  background: #ffffff;
  color: #334155;
  font-size: 0.84rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  margin-top: 50px;
  font-size: 16px;
  color: #777;
  text-align: center;
`;

export const ListToolbar = styled.div`
  width: min(1180px, 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const PageSizeControl = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.86rem;
  font-weight: 700;
`;

export const PageSizeSelect = styled.select`
  min-height: 34px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 30px 6px 10px;
  background: #ffffff;
  color: #334155;
  font-weight: 700;
  outline: none;

  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  }
`;

export const PageRange = styled.span`
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 600;
`;

export const TicketsList = styled.div`
  width: min(1180px, 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const PaginationBar = styled.div`
  width: min(1180px, 100%);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;

  @media (max-width: 520px) {
    justify-content: stretch;
  }
`;

export const PaginationButton = styled.button`
  min-height: 34px;
  min-width: ${({ $icon }) => ($icon ? "38px" : "auto")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: ${({ $icon }) => ($icon ? "7px 10px" : "7px 12px")};
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: ${({ $icon }) => ($icon ? "1.05rem" : "0.84rem")};
  font-weight: 700;
  line-height: 1;
  transition: all 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.2;
  }

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 520px) {
    flex: 1;
  }
`;

export const PageIndicator = styled.span`
  color: #475569;
  font-size: 0.86rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const TicketCard = styled.div`
  background: #fff;
  border: 1px solid #dce4e8;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c7d3da;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.07);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const TicketMain = styled.div`
  min-width: 0;
  display: grid;
  gap: 8px;
`;

export const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const TicketInfo = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

export const TicketActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 860px) {
    justify-content: flex-start;
  }

  @media (max-width: 520px) {
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

export const TicketTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

export const TicketStatus = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $status }) => getStatusStyle($status, "color")};
  background-color: ${({ $status }) => getStatusStyle($status, "background")};
  border: 1px solid ${({ $status }) => getStatusStyle($status, "border")};
  padding: 3px 9px;
  border-radius: 999px;
`;

export const TicketSubject = styled.strong`
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.35;
`;

export const TicketDescription = styled.p`
  max-width: 760px;
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const TicketMetaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
`;

export const TicketMetaItem = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-width: 160px;
`;

export const MetaLabel = styled.span`
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
`;

export const MetaValue = styled.span`
  color: #334155;
  font-size: 0.86rem;
  font-weight: 600;
`;

const actionButtonStyles = `
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.55;
    cursor: wait;
    transform: none;
  }
`;

export const VerDetalhesButton = styled.button`
  ${actionButtonStyles}
`;

export const ReopenButton = styled.button`
  ${actionButtonStyles}
  border-color: #9fb4cf;
  color: #1d4f86;
  background: #f8fbff;

  &:hover:not(:disabled) {
    border-color: #6d91bc;
    background: #eef6ff;
  }
`;

export const ChatHistoryButton = styled.button`
  ${actionButtonStyles}
`;

export const TicketProtocol = styled.p`
  margin: 8px 0 4px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

export const TicketDate = styled.p`
  margin: 0;
  font-size: 13px;
  color: #888;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #fff;
  padding: 30px 25px;
  border-radius: 14px;
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.25s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ChatModalContent = styled(ModalContent)`
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  color: #222;
  font-weight: 600;
  text-align: center;
`;

export const ChatModalSubtitle = styled.p`
  margin: -10px 0 4px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
`;

export const ModalInfo = styled.p`
  font-size: 15px;
  margin: 12px 0;
  color: #444;
  line-height: 1.5;

  strong {
    color: #222;
    font-weight: 600;
  }
`;

export const DescriptionBox = styled.div`
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

export const ChatEmptyState = styled.div`
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #666;
  text-align: center;
  line-height: 1.5;
`;

export const ChatMessageList = styled.div`
  display: grid;
  gap: 12px;
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 4px;
`;

export const ChatMessageCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid
    ${({ $system }) => ($system ? "#d1d5db" : "#bbf7d0")};
  background: ${({ $system }) => ($system ? "#f3f4f6" : "#f0fdf4")};
`;

export const ChatMessageTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ChatMessageAuthor = styled.strong`
  color: #1f2937;
  font-size: 14px;
`;

export const ChatMessageBadge = styled.span`
  padding: 4px 9px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
`;

export const ChatMessageContent = styled.p`
  margin: 0;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const ChatMessageTime = styled.span`
  color: #6b7280;
  font-size: 12px;
`;

export const ModalStatus = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $status }) => getStatusStyle($status, "color")};
  background-color: ${({ $status }) => getStatusStyle($status, "background")};
  border: 1px solid ${({ $status }) => getStatusStyle($status, "border")};
  padding: 4px 10px;
  border-radius: 20px;
  margin-left: 8px;
`;

export const ModalActions = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 12px;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  background-color: #eef2f7;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #e1e7ef;
  }
`;

export const CloseButton = styled.button`
  width: 100%;
  background-color: #f8fbff;
  color: #1d4f86;
  border: 1px solid #9fb4cf;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #eef6ff;
    border-color: #6d91bc;
  }

  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`;
