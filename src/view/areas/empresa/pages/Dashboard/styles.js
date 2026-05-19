import styled, { css, keyframes } from "styled-components";

const typingCursorBlink = keyframes`
  0%,
  45% {
    opacity: 1;
  }

  55%,
  100% {
    opacity: 0;
  }
`;

const getToneColor = (tone) => {
  switch (tone) {
    case "success":
      return "#0d9f5d";
    case "warning":
      return "#d97706";
    case "danger":
      return "#dc2626";
    default:
      return "#4b6870";
  }
};

const getToneBackground = (tone) => {
  switch (tone) {
    case "success":
      return "rgba(13, 159, 93, 0.16)";
    case "warning":
      return "rgba(217, 119, 6, 0.16)";
    case "danger":
      return "rgba(220, 38, 38, 0.16)";
    default:
      return "rgba(75, 104, 112, 0.14)";
  }
};

const getStatusBadge = (tone) => css`
  color: ${getToneColor(tone)};
  background: ${getToneBackground(tone)};
`;

export const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(900px 460px at 0% 0%, rgba(176, 242, 211, 0.42) 0%, transparent 58%),
    radial-gradient(760px 420px at 100% 12%, rgba(201, 232, 255, 0.28) 0%, transparent 56%),
    linear-gradient(180deg, #f6fbf9 0%, #edf4f1 100%);
  padding-top: 90px;
`;

export const Container = styled.main`
  width: min(1180px, 94%);
  margin: 0 auto;
  display: grid;
  gap: 20px;
  padding-bottom: 36px;
`;

export const HeroSection = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroCard = styled.article`
  display: grid;
  gap: 16px;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 251, 246, 0.98) 100%);
  box-shadow: 0 18px 42px rgba(15, 46, 47, 0.08);
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(13, 107, 60, 0.14);
  background: rgba(226, 250, 236, 0.92);
  color: #0d6b3c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const EyebrowDot = styled.span`
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #d8ffea 0%, #9bf1c5 58%, #54cb8f 100%);
  box-shadow: 0 0 0 4px rgba(13, 107, 60, 0.12);

  svg {
    color: #0d6b3c;
  }
`;

export const Title = styled.h1`
  margin: 0;
  color: #123134;
  font-size: clamp(2rem, 3vw, 2.75rem);
  line-height: 1.08;
`;

export const Description = styled.p`
  margin: 0;
  max-width: 720px;
  color: #496669;
  line-height: 1.7;
`;

export const HeroStats = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HeroStat = styled.div`
  min-width: 160px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 1.25rem;
  }

  span {
    color: #557273;
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

export const HeroStatIcon = styled.span`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #0d6b3c;
  background: rgba(13, 159, 93, 0.14);
  box-shadow: inset 0 0 0 1px rgba(13, 107, 60, 0.1);
  flex-shrink: 0;
`;

export const HeroStatContent = styled.div`
  display: grid;
  gap: 4px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 6px;
`;

export const OverviewCard = styled.aside`
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #123134 0%, #1b4a4c 100%);
  color: #effbf6;
  box-shadow: 0 18px 38px rgba(18, 49, 52, 0.18);
`;

export const OverviewLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  color: rgba(237, 255, 247, 0.72);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  svg {
    color: #8af2be;
  }
`;

export const OverviewTitle = styled.h2`
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.2;
`;

export const AlertList = styled.div`
  display: grid;
  gap: 14px;
`;

export const AlertItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
`;

export const AlertMarker = styled.span`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: ${({ $tone }) => getToneColor($tone)};
  background: ${({ $tone }) => getToneBackground($tone)};
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
`;

export const AlertLabel = styled.h3`
  margin: 0;
  color: #f5fffb;
  font-size: 1rem;
  line-height: 1.35;
`;

export const AlertText = styled.p`
  margin: 4px 0 0;
  color: rgba(237, 255, 247, 0.78);
  line-height: 1.6;
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
`;

export const MetricCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 26px rgba(15, 46, 47, 0.06);
`;

export const MetricCardHeader = styled.div`
  min-height: auto;
`;

export const MetricLabel = styled.span`
  display: block;
  max-width: 100%;
  min-width: 0;
  color: #5b7779;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.15;
  overflow-wrap: anywhere;
  text-transform: uppercase;
`;

export const MetricValue = styled.strong`
  color: #123134;
  font-size: clamp(1.8rem, 2.5vw, 2.3rem);
  line-height: 1;
`;

export const MetricHelper = styled.p`
  margin: 0;
  color: #5e787b;
  font-size: 0.94rem;
  line-height: 1.55;
`;

export const InsightsGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 32px rgba(15, 46, 47, 0.06);
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const DialogHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PanelActionButton = styled.button`
  border: 1px solid rgba(13, 107, 60, 0.16);
  background: rgba(226, 250, 236, 0.9);
  color: #0d6b3c;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(13, 107, 60, 0.24);
    box-shadow: 0 12px 22px rgba(13, 107, 60, 0.12);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
    transform: none;
    box-shadow: none;
  }
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: #123134;
  font-size: 1.24rem;
