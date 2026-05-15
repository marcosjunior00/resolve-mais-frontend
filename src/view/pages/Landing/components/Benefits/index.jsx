import React from 'react';
import * as S from './styles';
import boxImage from '../../../../../../assets/images/box.svg';

const BoxIcon = () => (
  <img
    src={boxImage}
    alt="Icone de caixa"
    style={{width: '40px', height: '40px'}}
  />
);

const BenefitsSection = () => {
  return (
    <S.BenefitsSection>
      <S.BenefitsTitle>Benefícios</S.BenefitsTitle>
      
      <S.BenefitsGrid>
        <S.BenefitCard>
          <S.BenefitIcon><BoxIcon/></S.BenefitIcon>
          <S.BenefitName>Eficiência</S.BenefitName>
          <S.BenefitDescription>
            Empresas ganham eficiência, redução de custos e fidelização de clientes.
          </S.BenefitDescription>
        </S.BenefitCard>

        <S.BenefitCard>
          <S.BenefitIcon><BoxIcon/></S.BenefitIcon>
          <S.BenefitName>Agilidade</S.BenefitName>
          <S.BenefitDescription>
            Clientes têm respostas rápidas, sem burocracia, pela aba de atendimentos no site.
          </S.BenefitDescription>
        </S.BenefitCard>

        <S.BenefitCard>
          <S.BenefitIcon><BoxIcon/></S.BenefitIcon>
          <S.BenefitName>Inovação</S.BenefitName>
          <S.BenefitDescription>
            Diferente dos SACs tradicionais, nossa solução une agilidade da IA com o cuidado humano.
          </S.BenefitDescription>
        </S.BenefitCard>
      </S.BenefitsGrid>
    </S.BenefitsSection>
  );
};

export default BenefitsSection;
