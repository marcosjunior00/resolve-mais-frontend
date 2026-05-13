import styled, { css } from "styled-components";

const cardStyles = css`
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
`;

export const Page = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
  position: relative;
`;

export const HeaderFixed = styled.div`
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
`;

export const SuccessPopup = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const SuccessContent = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
`;

export const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #00c853;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
`;

export const SuccessTitle = styled.h3`
  margin: 0 0 0.5rem;
  color: #00c853;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const SuccessMessage = styled.p`
  margin: 0;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

export const ProgressSteps = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  margin-top: 70px;
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0 2rem;
  position: relative;
  color: ${({ $active }) => ($active ? "#00c853" : "#6c757d")};
`;

export const StepNumber = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#00c853" : "#dee2e6")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#fff" : "#6c757d")};
`;

export const StepText = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
`;

export const Content = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

export const FormStep = styled.div`
  ${cardStyles}
`;

export const FormStepForm = styled.form`
  ${cardStyles}
`;

export const StepHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

export const StepTitle = styled.h2`
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const StepDescription = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
`;

export const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

export const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #00c853;
  }
`;

export const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding-top: 1px;
`;

export const OptionItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
  text-align: left;
  font: inherit;

  &:hover {
    border-color: #00c853;
    transform: translateY(-1px);
  }
`;

export const OptionContent = styled.div`
  flex: 1;
`;

export const OptionTitle = styled.h3`
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
`;

export const CompanyCnpj = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

export const CompanyDescription = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const ComplaintDescription = styled.p`
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const OptionArrow = styled.div`
  color: #00c853;
  font-size: 1.2rem;
  font-weight: 300;
  margin-left: 1rem;
`;

export const NoResults = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #6c757d;
`;

export const NoResultsText = styled.p`
  margin: 0 0 0.5rem;
  font-size: 1rem;
`;

export const StepBackContainer = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

export const SelectedInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #00c853;
`;

export const InfoItem = styled.div`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  transition: border-color 0.2s ease;
  outline: none;
  position: relative;
  z-index: 2;
  box-sizing: border-box;

  &:focus {
    border-color: #00c853;
  }
`;

export const TextareaFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

export const CharCount = styled.small`
  color: #6c757d;
`;

export const CharHint = styled.small`
  color: ${({ $error }) => ($error ? "#dc3545" : "#6c757d")};
`;

export const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;
