import styled from "styled-components";

const toneMap = {
  success: {
    text: "#166534",
    background: "#dcfce7",
    border: "#86efac",
  },
  warning: {
    text: "#9a3412",
    background: "#ffedd5",
    border: "#fdba74",
  },
  danger: {
    text: "#991b1b",
    background: "#fee2e2",
    border: "#fca5a5",
  },
  neutral: {
    text: "#475569",
    background: "#e2e8f0",
    border: "#cbd5e1",
  },
};

const resolveTone = (tone, key) => (toneMap[tone] || toneMap.neutral)[key];

const messageToneMap = {
  customer: {
    avatarText: "#ecfdf5",
    avatarBackground: "#047857",
    avatarBorder: "#065f46",
    tagText: "#166534",
    tagBackground: "#dcfce7",
    tagBorder: "#86efac",
    bubbleBackground: "#f0fdf4",
    bubbleBackgroundStrong: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
    bubbleText: "#14532d",
    bubbleTextStrong: "#ffffff",
    bubbleBorder: "#86efac",
    bubbleBorderStrong: "#059669",
  },
  support: {
    avatarText: "#eff6ff",
    avatarBackground: "#1d4ed8",
    avatarBorder: "#1e40af",
    tagText: "#1d4ed8",
    tagBackground: "#dbeafe",
    tagBorder: "#93c5fd",
    bubbleBackground: "#ffffff",
    bubbleBackgroundStrong: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
    bubbleText: "#0f172a",
    bubbleTextStrong: "#ffffff",
    bubbleBorder: "#cbd5e1",
    bubbleBorderStrong: "#334155",
  },
  bot: {
    avatarText: "#115e59",
    avatarBackground: "#ccfbf1",
    avatarBorder: "#99f6e4",
    tagText: "#0f766e",
    tagBackground: "#ccfbf1",
    tagBorder: "#99f6e4",
    bubbleBackground: "linear-gradient(180deg, #ecfeff 0%, #f0fdfa 100%)",
    bubbleBackgroundStrong: "linear-gradient(180deg, #ecfeff 0%, #f0fdfa 100%)",
    bubbleText: "#134e4a",
    bubbleTextStrong: "#134e4a",
    bubbleBorder: "#99f6e4",
    bubbleBorderStrong: "#99f6e4",
  },
  system: {
    avatarText: "#475569",
    avatarBackground: "#e2e8f0",
    avatarBorder: "#cbd5e1",
    tagText: "#475569",
    tagBackground: "#e2e8f0",
    tagBorder: "#cbd5e1",
    bubbleBackground: "#e2e8f0",
    bubbleBackgroundStrong: "#e2e8f0",
    bubbleText: "#334155",
    bubbleTextStrong: "#334155",
    bubbleBorder: "#cbd5e1",
    bubbleBorderStrong: "#cbd5e1",
  },
};

const resolveMessageTone = (variant, key) =>
  (messageToneMap[variant] || messageToneMap.support)[key];

export const Page = styled.div`
  min-height: 100vh;
  background: #f4f7f8;
  padding-top: 74px;
`;

export const Content = styled.main`
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const HeroCard = styled.section`
  background: linear-gradient(135deg, #0f766e 0%, #10b981 100%);
  border-radius: 20px;
  padding: 24px;
  color: #ffffff;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 1.8rem;
`;

export const HeroText = styled.p`
  margin: 0;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

export const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-content: flex-start;
  justify-content: flex-end;

  @media (max-width: 960px) {
    justify-content: flex-start;
  }
`;

export const HeroBadge = styled.div`
  position: relative;
  min-width: 140px;
  padding: ${({ $withAction }) => ($withAction ? "14px 56px 14px 16px" : "14px 16px")};
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);

  strong {
    display: block;
    font-size: 1.2rem;
  }

  span {
    font-size: 0.82rem;
    opacity: 0.86;
  }
`;

export const HeroBadgeActionButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 10px;
  padding: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
`;

