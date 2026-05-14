import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;
  background: radial-gradient(920px 420px at 8% 4%, #dff7ec 0%, transparent 58%),
    linear-gradient(165deg, #f5fbf8 0%, #eef5f2 100%);
  padding-top: 90px;
`;

export const Container = styled.main`
  width: min(860px, 94%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
  padding-bottom: 40px;
`;

/* ── Hero ── */

export const HeroSection = styled.section`
  display: grid;
  gap: 14px;
  padding: 32px;
  border-radius: 22px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 251, 246, 0.98) 100%);
  box-shadow: 0 16px 34px rgba(15, 46, 47, 0.08);
  text-align: center;
  justify-items: center;
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(13, 107, 60, 0.14);
  background: linear-gradient(135deg, rgba(226, 250, 236, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  color: #0d6b3c;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 10px 24px rgba(13, 107, 60, 0.08);
  backdrop-filter: blur(10px);
`;

export const EyebrowDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(circle at 30% 30%, #77f2af 0%, #18bf6f 55%, #0d6b3c 100%);
  box-shadow: 0 0 0 4px rgba(13, 107, 60, 0.12);
`;

export const WelcomeTitle = styled.h1`
  margin: 0;
  color: #123134;
  font-size: clamp(1.9rem, 3vw, 2.65rem);
  line-height: 1.12;

  span {
    color: #0d6b3c;
  }
`;

export const JobTitle = styled.p`
  margin: 0;
  color: #7a9a9b;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const WelcomeSubtitle = styled.p`
  margin: 0;
  max-width: 520px;
  color: #456263;
  font-size: 1rem;
  line-height: 1.65;
`;

export const ActionsGrid = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 6px;
  justify-content: center;
`;

export const ActionCard = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 22px 28px;
  min-width: 180px;
  border-radius: 18px;
  border: 1px solid ${({ $secondary }) =>
    $secondary ? "rgba(15, 46, 47, 0.14)" : "rgba(13, 107, 60, 0.18)"};
  background: ${({ $secondary }) =>
    $secondary
      ? "linear-gradient(145deg, #1d474a 0%, #123134 100%)"
      : "linear-gradient(145deg, #18bf6f 0%, #0d9e5a 100%)"};
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  box-shadow: ${({ $secondary }) =>
    $secondary
      ? "0 8px 24px rgba(18, 49, 52, 0.22)"
      : "0 8px 24px rgba(13, 107, 60, 0.28)"};
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ $secondary }) =>
      $secondary
        ? "0 14px 32px rgba(18, 49, 52, 0.32)"
        : "0 14px 32px rgba(13, 107, 60, 0.36)"};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export const ActionIcon = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.92;

  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
`;

/* ── Métricas ── */

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  display: grid;
  gap: 6px;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: ${({ $highlight }) =>
    $highlight
      ? "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,248,235,0.98) 100%)"
      : "rgba(255, 255, 255, 0.96)"};
  box-shadow: 0 10px 24px rgba(15, 46, 47, 0.06);
  text-align: center;
`;

export const MetricValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: ${({ $accent, $warn }) =>
    $warn ? "#b45309" : $accent ? "#0d6b3c" : "#123134"};
`;

export const MetricLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: #7a9a9b;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

/* ── Seção ── */

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: #123134;
  font-size: 1.35rem;
`;

export const SectionText = styled.p`
  margin: 8px 0 0;
  color: #537071;
  line-height: 1.55;
`;

/* ── Lista de tickets ── */

export const TicketList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
`;

export const TicketCard = styled.a`
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(15, 46, 47, 0.06);
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(15, 46, 47, 0.1);
  }
`;

export const TicketCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const TicketId = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: #7a9a9b;
  letter-spacing: 0.04em;
`;

const STATUS_COLORS = {
  open: { bg: "rgba(13, 107, 60, 0.1)", color: "#0d6b3c" },
  active: { bg: "rgba(13, 100, 180, 0.1)", color: "#0d5cbf" },
  pending: { bg: "rgba(180, 83, 9, 0.1)", color: "#b45309" },
  resolved: { bg: "rgba(15, 46, 47, 0.08)", color: "#456263" },
  closed: { bg: "rgba(15, 46, 47, 0.06)", color: "#7a9a9b" },
};

export const StatusBadge = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: ${({ $variant }) => STATUS_COLORS[$variant]?.bg || STATUS_COLORS.open.bg};
  color: ${({ $variant }) => STATUS_COLORS[$variant]?.color || STATUS_COLORS.open.color};
`;

export const TicketDescription = styled.p`
  margin: 0;
  color: #123134;
  font-size: 0.92rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const TicketMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

export const TicketTag = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #0d6b3c;
  background: rgba(13, 107, 60, 0.08);
  padding: 2px 8px;
  border-radius: 999px;
`;

export const TicketTime = styled.span`
  font-size: 0.75rem;
  color: #7a9a9b;
  font-weight: 500;
`;

export const EmptyState = styled.p`
  margin: 0;
  color: #7a9a9b;
  font-size: 0.95rem;
`;
