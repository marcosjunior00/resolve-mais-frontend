import React from 'react';
import * as S from './styles';
import experienceImage from '../../../../../../assets/images/experience-image.svg';

const EmployeeImmersion = () => {
  return (
    <S.Container>
      <S.Header>
        <h1>Imersão do <br/><span>Funcionário</span></h1>
        <p>
          Nosso chatbot não transforma apenas a experiência do cliente,
          mas também a dos colaboradores. <br />
          Com respostas rápidas, integração a processos internos e acesso imediato às informações, 
          o funcionário encontra no chatbot um aliado para aprender.
        </p>
      </S.Header>

      <S.Content>
        <S.LeftSection>
          <S.CardsContainer>
            <S.Card>
              <h3>Histórico completo</h3>
              <p>
                Todas as conversas, interações e atendimentos ficam registrados,
                garantindo mais contexto, agilidade e personalização no suporte.
              </p>
            </S.Card>

            <S.Card $destaque>
              <h3>Painel Único</h3>
              <p>
                Pela aba de atendimentos no site, todas as conversas ficam no mesmo painel,
                simplificando o trabalho do funcionário e organizando a comunicação.
              </p>
            </S.Card>

            <S.Card>
              <h3>Transferência Interna</h3>
              <p>
                O cliente pode ser direcionado de um atendente para outro sem perder o histórico,
                mantendo a experiência fluida e sem interrupções.
              </p>
            </S.Card>

            <S.Card $destaque>
              <h3>Design limpo e moderno</h3>
              <p>
                Com um design limpo e moderno, o funcionário se adapta rapidamente e foca no que realmente importa:
                atender bem o cliente.
              </p>
            </S.Card>
          </S.CardsContainer>
        </S.LeftSection>

        <S.RightSection>
          <img src={experienceImage} alt="Funcionário no computador" />
        </S.RightSection>
      </S.Content>
    </S.Container>
  );
};

export default EmployeeImmersion;