export const HeroCtaLink = styled.a`
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.46);
    transform: translateY(-1px);
  }

  @media (max-width: 520px) {
    width: 100%;
  }
`;

export const EmployeeAiHeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const EmployeeAiEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #0d6b3c;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const EmployeeAiTitle = styled.h2`
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  line-height: 1.15;
`;

export const EmployeeAiText = styled.p`
  margin: 10px 0 0;
  max-width: 760px;
  color: #456263;
  font-size: 0.96rem;
  line-height: 1.65;
`;

export const EmployeeAiRefreshButton = styled.button`
  min-height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 11px;
  padding: 8px 12px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #10b981;
    color: #047857;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

export const EmployeeAiMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const EmployeeAiMetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(15, 46, 47, 0.06);
  color: #476365;
  font-size: 0.82rem;
  font-weight: 700;
`;

export const EmployeeAiDialog = styled.div`
  width: min(980px, 100%);
  max-height: min(82vh, 760px);
  background: #ffffff;
  border: 1px solid #dce4e8;
  border-radius: 22px;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const EmployeeAiDialogBody = styled.div`
  padding: 18px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.06), transparent 28%),
    #f8fafc;
`;

export const EmployeeAiInsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
`;

export const EmployeeAiInsightCard = styled.article`
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
`;

export const EmployeeAiInsightHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const EmployeeAiInsightTitle = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1rem;
  line-height: 1.35;
`;

export const EmployeeAiInsightText = styled.p`
  margin: 0;
  color: #4e696b;
  font-size: 0.93rem;
  line-height: 1.6;
`;

export const EmployeeAiEvidenceList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: #597577;
  font-size: 0.9rem;
  line-height: 1.6;

  li + li {
    margin-top: 6px;
  }
`;

export const EmployeeAiActionBox = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  span {
    color: #476365;
    font-size: 0.9rem;
    line-height: 1.55;
  }
`;

export const EmployeeAiEmptyState = styled.div`
  padding: 16px 18px;
  border: 1px dashed rgba(15, 46, 47, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #597577;
  font-size: 0.92rem;
  line-height: 1.55;
`;

export const EmployeeAiErrorBox = styled.div`
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #991b1b;

  strong {
    font-size: 0.92rem;
  }

  span {
    font-size: 0.88rem;
    line-height: 1.55;
  }
`;

export const Board = styled.section`
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: #ffffff;
  border: 1px solid #dce4e8;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
`;

export const Sidebar = styled(Card)`
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (min-width: 1101px) {
    position: sticky;
    top: 94px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
`;

export const SectionText = styled.p`
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.5;
`;

export const FilterAnchor = styled.div`
  position: relative;
  display: grid;
  gap: 6px;
`;

export const TicketFilterHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
`;

export const SearchInput = styled.input`
  width: 100%;
  border: 1px solid #d4dce2;
  border-radius: 12px;
  padding: 9px 12px;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }
`;

export const FilterToggleButton = styled.button`
  min-height: 38px;
  border: 1px solid ${({ $active }) => ($active ? "#10b981" : "#d4dce2")};
  border-radius: 12px;
  padding: 0 12px;
  background: ${({ $active }) => ($active ? "#ecfdf5" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#047857" : "#334155")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover {
    border-color: #10b981;
    color: #047857;
  }

  @media (max-width: 420px) {
    span {
      display: none;
    }
  }
`;

export const FilterPanel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 50;
  display: grid;
  gap: 10px;
  max-height: min(62vh, 460px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #dce4e8;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.18);
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

export const FilterField = styled.label`
  display: grid;
  gap: 4px;
`;

export const FilterLabel = styled.span`
  color: #475569;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const FilterSelect = styled.select`
  width: 100%;
  min-height: 36px;
  border: 1px solid #d4dce2;
  border-radius: 10px;
  padding: 7px 9px;
  background: #ffffff;
  color: #0f172a;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }
`;

export const FilterInput = styled.input`
  width: 100%;
  min-height: 36px;
  border: 1px solid #d4dce2;
  border-radius: 10px;
  padding: 7px 9px;
  background: #ffffff;
  color: #0f172a;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }
`;

export const RedirectCombobox = styled.div`
  display: grid;
  gap: 8px;
`;

export const RedirectOptionList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
  padding-top: 2px;
`;

export const RedirectOptionButton = styled.button`
  width: 100%;
  display: grid;
  gap: 4px;
  padding: 11px 12px;
  border: 1px solid ${({ $active }) => ($active ? "#10b981" : "#dce4e8")};
  border-radius: 12px;
  background: ${({ $active }) => ($active ? "#ecfdf5" : "#ffffff")};
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;

  strong {
    color: #0f172a;
    font-size: 0.92rem;
    line-height: 1.35;
  }

  &:hover {
    border-color: #10b981;
    transform: translateY(-1px);
  }
`;

export const RedirectOptionMeta = styled.span`
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
`;

export const RedirectOptionEmpty = styled.div`
  padding: 14px 12px;
  border: 1px dashed #dce4e8;
  border-radius: 12px;
  background: #ffffff;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.5;
`;

export const FilterFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const FilterResultCount = styled.span`
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
`;

export const ClearFiltersButton = styled.button`
  min-height: 34px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 7px 10px;
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover {
    border-color: #10b981;
    color: #047857;
  }
`;

export const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 72vh;
  overflow-y: auto;
  padding: 2px;
`;

export const TicketButton = styled.button`
  width: 100%;
  border: 1px solid ${({ $active }) => ($active ? "#10b981" : "#dce4e8")};
  background: ${({ $active }) => ($active ? "#ecfdf5" : "#ffffff")};
  border-radius: 14px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    border-color: #10b981;
    transform: translateY(-1px);
  }
`;

export const TicketRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
`;

export const TicketName = styled.strong`
  display: block;
  color: #0f172a;
  margin-bottom: 6px;
`;

export const TicketSmall = styled.span`
  display: block;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
`;

export const TicketAssigneeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  min-width: 0;
`;

export const TicketAssigneeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: #047857;
  background: #dcfce7;
  border: 1px solid #86efac;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.02em;
`;

export const TicketAssigneeAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const TicketAssigneeText = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;

  strong {
    color: #475569;
    font-weight: 700;
  }
`;

export const TicketPaginationBar = styled.div`
  display: grid;
  gap: 10px;
  padding-top: 6px;
`;

export const TicketPaginationSummary = styled.span`
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
`;

export const TicketPaginationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const TicketPageSizeLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
`;

export const TicketPageSizeSelect = styled.select`
  min-height: 34px;
  border: 1px solid #d4dce2;
  border-radius: 10px;
  padding: 6px 8px;
  background: #ffffff;
  color: #0f172a;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }
`;

export const TicketPaginationActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const TicketPaginationButton = styled.button`
  min-height: 34px;
  border: 1px solid #d4dce2;
  border-radius: 10px;
  padding: 7px 10px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #10b981;
    color: #047857;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const TicketPageIndicator = styled.span`
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
`;

export const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $tone }) => resolveTone($tone, "text")};
  background: ${({ $tone }) => resolveTone($tone, "background")};
  border: 1px solid ${({ $tone }) => resolveTone($tone, "border")};
  white-space: nowrap;
`;

export const StatusHelperTooltip = styled.span`
  position: absolute;
  left: 0;
  top: calc(100% + 10px);
  z-index: 40;
  width: min(330px, calc(100vw - 48px));
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
  color: #334155;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-4px);
  transition: 0.16s ease;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 18px;
    width: 10px;
    height: 10px;
    background: #ffffff;
    border-left: 1px solid #cbd5e1;
    border-top: 1px solid #cbd5e1;
    transform: rotate(45deg);
  }
`;

