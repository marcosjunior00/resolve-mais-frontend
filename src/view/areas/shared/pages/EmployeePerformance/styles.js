import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

const getMessageVariantStyles = (variant, align) => {
  if (variant === "bot") {
    return css`
      background: rgba(18, 49, 52, 0.06);
      border-color: rgba(18, 49, 52, 0.08);
      color: #123134;
    `;
  }

  if (variant === "customer") {
    return align === "right"
      ? css`
          background: linear-gradient(135deg, #18bf6f 0%, #0d9e5a 100%);
          border-color: rgba(13, 107, 60, 0.18);
          color: #ffffff;
        `
      : css`
          background: rgba(245, 248, 249, 0.96);
          border-color: rgba(15, 46, 47, 0.08);
          color: #123134;
        `;
  }

  return align === "right"
    ? css`
        background: linear-gradient(145deg, #1d474a 0%, #123134 100%);
        border-color: rgba(15, 46, 47, 0.18);
        color: #ffffff;
      `
    : css`
        background: rgba(255, 255, 255, 0.98);
        border-color: rgba(15, 46, 47, 0.1);
        color: #123134;
      `;
};

export const Page = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(920px 420px at 8% 4%, #dff7ec 0%, transparent 58%),
    linear-gradient(165deg, #f5fbf8 0%, #eef5f2 100%);
  padding-top: 90px;
`;

export const Container = styled.main`
  width: min(1120px, 94%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
  padding-bottom: 40px;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: #245659;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: #0d6b3c;
  }
`;

export const HeroSection = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  gap: 18px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroCard = styled.section`
  display: grid;
  gap: 18px;
  padding: 30px;
  border-radius: 22px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(241, 251, 246, 0.98) 100%
  );
  box-shadow: 0 16px 34px rgba(15, 46, 47, 0.08);
`;

export const SummaryCard = styled.aside`
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
  border-radius: 22px;
  background: linear-gradient(180deg, #123134 0%, #1c4b4d 100%);
  color: #effcf7;
  box-shadow: 0 18px 36px rgba(18, 49, 52, 0.18);
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(13, 107, 60, 0.14);
  background: linear-gradient(
    135deg,
    rgba(226, 250, 236, 0.95) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  color: #0d6b3c;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

export const EyebrowDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: radial-gradient(
    circle at 30% 30%,
    #77f2af 0%,
    #18bf6f 55%,
    #0d6b3c 100%
  );
  box-shadow: 0 0 0 4px rgba(13, 107, 60, 0.12);
`;

export const EmployeeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

export const EmployeeAvatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(13, 107, 60, 0.12);
  color: #0d6b3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
`;

export const EmployeeAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const EmployeeName = styled.h1`
  margin: 0;
  color: #123134;
  font-size: clamp(1.9rem, 3vw, 2.6rem);
  line-height: 1.1;
`;

export const EmployeeRole = styled.p`
  margin: 6px 0 0;
  color: #537071;
  font-size: 0.95rem;
  font-weight: 600;
`;

export const HeroTitle = styled.h2`
  margin: 0;
  color: #123134;
  font-size: 1.35rem;
`;

export const HeroText = styled.p`
  margin: 0;
  color: #456263;
  font-size: 1rem;
  line-height: 1.65;
  max-width: 760px;
`;

export const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

export const MetaPill = styled.div`
  display: grid;
  gap: 4px;
  min-width: 190px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(18, 49, 52, 0.05);

  strong {
    color: #123134;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  span {
    color: #476365;
    font-size: 0.95rem;
    line-height: 1.45;
  }
`;

export const SummaryLabel = styled.span`
  color: rgba(239, 252, 247, 0.72);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const SummaryValue = styled.strong`
  color: #ffffff;
  font-size: clamp(2.4rem, 4vw, 3.2rem);
  line-height: 1;
`;

export const SummaryStars = styled.p`
  margin: 0;
  color: rgba(239, 252, 247, 0.88);
  line-height: 1.5;
`;

export const SummaryCaption = styled.p`
  margin: 0;
  color: rgba(239, 252, 247, 0.74);
  line-height: 1.6;
`;

export const DistributionList = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const DistributionPill = styled.div`
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;

  span {
    font-size: 0.8rem;
    color: rgba(239, 252, 247, 0.78);
  }

  strong {
    font-size: 1rem;
    color: #ffffff;
  }
`;

export const MetricsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
`;

export const MetricCard = styled.article`
  display: grid;
  gap: 8px;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 26px rgba(15, 46, 47, 0.06);
`;

export const MetricValue = styled.strong`
  color: #123134;
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  line-height: 1;
`;

export const MetricLabel = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1rem;
`;

export const MetricHelper = styled.p`
  margin: 0;
  color: #5d787a;
  font-size: 0.9rem;
  line-height: 1.55;
`;

export const SectionCard = styled.section`
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(15, 46, 47, 0.1);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 32px rgba(15, 46, 47, 0.06);
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
  margin: 8px 0 0;
  color: #537071;
  line-height: 1.55;
`;

export const ControlBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const FilterChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "rgba(13, 107, 60, 0.18)" : "rgba(15, 46, 47, 0.1)"};
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(145deg, rgba(24, 191, 111, 0.14) 0%, rgba(226, 250, 236, 0.95) 100%)"
      : "rgba(255, 255, 255, 0.96)"};
  color: ${({ $active }) => ($active ? "#0d6b3c" : "#456263")};
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(15, 46, 47, 0.06);
  }

  span,
  strong {
    font-size: 0.88rem;
    font-weight: 700;
  }
`;

export const SortControl = styled.div`
  display: grid;
  gap: 6px;
  min-width: 240px;
`;

export const SortLabel = styled.label`
  color: #456263;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const SortSelect = styled.select`
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  background: #ffffff;
  color: #123134;
  font-size: 0.95rem;
`;

export const ReviewList = styled.div`
  display: grid;
  gap: 14px;
`;

export const ReviewCard = styled.article`
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  background: rgba(18, 49, 52, 0.035);
`;

export const ReviewTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ReviewStars = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0d6b3c;
  font-size: 0.92rem;
  font-weight: 700;
`;

export const ReviewSubject = styled.h3`
  margin: 10px 0 0;
  color: #123134;
  font-size: 1rem;
  line-height: 1.45;
`;

export const ReviewDate = styled.span`
  color: #6b8587;
  font-size: 0.86rem;
  font-weight: 600;
`;

export const ReviewComment = styled.p`
  margin: 0;
  color: #4b6769;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const ReviewMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
`;

export const ReviewMetaItem = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);

  span {
    color: #6a8587;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  strong {
    color: #123134;
    font-size: 0.92rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }
`;

export const ReviewActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  min-height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(145deg, #1d474a 0%, #123134 100%);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(18, 49, 52, 0.22);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
`;

export const EmptyState = styled.p`
  margin: 0;
  color: #7a9a9b;
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const DialogOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(9, 20, 21, 0.58);
  backdrop-filter: blur(6px);
`;

export const Dialog = styled.div`
  width: min(980px, 100%);
  max-height: min(88vh, 920px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-radius: 24px;
  background: #f8fcfa;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(9, 20, 21, 0.24);
`;

export const DialogHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid rgba(15, 46, 47, 0.08);
  background: rgba(255, 255, 255, 0.96);
`;

export const DialogTitle = styled.h3`
  margin: 0;
  color: #123134;
  font-size: 1.2rem;
`;

export const DialogText = styled.p`
  margin: 8px 0 0;
  color: #537071;
  line-height: 1.55;
`;

export const DialogCloseButton = styled.button`
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(15, 46, 47, 0.12);
  border-radius: 12px;
  background: #ffffff;
  color: #123134;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
`;

export const DialogBody = styled.div`
  display: grid;
  gap: 18px;
  padding: 24px;
  overflow-y: auto;
`;

export const ConversationMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

export const ConversationPill = styled.div`
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  background: rgba(255, 255, 255, 0.96);

  strong {
    color: #456263;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  span {
    color: #123134;
    font-size: 0.92rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
`;

export const ConversationHighlight = styled.div`
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(13, 107, 60, 0.12);
  background: rgba(226, 250, 236, 0.64);

  strong {
    color: #0d6b3c;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    color: #214446;
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;

export const MessageList = styled.div`
  display: grid;
  gap: 12px;
`;

export const MessageRow = styled.div`
  display: flex;
  justify-content: ${({ $align }) =>
    $align === "right" ? "flex-end" : "flex-start"};
`;

export const MessageCard = styled.article`
  width: min(720px, 100%);
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(15, 46, 47, 0.08);
  ${({ $variant, $align }) => getMessageVariantStyles($variant, $align)}
`;

export const MessageCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const MessageIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(13, 107, 60, 0.12);
  color: #0d6b3c;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 0.84rem;
  font-weight: 700;
  flex-shrink: 0;
`;

export const MessageAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MessageSender = styled.strong`
  display: block;
  font-size: 0.92rem;
  line-height: 1.35;
`;

export const MessageTag = styled.span`
  display: block;
  font-size: 0.76rem;
  opacity: 0.78;
  margin-top: 2px;
`;

export const MessageTime = styled.span`
  font-size: 0.78rem;
  opacity: 0.75;
  font-weight: 600;
`;

export const MessageContent = styled.p`
  margin: 0;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const SystemMessage = styled.div`
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(18, 49, 52, 0.07);
  color: #456263;
  text-align: center;

  span {
    line-height: 1.6;
  }

  small {
    font-size: 0.78rem;
    font-weight: 600;
    color: #70898b;
  }
`;
