import styled from "styled-components";

export const Page = styled.div`
    min-height: 100vh;
    background: radial-gradient(900px 420px at 8% 2%, #dff7ec 0%, transparent 60%), linear-gradient(160deg, #f5fbf8 0%, #eef5f2 100%);
    padding-top: 90px;
`;

export const Container = styled.main`
    width: min(920px, 95%);
    margin: 0 auto;
    display: grid;
    gap: 16px;
    padding-bottom: 24px;
`;

export const Card = styled.section`
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(15, 46, 47, .14);
    box-shadow: 0 12px 28px rgba(15, 46, 47, .08);
    padding: 18px;
`;

export const CardTitle = styled.h1`
    margin: 0;
    color: #123134;
`;

export const CardText = styled.p`
    margin: 8px 0 0;
    color: #3f5f60;
`;

export const SectionTitle = styled.h2`
    margin: 0;
    color: #123134;
`;

export const SectionDescription = styled.p`
    margin: 8px 0 0;
    color: #4d6a6b;
    line-height: 1.5;
`;

export const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
    flex-wrap: wrap;
`;

export const CountBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #eaf8f0;
    color: #0d6b3c;
    font-size: 13px;
    font-weight: 700;
`;

export const Form = styled.form`
    display: grid;
    gap: 12px;
`;

export const ButtonsGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
`;

export const TemplateTitleRow = styled.div`
    display: grid;
    gap: 6px;
    margin-bottom: 14px;
`;

export const SubsectionTitle = styled.h3`
    margin: 0;
    color: #123134;
    font-size: 1.05rem;
`;

export const SupportingText = styled.p`
    margin: 0;
    color: #567475;
    line-height: 1.5;
    font-size: 0.95rem;
`;

export const TemplateGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
`;

export const TemplateCard = styled.article`
    display: grid;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(15, 46, 47, .12);
    background: linear-gradient(180deg, #fbfefd 0%, #f3faf7 100%);
`;

export const TemplateName = styled.h4`
    margin: 0;
    color: #123134;
    font-size: 1rem;
`;

export const TemplateDescription = styled.p`
    margin: 0;
    color: #496667;
    line-height: 1.5;
    font-size: 0.94rem;
`;

export const Divider = styled.hr`
    margin: 22px 0;
    border: none;
    border-top: 1px solid rgba(15, 46, 47, .12);
`;

export const FieldBlock = styled.div`
    display: grid;
    gap: 8px;
`;

export const FieldLabel = styled.label`
    color: #123134;
    font-weight: 600;
    font-size: 0.95rem;
`;

export const FieldError = styled.span`
    color: #c2410c;
    font-size: 12px;
`;

export const TextArea = styled.textarea`
    width: 100%;
    min-height: 110px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(15, 46, 47, .18);
    background: #fff;
    color: #123134;
    resize: vertical;
    font: inherit;
    transition: border-color .2s ease, box-shadow .2s ease;

    &::placeholder {
        color: #7c9898;
    }

    &:focus {
        outline: none;
        border-color: #00c853;
        box-shadow: 0 0 0 3px rgba(0, 200, 83, .14);
    }
`;

export const EmptyState = styled.div`
    padding: 18px;
    border-radius: 12px;
    border: 1px dashed rgba(15, 46, 47, .18);
    background: #f8fbfa;
    color: #4d6a6b;
    line-height: 1.5;
`;

export const ComplaintList = styled.div`
    display: grid;
    gap: 12px;
`;

export const ComplaintCard = styled.article`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid rgba(15, 46, 47, .12);
    background: #ffffff;

    @media (max-width: 640px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

export const ComplaintContent = styled.div`
    display: grid;
    gap: 6px;
`;

export const ComplaintName = styled.h4`
    margin: 0;
    color: #123134;
    font-size: 1rem;
`;

export const ComplaintText = styled.p`
    margin: 0;
    color: #4d6a6b;
    line-height: 1.5;
    font-size: 0.95rem;
`;