`;

export const PanelText = styled.p`
  margin: 6px 0 0;
  color: #577376;
  line-height: 1.55;
`;

export const AiGenerateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(13, 107, 60, 0.16);
  border-radius: 999px;
  background: rgba(226, 250, 236, 0.9);
  color: #0d6b3c;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(13, 107, 60, 0.24);
    box-shadow: 0 12px 22px rgba(13, 107, 60, 0.12);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
    transform: none;
    box-shadow: none;
  }
`;

export const AiGenerateIcon = styled.span`
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const AiSummaryCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  background: linear-gradient(
    145deg,
    rgba(240, 251, 246, 0.96) 0%,
    rgba(255, 255, 255, 0.98) 100%
  );
`;

export const AiSummaryLabel = styled.span`
  color: #0d6b3c;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const AiSummaryTitle = styled.h3`
  margin: 8px 0 0;
  color: #123134;
  font-size: 1.3rem;
  line-height: 1.3;
`;

export const AiSummaryText = styled.p`
  margin: 10px 0 0;
  color: #4f6c6f;
  line-height: 1.65;
  white-space: pre-wrap;
`;

export const AiSummaryMeta = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(18, 49, 52, 0.06);
    color: #547173;
    font-size: 0.82rem;
    font-weight: 600;
    white-space: nowrap;
  }
`;

export const AiRefreshNote = styled.p`
  margin: 0;
  color: #5b777a;
  font-size: 0.88rem;
  font-weight: 600;
`;

export const AiInsightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
`;

export const AiInsightCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  background: rgba(255, 255, 255, 0.96);
`;

export const AiInsightHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
`;

export const AiInsightTitle = styled.h3`
  margin: 8px 0 0;
  color: #123134;
  font-size: 1.02rem;
  line-height: 1.4;
`;

export const AiInsightText = styled.p`
  margin: 0;
  color: #4e6b6e;
  line-height: 1.65;
  white-space: pre-wrap;
`;

export const AiEvidenceList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: #4f6c6f;

  li {
    line-height: 1.55;
    white-space: pre-wrap;
  }
`;

export const AiActionBox = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 0.84rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  span {
    color: #547174;
    line-height: 1.55;
    white-space: pre-wrap;
  }
`;

export const AiTypingCursor = styled.span`
  display: inline-block;
  width: 0.62ch;
  height: 1em;
  margin-left: 2px;
  border-radius: 999px;
  background: currentColor;
  vertical-align: -0.12em;
  animation: ${typingCursorBlink} 1s ease-in-out infinite;
`;

export const VolumeChart = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
  min-height: 250px;
  align-items: end;
`;

export const VolumeColumn = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  height: 100%;
`;

export const VolumeCount = styled.span`
  color: #123134;
  font-weight: 700;
  font-size: 0.94rem;
`;

export const VolumeBarTrack = styled.div`
  width: 100%;
  height: 180px;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 8px 0;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(13, 107, 60, 0.05) 0%, rgba(13, 107, 60, 0.12) 100%);
