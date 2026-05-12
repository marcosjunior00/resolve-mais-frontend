import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import * as S from "./styles";
import LoggedHeader from "../../../../../components/LoggedHeader";
import Input from "../../../../../components/Input";
import Button from "../../../../../components/Button";
import { useSnack } from "../../../../../contexts/SnackContext";
import { companyAdminService } from "../../../../../services/companyAdminService";

const CompanySettings = () => {
  const { showSnack } = useSnack();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);

  const companyForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      aiContext: "",
      aiInstructions: "",
      aiExamples: "",
    },
  });

  const loadCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyAdminService.list();
      const companyData = response.company || null;
      setCompany(companyData);

      if (companyData) {
        companyForm.reset({
          name: companyData.name || "",
          description: companyData.description || "",
          aiContext: companyData.aiContext || "",
          aiInstructions: companyData.aiInstructions || "",
          aiExamples: companyData.aiExamples || "",
        });
      }
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Não foi possível carregar os dados da empresa.",
      });
    } finally {
      setLoading(false);
    }
  }, [companyForm, showSnack]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const updateCompanyProfile = async (formData) => {
    try {
      setSavingCompany(true);
      const response = await companyAdminService.updateCompanyProfile({
        name: formData.name,
        description: formData.description,
        aiContext: formData.aiContext,
        aiInstructions: formData.aiInstructions,
        aiExamples: formData.aiExamples,
      });

      setCompany(response.company || company);
      showSnack({ variant: "success", message: "Dados da empresa atualizados com sucesso." });
      await loadCompanyData();
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Erro ao atualizar dados da empresa.",
      });
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        <S.Card>
          <S.CardTitle>Configurações da Empresa</S.CardTitle>
          {!loading && company && (
            <S.CardText>
              {company.name} - CNPJ: {company.cnpj}
            </S.CardText>
          )}
        </S.Card>

        <S.Card>
          <S.SectionTitle>Dados da empresa</S.SectionTitle>
          <S.Form onSubmit={companyForm.handleSubmit(updateCompanyProfile)}>
            <Input
              label="Nome da empresa:"
              placeholder="Nome da empresa"
              type="text"
              register={companyForm.register("name", {
                required: "Informe o nome da empresa",
              })}
              errors={companyForm.formState.errors.name}
            />
            <Input
              label="Descrição:"
              placeholder="Descreva sua empresa"
              type="text"
              register={companyForm.register("description")}
            />
            <Input label="CNPJ:" placeholder="CNPJ" type="text" register={{}} value={company?.cnpj || ""} disabled />
            <S.Divider />
            <S.TemplateTitleRow>
              <S.SubsectionTitle>Contexto da IA</S.SubsectionTitle>
              <S.SupportingText>
                Essas informações orientam o Resolve Assist quando ele responder clientes em tickets abertos.
              </S.SupportingText>
            </S.TemplateTitleRow>
            <S.FieldBlock>
              <S.FieldLabel htmlFor="ai-context">Contexto sobre a empresa:</S.FieldLabel>
              <S.TextArea
                id="ai-context"
                placeholder="Ex.: Somos uma loja de eletrônicos com suporte para pedidos, garantia, trocas e dúvidas sobre entrega."
                {...companyForm.register("aiContext", {
                  maxLength: {
                    value: 4000,
                    message: "O contexto deve ter no máximo 4000 caracteres",
                  },
                })}
              />
              {companyForm.formState.errors.aiContext && (
                <S.FieldError>{companyForm.formState.errors.aiContext.message}</S.FieldError>
              )}
            </S.FieldBlock>
            <S.FieldBlock>
              <S.FieldLabel htmlFor="ai-instructions">Instruções para a IA:</S.FieldLabel>
              <S.TextArea
                id="ai-instructions"
                placeholder="Ex.: Sempre peça o número do pedido antes de orientar sobre entrega. Se houver pedido de reembolso, explique que a equipe humana continuará o atendimento."
                {...companyForm.register("aiInstructions", {
                  maxLength: {
                    value: 4000,
                    message: "As instruções devem ter no máximo 4000 caracteres",
                  },
                })}
              />
              {companyForm.formState.errors.aiInstructions && (
                <S.FieldError>{companyForm.formState.errors.aiInstructions.message}</S.FieldError>
              )}
            </S.FieldBlock>
            <S.FieldBlock>
              <S.FieldLabel htmlFor="ai-examples">Exemplos de casos e respostas:</S.FieldLabel>
              <S.TextArea
                id="ai-examples"
                placeholder={"Ex.: Caso: cliente informa atraso na entrega. Resposta esperada: pedir número do pedido e confirmar que a equipe verificará o rastreio.\nCaso: produto chegou com defeito. Resposta esperada: solicitar fotos, nota fiscal e detalhes do defeito."}
                {...companyForm.register("aiExamples", {
                  maxLength: {
                    value: 4000,
                    message: "Os exemplos devem ter no máximo 4000 caracteres",
                  },
                })}
              />
              {companyForm.formState.errors.aiExamples && (
                <S.FieldError>{companyForm.formState.errors.aiExamples.message}</S.FieldError>
              )}
            </S.FieldBlock>
            <S.ButtonsGroup>
              <Button variant="primary" type="submit" disabled={savingCompany}>
                Salvar dados da empresa
              </Button>
            </S.ButtonsGroup>
          </S.Form>
        </S.Card>

        <S.Card>
          <S.SectionHeader>
            <div>
              <S.SectionTitle>Assuntos recorrentes</S.SectionTitle>
              <S.SectionDescription>
                Agora os assuntos de tickets ficam em uma página dedicada para facilitar o cadastro e a manutenção.
              </S.SectionDescription>
            </div>
          </S.SectionHeader>

          <S.SupportingText>
            Nessa página o administrador pode adicionar temas como demora na entrega, problemas no site, problemas com o
            produto e outros assuntos mais recorrentes para novos tickets.
          </S.SupportingText>

          <S.ButtonsGroup>
            <Button variant="primary" redirect="/empresa/assuntos">
              Abrir página de assuntos
            </Button>
          </S.ButtonsGroup>
        </S.Card>
      </S.Container>
    </S.Page>
  );
};

export default CompanySettings;
