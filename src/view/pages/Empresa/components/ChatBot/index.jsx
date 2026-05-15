import React from 'react';
import * as S from './styles';
import stepOneImage from '../../../../../../assets/images/1.svg';
import stepTwoImage from '../../../../../../assets/images/2.svg';
import stepThreeImage from '../../../../../../assets/images/3.svg';
import stepFourImage from '../../../../../../assets/images/4.svg';
import stepFiveImage from '../../../../../../assets/images/5.svg';

const One = () => (
  <img
    src={stepOneImage}
    alt="Ícone de número 1"
    style={{ width: '40px', height: '40px' }}
  />
);

const Two = () => (
  <img
    src={stepTwoImage}
    alt="Ícone de número 2"
    style={{ width: '40px', height: '40px' }}
  />
);

const Three = () => (
  <img
    src={stepThreeImage}
    alt="Ícone de número 3"
    style={{ width: '40px', height: '40px' }}
  />
);

const Four = () => (
  <img
    src={stepFourImage}
    alt="Ícone de número 4"
    style={{ width: '40px', height: '40px' }}
  />
);

const Five = () => (
  <img
    src={stepFiveImage}
    alt="Ícone de número 5"
    style={{ width: '40px', height: '40px' }}
  />
);

const ChatBotInfo = () => {
  return (
    <S.Section>
      <S.Left>
        <S.Title>
          Nosso <S.HighlightGreen>Chatbot</S.HighlightGreen> garante velocidade
          <br />
          para quem precisa de <S.HighlightGreen>respostas rápidas.</S.HighlightGreen>
        </S.Title>

        <S.Text>
          Nosso chatbot responde dúvidas simples de forma imediata, disponível
          24/7 e integrado ao atendimento humano para garantir rapidez e
          eficiência.
        </S.Text>

        <S.Stats>
          <S.Stat>
            <strong>86%</strong>
            <span>Das empresas brasileiras utilizam Chatbot.</span>
          </S.Stat>
          <S.Stat>
            <strong>71%</strong>
            <span>Reconhece o aumento da eficiência.</span>
          </S.Stat>
          <S.Stat>
            <strong>61%</strong>
            <span>Dos consumidores aprovam as interações.</span>
          </S.Stat>
        </S.Stats>
      </S.Left>

      <S.Right>
        <S.Step>
          <S.Icon><One /></S.Icon>
          <p>
            O usuário abre um ticket pela aba de atendimentos no site e
            descreve a sua solicitação.
          </p>
        </S.Step>

        <S.Step>
          <S.Icon><Two /></S.Icon>
          <p>
            O Chatbot analisa a mensagem e entende se é uma dúvida simples, um
            pedido de informação ou um problema mais complexo.
          </p>
        </S.Step>

        <S.Step>
          <S.Icon><Three /></S.Icon>
          <p>
            Se a solicitação for simples, o chatbot envia uma resposta automática,
            clara e objetiva, resolvendo a questão em segundos.
          </p>
        </S.Step>

        <S.Step>
          <S.Icon><Four /></S.Icon>
          <p>
            Quando necessário, o chatbot transfere a conversa para um atendente,
            já com todo o histórico registrado para agilizar a resolução.
          </p>
        </S.Step>

        <S.Step>
          <S.Icon><Five /></S.Icon>
          <p>
            Todas as interações ficam registradas no sistema, gerando dados e
            relatórios que ajudam a empresa a melhorar o atendimento.
          </p>
        </S.Step>
      </S.Right>
    </S.Section>
  );
};

export default ChatBotInfo;