`;

export const VolumeBarFill = styled.div`
  width: min(38px, 78%);
  border-radius: 14px 14px 10px 10px;
  background: linear-gradient(180deg, #43d48b 0%, #0d9f5d 100%);
  box-shadow: 0 10px 24px rgba(13, 159, 93, 0.28);
  transition: height 0.3s ease;
`;

export const VolumeLabel = styled.span`
  color: #5b7779;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const StatusList = styled.div`
  display: grid;
  gap: 14px;
`;

export const StatusRow = styled.div`
  display: grid;
  gap: 8px;
`;

export const StatusTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const StatusTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StatusBullet = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $tone }) => getToneColor($tone)};
`;

export const StatusName = styled.span`
  color: #123134;
  font-weight: 600;
`;

export const StatusValue = styled.span`
  color: #5d787a;
  font-size: 0.94rem;
  font-weight: 600;
`;

export const StatusTrack = styled.div`
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2ece7;
`;

export const StatusFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: ${({ $tone }) => getToneColor($tone)};
`;

export const PanelSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryPill = styled.div`
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 1.1rem;
  }

  span {
    color: #5c777a;
    font-size: 0.88rem;
  }
`;

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
  margin: 6px 0 0;
  color: #557274;
  line-height: 1.55;
`;

export const HighlightGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

export const HighlightCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 28px rgba(15, 46, 47, 0.06);
`;

export const HighlightTop = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const Avatar = styled.span`
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #123134 0%, #0d9f5d 100%);
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.04em;
  flex-shrink: 0;
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const HighlightLabel = styled.span`
  color: #0d6b3c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const HighlightTitle = styled.h3`
  margin: 4px 0 0;
  color: #123134;
  font-size: 1.12rem;
`;

export const HighlightHelper = styled.p`
  margin: 4px 0 0;
  color: #597476;
  font-size: 0.92rem;
  line-height: 1.45;
`;

export const HighlightMetric = styled.strong`
  color: #123134;
  font-size: 1.55rem;
  line-height: 1.1;
`;

export const HighlightCaption = styled.p`
  margin: 0;
  color: #597476;
  line-height: 1.55;
`;

export const TeamGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  align-items: start;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const EmployeeList = styled.div`
  display: grid;
  gap: 14px;
`;

export const EmployeeRow = styled.article`
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.035);
`;

export const EmployeeIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const EmployeeName = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1rem;
`;

export const EmployeeRole = styled.p`
  margin: 4px 0 0;
  color: #607b7d;
  font-size: 0.92rem;
  line-height: 1.45;
`;

export const EmployeeMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #5c787b;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #dfeae4;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #18bf6f 0%, #123134 100%);
`;

export const EmployeeFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #617c7f;
  font-size: 0.88rem;
`;

export const AttentionList = styled.div`
  display: grid;
  gap: 14px;
`;

export const AttentionCard = styled.article`
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(217, 119, 6, 0.16);
  background: linear-gradient(180deg, rgba(255, 250, 238, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%);
`;

export const AttentionTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

export const AttentionMetric = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.16);
  color: #a95704;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const ReasonList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ReasonPill = styled.span`
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(18, 49, 52, 0.08);
  color: #415e61;
  font-size: 0.8rem;
  font-weight: 600;
`;

export const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
  align-items: start;
  gap: 18px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const SideColumn = styled.div`
  display: grid;
  gap: 18px;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    padding: 0 14px 14px 0;
    text-align: left;
    color: #5c777a;
    font-size: 0.84rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  td {
    padding: 14px 14px 14px 0;
    color: #244448;
    border-top: 1px solid rgba(15, 46, 47, 0.08);
    vertical-align: middle;
  }

  tbody tr:hover {
    background: rgba(18, 49, 52, 0.025);
  }
`;

export const TableActionButton = styled.button`
  border: 1px solid rgba(18, 49, 52, 0.12);
  background: rgba(18, 49, 52, 0.04);
  color: #123134;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(13, 107, 60, 0.08);
    border-color: rgba(13, 107, 60, 0.18);
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  ${({ $tone }) => getStatusBadge($tone)}
`;

export const SubjectList = styled.div`
  display: grid;
  gap: 14px;