export const StatusHelper = styled.span`
  position: relative;
  display: inline-flex;
  width: fit-content;
  cursor: help;

  &:focus {
    outline: 3px solid rgba(16, 185, 129, 0.18);
    outline-offset: 3px;
    border-radius: 999px;
  }

  &:hover ${StatusHelperTooltip},
  &:focus ${StatusHelperTooltip},
  &:focus-within ${StatusHelperTooltip} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const StatusHelperTitle = styled.strong`
  display: block;
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 0.82rem;
`;

export const StatusHelperList = styled.span`
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.45;

  span {
    display: block;
  }
`;

export const Main = styled(Card)`
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

export const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

export const TicketHeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
`;

export const ActionButton = styled.button`
  border: 1px solid ${({ $secondary }) => ($secondary ? "#cbd5e1" : "#10b981")};
  background: ${({ $secondary }) => ($secondary ? "#ffffff" : "#10b981")};
  color: ${({ $secondary }) => ($secondary ? "#334155" : "#ffffff")};
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.92;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

export const MetaItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
`;

export const MetaLabel = styled.span`
  display: block;
  color: #64748b;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

export const MetaValue = styled.strong`
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.45;
`;

export const InlineSelect = styled.select`
  min-width: 220px;
  border: 1px solid #d4dce2;
  border-radius: 12px;
  padding: 10px 12px;
  background: #ffffff;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }
`;

export const ChatShell = styled.div`
  border: 1px solid #dce4e8;
  border-radius: 18px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  height: clamp(320px, 56vh, 640px);
  max-height: calc(100vh - 160px);
`;

export const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overscroll-behavior: contain;
  overflow-anchor: none;
  scrollbar-gutter: stable;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 24%),
    #f8fafc;
`;

export const MessageRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  justify-content: ${({ $align }) => {
    if ($align === "right") return "flex-start";
    if ($align === "center") return "center";
    return "flex-start";
  }};
  flex-direction: ${({ $align }) => {
    if ($align === "right") return "row-reverse";
    if ($align === "center") return "column";
    return "row";
  }};
`;

export const MessageAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${({ $variant }) => resolveMessageTone($variant, "avatarText")};
  background: ${({ $variant }) =>
    resolveMessageTone($variant, "avatarBackground")};
  border: 1px solid
    ${({ $variant }) => resolveMessageTone($variant, "avatarBorder")};
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
`;

export const MessageAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  display: block;
`;

export const SystemMessage = styled.div`
  max-width: min(92%, 560px);
  padding: 10px 16px;
  border-radius: 18px;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  color: #475569;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  gap: 4px;
  text-align: center;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
`;

export const SystemMessageText = styled.div`
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.45;
`;

export const SystemMessageTime = styled.div`
  font-size: 0.75rem;
  opacity: 0.82;
`;

export const MessageBubble = styled.div`
  max-width: ${({ $align }) =>
    $align === "center" ? "min(92%, 560px)" : "min(78%, 720px)"};
  padding: 14px 16px;
  border-radius: ${({ $align }) => {
    if ($align === "center") return "18px";
    if ($align === "right") return "22px 22px 8px 22px";
    return "22px 22px 22px 8px";
  }};
  background: ${({ $variant, $align }) =>
    $align === "right"
      ? resolveMessageTone($variant, "bubbleBackgroundStrong")
      : resolveMessageTone($variant, "bubbleBackground")};
  color: ${({ $variant, $align }) =>
    $align === "right"
      ? resolveMessageTone($variant, "bubbleTextStrong")
      : resolveMessageTone($variant, "bubbleText")};
  border: 1px solid
    ${({ $variant, $align }) =>
      $align === "right"
        ? resolveMessageTone($variant, "bubbleBorderStrong")
        : resolveMessageTone($variant, "bubbleBorder")};
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.07);
`;

export const MessageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

export const MessageSender = styled.div`
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
`;

export const MessageTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: ${({ $variant }) => resolveMessageTone($variant, "tagText")};
  background: ${({ $variant }) => resolveMessageTone($variant, "tagBackground")};
  border: 1px solid
    ${({ $variant }) => resolveMessageTone($variant, "tagBorder")};
`;

export const MessageContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.65;
  word-break: break-word;
  font-size: 0.98rem;
`;

