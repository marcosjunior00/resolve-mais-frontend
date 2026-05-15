import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import * as S from "../Settings/styles";
import LoggedHeader from "../../../../../components/LoggedHeader";
import Input from "../../../../../components/Input";
import Button from "../../../../../components/Button";
import { useSnack } from "../../../../../contexts/SnackContext";
import { companyAdminService } from "../../../../../services/companyAdminService";

const COMPLAINT_TEMPLATES = [
  {
    title: "Demora na entrega",
    description: "Atraso no prazo informado, falta de atualização do rastreio ou pedido ainda não entregue.",
  },
  {
    title: "Problemas no site",
    description: "Instabilidade, erro ao acessar, falha no login, carrinho ou conclusão da compra.",
  },
  {
    title: "Problemas com o produto",
    description: "Produto com defeito, avariado, diferente do anunciado ou com funcionamento inadequado.",
  },
  {
    title: "Dificuldade no pagamento",
    description: "Pagamento recusado, cobrança em duplicidade ou divergência no valor final da compra.",
  },
  {
    title: "Troca ou devolução",
    description: "Solicitação de troca, devolução, estorno ou dúvidas sobre política de arrependimento.",
  },
];

const CompanyComplaintTitles = () => {
  const { showSnack } = useSnack();
  const [company, setCompany] = useState(null);
  const [complaintTitles, setComplaintTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingComplaintTitle, setSavingComplaintTitle] = useState(false);
  const [removingComplaintTitleId, setRemovingComplaintTitleId] = useState(null);

  const complaintTitleForm = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const loadComplaintTitles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyAdminService.listComplaintTitles();
      setCompany(response.company || null);
      setComplaintTitles(response.complaintTitles || []);
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Não foi possível carregar os assuntos da empresa.",
      });
    } finally {
      setLoading(false);
    }
  }, [showSnack]);

  useEffect(() => {
    loadComplaintTitles();
  }, [loadComplaintTitles]);

  const applyComplaintTemplate = (template) => {
    complaintTitleForm.reset({
      title: template.title,
      description: template.description,
    });
  };

  const createComplaintTitle = async (formData) => {
    try {
      setSavingComplaintTitle(true);
      const response = await companyAdminService.addComplaintTitle({
        title: formData.title,
        description: formData.description,
      });

      setCompany(response.company || company);
      setComplaintTitles(response.complaintTitles || []);
      complaintTitleForm.reset({
        title: "",
        description: "",
      });
      showSnack({
        variant: "success",
        message: response.message || "Assunto cadastrado com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Erro ao cadastrar assunto.",
      });
    } finally {
      setSavingComplaintTitle(false);
    }
  };

  const removeComplaintTitle = async (complaintTitle) => {
    const shouldRemove = window.confirm(`Deseja remover o assunto "${complaintTitle.title}"?`);

    if (!shouldRemove) return;

    try {
      setRemovingComplaintTitleId(complaintTitle.id);
      const response = await companyAdminService.removeComplaintTitle(complaintTitle.id);
      setComplaintTitles(response.complaintTitles || []);
      showSnack({
        variant: "success",
        message: response.message || "Assunto removido com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Erro ao remover assunto.",
      });
    } finally {
      setRemovingComplaintTitleId(null);
    }
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        <S.Card>
          <S.SectionHeader>
            <div>
              <S.CardTitle>Assuntos recorrentes para tickets</S.CardTitle>
              <S.CardText>
                {company?.name
                  ? `Gerencie os assuntos usados pelos clientes ao abrir tickets para ${company.name}.`
                  : "Gerencie os assuntos usados pelos clientes ao abrir tickets da empresa."}
              </S.CardText>
            </div>
            <S.CountBadge>{complaintTitles.length} cadastrados</S.CountBadge>
          </S.SectionHeader>

          <S.ButtonsGroup>
            <Button variant="secondary" redirect="/empresa/home">
              Voltar para a home
            </Button>
          </S.ButtonsGroup>
        </S.Card>

        <S.Card>
          <S.TemplateTitleRow>
            <S.SubsectionTitle>Templates de sugestão</S.SubsectionTitle>
            <S.SupportingText>Use um modelo pronto e ajuste o texto se precisar.</S.SupportingText>
          </S.TemplateTitleRow>

          <S.TemplateGrid>
            {COMPLAINT_TEMPLATES.map((template) => (
              <S.TemplateCard key={template.title}>
                <S.TemplateName>{template.title}</S.TemplateName>
                <S.TemplateDescription>{template.description}</S.TemplateDescription>
                <Button type="button" variant="secondary" onClick={() => applyComplaintTemplate(template)}>
                  Usar template
                </Button>
              </S.TemplateCard>
            ))}
          </S.TemplateGrid>
        </S.Card>

        <S.Card>
          <S.TemplateTitleRow>
            <S.SubsectionTitle>Novo assunto</S.SubsectionTitle>
            <S.SupportingText>
              Cadastre um título claro e, se quiser, uma breve explicação para orientar o cliente.
            </S.SupportingText>
          </S.TemplateTitleRow>

          <S.Form onSubmit={complaintTitleForm.handleSubmit(createComplaintTitle)}>
            <Input
              label="Assunto:"
              placeholder="Ex.: Demora na entrega"
              type="text"
              register={complaintTitleForm.register("title", {
                required: "Informe o assunto",
              })}
              errors={complaintTitleForm.formState.errors.title}
            />

            <S.FieldBlock>
              <S.FieldLabel htmlFor="complaint-description">Descrição opcional:</S.FieldLabel>
              <S.TextArea
                id="complaint-description"
                rows={4}
                placeholder="Ex.: pedido atrasado, rastreio sem atualização ou prazo excedido."
                {...complaintTitleForm.register("description")}
              />
              <S.SupportingText>
                Essa descrição aparece junto ao assunto para ajudar o cliente a escolher a opção correta.
              </S.SupportingText>
            </S.FieldBlock>

            <S.ButtonsGroup>
              <Button
                variant="secondary"
                type="button"
                onClick={() =>
                  complaintTitleForm.reset({
                    title: "",
                    description: "",
                  })
                }
                disabled={savingComplaintTitle}
              >
                Limpar
              </Button>
              <Button variant="primary" type="submit" disabled={savingComplaintTitle}>
                {savingComplaintTitle ? "Salvando assunto..." : "Adicionar assunto"}
              </Button>
            </S.ButtonsGroup>
          </S.Form>
        </S.Card>

        <S.Card>
          <S.TemplateTitleRow>
            <S.SubsectionTitle>Assuntos cadastrados</S.SubsectionTitle>
            <S.SupportingText>
              Remova apenas os assuntos que não fazem mais sentido para novos tickets.
            </S.SupportingText>
          </S.TemplateTitleRow>

          {loading ? (
            <S.EmptyState>Carregando assuntos da empresa...</S.EmptyState>
          ) : complaintTitles.length === 0 ? (
            <S.EmptyState>
              Nenhum assunto cadastrado ainda. Use um template acima ou crie o primeiro manualmente.
            </S.EmptyState>
          ) : (
            <S.ComplaintList>
              {complaintTitles.map((complaintTitle) => (
                <S.ComplaintCard key={complaintTitle.id}>
                  <S.ComplaintContent>
                    <S.ComplaintName>{complaintTitle.title}</S.ComplaintName>
                    <S.ComplaintText>
                      {complaintTitle.description || "Sem descrição complementar."}
                    </S.ComplaintText>
                  </S.ComplaintContent>

                  <Button
                    type="button"
                    variant="transparent"
                    disabled={removingComplaintTitleId === complaintTitle.id}
                    onClick={() => removeComplaintTitle(complaintTitle)}
                  >
                    {removingComplaintTitleId === complaintTitle.id ? "Removendo..." : "Remover"}
                  </Button>
                </S.ComplaintCard>
              ))}
            </S.ComplaintList>
          )}
        </S.Card>
      </S.Container>
    </S.Page>
  );
};

export default CompanyComplaintTitles;