`;

export const SubjectRow = styled.article`
  display: grid;
  gap: 8px;
`;

export const SubjectTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const SubjectName = styled.span`
  color: #123134;
  font-weight: 600;
  line-height: 1.45;
`;

export const SubjectCount = styled.span`
  color: #557275;
  font-weight: 700;
`;

export const SubjectTrack = styled.div`
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e0ece6;
`;

export const SubjectFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0d6b3c 0%, #43d48b 100%);
`;

export const SubjectShare = styled.span`
  color: #607b7d;
  font-size: 0.86rem;
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const QuickActionCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.04);
`;

export const QuickActionLabel = styled.span`
  color: #0d6b3c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const QuickActionTitle = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1rem;
`;

export const QuickActionText = styled.p`
  margin: 0;
  color: #597476;
  line-height: 1.55;
`;

export const QuickActionFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 2px;
`;

export const EmptyPanel = styled.section`
  padding: 28px;
  border-radius: 22px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.95);
  color: #4b676a;
  line-height: 1.6;
  box-shadow: 0 16px 32px rgba(15, 46, 47, 0.06);
`;

export const EmptyInline = styled.p`
  margin: 0;
  color: #5f7a7d;
  line-height: 1.6;
`;

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 26, 28, 0.42);
  backdrop-filter: blur(8px);
`;

export const Dialog = styled.div`
  width: min(980px, 100%);
  max-height: min(88vh, 920px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-radius: 24px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 52px rgba(15, 46, 47, 0.24);
  overflow: hidden;
`;

export const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(15, 46, 47, 0.08);
`;

export const DialogTitle = styled.h2`
  margin: 0;
  color: #123134;
  font-size: 1.35rem;
`;

export const DialogText = styled.p`
  margin: 6px 0 0;
  color: #5b7678;
  line-height: 1.55;
`;

export const DialogBody = styled.div`
  overflow-y: auto;
  display: grid;
  gap: 18px;
  padding: 24px;
`;

export const ReviewGroupList = styled.div`
  display: grid;
  gap: 18px;
`;

export const ReviewGroupCard = styled.article`
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(18, 49, 52, 0.035);
`;

export const ReviewGroupHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ReviewSummary = styled.div`
  display: grid;
  gap: 4px;
  justify-items: end;

  strong {
    color: #123134;
    font-size: 1.3rem;
  }

  span {
    color: #5f7a7d;
    font-size: 0.9rem;
  }
`;

export const ReviewCardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
`;

export const ReviewCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 46, 47, 0.08);
`;

export const ReviewCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const ReviewProtocol = styled.span`
  color: #123134;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.04em;
`;

export const ReviewRating = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(13, 159, 93, 0.12);
  color: #0d9f5d;
  font-size: 0.8rem;
  font-weight: 800;
`;

export const ReviewSubject = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1rem;
  line-height: 1.35;
`;

export const ReviewComment = styled.p`
  margin: 0;
  color: #4f6d70;
  line-height: 1.55;
`;

export const ReviewMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: #607c7e;
  font-size: 0.84rem;
`;

export const TicketInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

export const TicketInfoCard = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 0.84rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  span {
    color: #567376;
    line-height: 1.45;
  }
`;

export const MessageList = styled.div`
  display: grid;
  gap: 12px;
`;

export const MessageCard = styled.article`
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid
    ${({ $system }) =>
      $system ? "rgba(18, 49, 52, 0.08)" : "rgba(13, 107, 60, 0.12)"};
  background: ${({ $system }) =>
    $system ? "rgba(18, 49, 52, 0.035)" : "rgba(240, 251, 246, 0.88)"};
`;

export const MessageTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const MessageAuthor = styled.strong`
  color: #123134;
  font-size: 0.95rem;
`;

export const MessageBadge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(18, 49, 52, 0.08);
  color: #476568;
  font-size: 0.78rem;
  font-weight: 700;
`;

export const MessageContent = styled.p`
  margin: 0;
  color: #4c686b;
  line-height: 1.65;
  white-space: pre-wrap;
`;

export const MessageTime = styled.span`
  color: #678284;
  font-size: 0.82rem;
`;