export const MessagePlaceholder = styled.div`
  font-size: 0.92rem;
  font-style: italic;
  opacity: 0.86;
`;

export const MessageTime = styled.div`
  margin-top: 10px;
  font-size: 0.74rem;
  opacity: 0.72;
  text-align: ${({ $align }) => {
    if ($align === "right") return "right";
    if ($align === "center") return "center";
    return "left";
  }};
`;

export const Composer = styled.form`
  display: flex;
  gap: 10px;
  padding: 14px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

export const Textarea = styled.textarea`
  flex: 1;
  min-height: 56px;
  max-height: 160px;
  resize: vertical;
  border: 1px solid #d4dce2;
  border-radius: 12px;
  padding: 12px;
  outline: none;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #64748b;
  line-height: 1.6;
  padding: 20px;
`;

export const LogsSection = styled(Card)`
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: ${({ $stretch }) => ($stretch ? "none" : "360px")};
  overflow-y: ${({ $stretch }) => ($stretch ? "visible" : "auto")};
`;

export const LogItem = styled.div`
  width: 100%;
  border: 1px solid #dce4e8;
  border-radius: 14px;
  padding: 13px 14px;
  text-align: left;
  background: #ffffff;
`;

export const LogTitle = styled.strong`
  display: block;
  color: #0f172a;
  margin-bottom: 6px;
`;

export const LogText = styled.span`
  display: block;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.5;
`;

export const HistoryDialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.58);

  @media (max-width: 760px) {
    padding: 14px;
    align-items: flex-end;
  }
`;

export const HistoryDialog = styled.div`
  width: min(760px, 100%);
  max-height: min(80vh, 720px);
  background: #ffffff;
  border: 1px solid #dce4e8;
  border-radius: 22px;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const HistoryDialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 18px;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

export const HistoryDialogTitle = styled.h2`
  margin: 0;
  color: #0f172a;
  font-size: 1.1rem;
`;

export const HistoryDialogText = styled.p`
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.5;
`;

export const HistoryDialogBody = styled.div`
  padding: 18px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.06), transparent 28%),
    #f8fafc;
`;

export const TicketDetailsBody = styled.div`
  padding: 18px 20px 20px;
  overflow-y: auto;
  background: #f8fafc;
`;

export const TicketDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const TicketDetailItem = styled.div`
  min-width: 0;
  border: 1px solid #dce4e8;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
`;

export const TicketDetailBlock = styled(TicketDetailItem)`
  grid-column: 1 / -1;
`;

export const TicketDetailLabel = styled.span`
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const TicketDetailValue = styled.strong`
  display: block;
  color: #0f172a;
  font-size: 0.94rem;
  line-height: 1.45;
  word-break: break-word;
`;

export const TicketDetailText = styled.p`
  margin: 0;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const EvaluationPrompt = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #fcd34d;
  background:
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.22), transparent 34%),
    linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
`;

export const EvaluationPromptContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 620px;
`;

export const EvaluationPromptTitle = styled.strong`
  color: #92400e;
  font-size: 0.96rem;
`;

export const EvaluationPromptText = styled.p`
  margin: 0;
  color: #92400e;
  line-height: 1.55;
`;

export const EvaluationDialogBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background:
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.16), transparent 30%),
    #fffdf7;
`;

export const EvaluationStars = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const EvaluationStarButton = styled.button`
  min-width: 52px;
  border: 1px solid ${({ $active }) => ($active ? "#f59e0b" : "#d6dce5")};
  background: ${({ $active }) => ($active ? "#fef3c7" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#92400e" : "#475569")};
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: #f59e0b;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const EvaluationHint = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
`;

export const EvaluationTextarea = styled.textarea`
  width: 100%;
  min-height: 108px;
  resize: vertical;
  border: 1px solid #d4dce2;
  border-radius: 14px;
  padding: 12px 14px;
  outline: none;
  background: #ffffff;

  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
  }

  &:disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }
`;

export const EvaluationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;
