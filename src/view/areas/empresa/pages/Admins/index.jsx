import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import * as S from "./styles";
import LoggedHeader from "../../../../../components/LoggedHeader";
import CpfInput from "../../../../../components/CpfInput";
import Input from "../../../../../components/Input";
import PhoneInput from "../../../../../components/PhoneInput";
import Button from "../../../../../components/Button";
import { useSnack } from "../../../../../contexts/SnackContext";
import { companyAdminService } from "../../../../../services/companyAdminService";

const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 5,
  total: 0,
  totalPages: 1,
};
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const buildFallbackPagination = (items, pageSize = DEFAULT_PAGINATION.pageSize) => ({
  page: 1,
  pageSize,
  total: items.length,
  totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
});

const getPersonInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const getAvatarUrl = (person) => {
  const avatarUrl = person?.avatarUrl || person?.avatar_url || "";

  return typeof avatarUrl === "string" ? avatarUrl.trim() : "";
};

const CompanyAdminsPage = () => {
  const { showSnack } = useSnack();

  const [company, setCompany] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("employees");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [associateEmail, setAssociateEmail] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all");
  const [adminPage, setAdminPage] = useState(DEFAULT_PAGINATION.page);
  const [employeePage, setEmployeePage] = useState(DEFAULT_PAGINATION.page);
  const [adminPageSize, setAdminPageSize] = useState(DEFAULT_PAGINATION.pageSize);
  const [employeePageSize, setEmployeePageSize] = useState(DEFAULT_PAGINATION.pageSize);
  const [adminPagination, setAdminPagination] = useState(DEFAULT_PAGINATION);
  const [employeePagination, setEmployeePagination] = useState(DEFAULT_PAGINATION);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState({});

  const adminForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      password: "",
      jobTitle: "",
    },
  });

  const employeeCreateForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      password: "",
      jobTitle: "",
    },
  });

  const employeeEditForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
    },
  });

  const loadAllData = useCallback(
    async ({ keepEditingEmployee = false } = {}) => {
      try {
        setLoading(true);

        const [adminsResponse, employeesResponse] = await Promise.all([
          companyAdminService.list({
            page: adminPage,
            pageSize: adminPageSize,
            search: adminSearchTerm,
            adminRole: adminRoleFilter,
          }),
          companyAdminService.listEmployees({
            page: employeePage,
            pageSize: employeePageSize,
            search: employeeSearchTerm,
          }),
        ]);

        const companyData =
          adminsResponse.company || employeesResponse.company || null;

        setCompany(companyData);
        setAdmins(adminsResponse.admins || []);
        setEmployees(employeesResponse.employees || []);
        setAdminPagination(
          adminsResponse.pagination ||
            buildFallbackPagination(adminsResponse.admins || [], adminPageSize),
        );
        setEmployeePagination(
          employeesResponse.pagination ||
            buildFallbackPagination(employeesResponse.employees || [], employeePageSize),
        );

        if (
          adminsResponse.pagination?.page &&
          adminsResponse.pagination.page !== adminPage
        ) {
          setAdminPage(adminsResponse.pagination.page);
        }

        if (
          employeesResponse.pagination?.page &&
          employeesResponse.pagination.page !== employeePage
        ) {
          setEmployeePage(employeesResponse.pagination.page);
        }

        if (!keepEditingEmployee) {
          setEditingEmployeeId(null);
        }
      } catch (error) {
        showSnack({
          variant: "error",
          message:
            error?.response?.data?.message ||
            "Não foi possível carregar os dados da empresa.",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      adminPage,
      adminPageSize,
      adminRoleFilter,
      adminSearchTerm,
      employeePage,
      employeePageSize,
      employeeSearchTerm,
      showSnack,
    ],
  );

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAdminPage(1);
      setAdminSearchTerm(adminSearch.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [adminSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEmployeePage(1);
      setEmployeeSearchTerm(employeeSearch.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [employeeSearch]);

  const createAdmin = async (formData) => {
    try {
      setSaving(true);
      await companyAdminService.add(formData);
      adminForm.reset();
      await loadAllData();
      showSnack({
        variant: "success",
        message: "Administrador associado com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Erro ao criar administrador.",
      });
    } finally {
      setSaving(false);
    }
  };

  const associateExistingAdmin = async () => {
    if (!associateEmail.trim()) {
      showSnack({
        variant: "warning",
        message: "Informe o e-mail para associar.",
      });
      return;
    }

    try {
      setSaving(true);
      await companyAdminService.add({ email: associateEmail.trim() });
      setAssociateEmail("");
      await loadAllData();
      showSnack({
        variant: "success",
        message: "Administrador associado com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Erro ao associar administrador.",
      });
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (adminUserId) => {
    try {
      setSaving(true);
      await companyAdminService.setPrimary(adminUserId);
      await loadAllData();
      showSnack({
        variant: "success",
        message: "Administrador principal atualizado.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message ||
          "Erro ao trocar administrador principal.",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAdmin = async (adminUserId) => {
    try {
      setSaving(true);
      await companyAdminService.remove(adminUserId);
      await loadAllData();
      showSnack({ variant: "success", message: "Administrador removido." });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Erro ao remover administrador.",
      });
    } finally {
      setSaving(false);
    }
  };

  const createEmployee = async (formData) => {
    try {
      setSaving(true);
      await companyAdminService.addEmployee(formData);
      employeeCreateForm.reset();
      await loadAllData();
      showSnack({
        variant: "success",
        message: "Funcionário criado com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message: error?.response?.data?.message || "Erro ao criar funcionário.",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditEmployee = (employee) => {
    setEditingEmployeeId(employee.id);
    employeeEditForm.reset({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      jobTitle: employee.jobTitle || "",
    });
  };

  const cancelEditEmployee = () => {
    setEditingEmployeeId(null);
    employeeEditForm.reset({
      name: "",
      email: "",
      phone: "",
      jobTitle: "",
    });
  };

  const saveEmployeeEdition = async (formData) => {
    if (!editingEmployeeId) return;

    try {
      setSaving(true);
      await companyAdminService.updateEmployee(editingEmployeeId, formData);
      setEditingEmployeeId(null);
      await loadAllData();
      showSnack({
        variant: "success",
        message: "Funcionário atualizado com sucesso.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Erro ao atualizar funcionário.",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeEmployee = async (employeeUserId) => {
    try {
      setSaving(true);
      await companyAdminService.removeEmployee(employeeUserId);
      await loadAllData();
      if (editingEmployeeId === employeeUserId) {
        cancelEditEmployee();
      }
      showSnack({
        variant: "success",
        message: "Funcionário removido da empresa.",
      });
    } catch (error) {
      showSnack({
        variant: "error",
        message:
          error?.response?.data?.message || "Erro ao remover funcionário.",
      });
    } finally {
      setSaving(false);
    }
  };

  const editingEmployee =
    employees.find((employee) => employee.id === editingEmployeeId) || null;

  const adminTotal = adminPagination.total ?? admins.length;
  const employeeTotal = employeePagination.total ?? employees.length;

  const handleAvatarError = (avatarKey) => {
    setAvatarLoadErrors((previous) => ({
      ...previous,
      [avatarKey]: true,
    }));
  };

  const renderPersonAvatar = (person, avatarKeyPrefix) => {
    const avatarKey = `${avatarKeyPrefix}-${person.id || person.email || person.name}`;
    const avatarUrl = getAvatarUrl(person);
    const shouldShowAvatarImage = Boolean(avatarUrl) && !avatarLoadErrors[avatarKey];

    return (
      <S.PersonAvatar aria-hidden="true">
        {shouldShowAvatarImage ? (
          <S.PersonAvatarImage
            src={avatarUrl}
            alt=""
            onError={() => handleAvatarError(avatarKey)}
          />
        ) : (
          getPersonInitials(person.name)
        )}
      </S.PersonAvatar>
    );
  };

  const renderPagination = ({
    pagination,
    onPageChange,
    onPageSizeChange,
  }) => {
    const page = pagination.page || DEFAULT_PAGINATION.page;
    const pageSize = pagination.pageSize || DEFAULT_PAGINATION.pageSize;
    const total = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(total, page * pageSize);

    return (
      <S.PaginationBar>
        <S.PageSummary>
          {total === 0
            ? "Nenhum resultado"
            : `${startItem}-${endItem} de ${total} resultado(s)`}
        </S.PageSummary>

        <S.PageControls>
          <S.PageSizeLabel>
            Exibir
            <S.PageSizeSelect
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </S.PageSizeSelect>
          </S.PageSizeLabel>

          <S.PaginationActions>
            <S.PaginationButton
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </S.PaginationButton>
            <S.PageIndicator>
              Página {page} de {totalPages}
            </S.PageIndicator>
            <S.PaginationButton
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </S.PaginationButton>
          </S.PaginationActions>
        </S.PageControls>
      </S.PaginationBar>
    );
  };

  return (
    <S.Page>
      <LoggedHeader />

      <S.Container>
        <S.Card>
          <S.HeaderRow>
            <div>
              <S.CardTitle>Colaboradores da empresa</S.CardTitle>
              {!loading && company && (
                <S.CardText>
                  {company.name} - CNPJ: {company.cnpj}
                </S.CardText>
              )}
            </div>
            <S.HeaderStats>
              <S.Stat>
                <span>Administradores</span>
                <strong>{adminTotal}</strong>
              </S.Stat>
              <S.Stat>
                <span>Funcionários</span>
                <strong>{employeeTotal}</strong>
              </S.Stat>
            </S.HeaderStats>
          </S.HeaderRow>
        </S.Card>

        <S.Card>
          <S.TabsHeader>
            <S.TabButton
              type="button"
              data-active={activeTab === "employees"}
              onClick={() => setActiveTab("employees")}
            >
              Funcionários <S.TabCount>{employeeTotal}</S.TabCount>
            </S.TabButton>
            <S.TabButton
              type="button"
              data-active={activeTab === "admins"}
              onClick={() => setActiveTab("admins")}
            >
              Administradores <S.TabCount>{adminTotal}</S.TabCount>
            </S.TabButton>
          </S.TabsHeader>

          {activeTab === "employees" && (
            <S.TabContent>
              <S.TabHeader>
                <div>
                  <S.SectionTitle>Funcionários</S.SectionTitle>
                  <S.TabDescription>
                    Pesquise, edite e remova funcionários vinculados à empresa.
                  </S.TabDescription>
                </div>
              </S.TabHeader>

              <S.ActionBar>
                <S.SearchInput
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                  placeholder="Buscar por nome, e-mail ou cargo"
                />
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setShowEmployeeForm((prev) => !prev)}
                  disabled={saving}
                >
                  {showEmployeeForm ? "Fechar cadastro" : "Criar funcionário"}
                </Button>
              </S.ActionBar>

              {showEmployeeForm && (
                <S.Panel>
                  <S.Form onSubmit={employeeCreateForm.handleSubmit(createEmployee)}>
                    <S.FormTitle>Criar novo funcionário</S.FormTitle>
                    <Input
                      label="Nome:"
                      placeholder="Nome completo"
                      type="text"
                      register={employeeCreateForm.register("name")}
                    />
                    <Input
                      label="E-mail:"
                      placeholder="funcionario@empresa.com"
                      type="text"
                      register={employeeCreateForm.register("email")}
                    />
                    <PhoneInput
                      label="Telefone:"
                      placeholder="(11) 99999-9999"
                      control={employeeCreateForm.control}
                      name="phone"
                    />
                    <CpfInput
                      label="CPF:"
                      placeholder="000.000.000-00"
                      control={employeeCreateForm.control}
                      name="cpf"
                    />
                    <Input
                      label="Cargo:"
                      placeholder="Ex: Analista de Atendimento"
                      type="text"
                      register={employeeCreateForm.register("jobTitle")}
                    />
                    <Input
                      label="Senha:"
                      placeholder="Senha"
                      type="password"
                      register={employeeCreateForm.register("password")}
                    />
                    <Button variant="primary" type="submit" disabled={saving}>
                      Criar funcionário
                    </Button>
                  </S.Form>
                </S.Panel>
              )}

              <S.InfosContainer>
                {loading && <p>Carregando funcionários...</p>}
                {!loading && employees.length === 0 && (
                  <S.EmptyState>Nenhum funcionário encontrado.</S.EmptyState>
                )}
                {!loading &&
                  employees.map((employee) => (
                    <S.ItemRow key={employee.id}>
                      <S.PersonRow>
                        {renderPersonAvatar(employee, "employee")}
                        <S.PersonContent>
                          <S.PersonHeader>
                            <strong>{employee.name}</strong>
                            <span>{employee.email}</span>
                          </S.PersonHeader>
                          <S.InfoRow>
                            CPF: {employee.cpf || "-"} | Telefone:{" "}
                            {employee.phone || "-"} | Cargo: {employee.jobTitle || "-"}
                          </S.InfoRow>
                          <S.RowActions>
                            <Button
                              variant="transparent"
                              type="button"
                              redirect={`/empresa/administradores/desempenho/${employee.id}`}
                            >
                              Ver desempenho
                            </Button>
                            {employee.isAdmin ? (
                              <Button
                                variant="transparent"
                                type="button"
                                onClick={() => setActiveTab("admins")}
                              >
                                Gerenciar na aba Administradores
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="transparent"
                                  type="button"
                                  disabled={saving}
                                  onClick={() => startEditEmployee(employee)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="secondary"
                                  type="button"
                                  disabled={saving}
                                  onClick={() => removeEmployee(employee.id)}
                                >
                                  Remover da empresa
                                </Button>
                              </>
                            )}
                          </S.RowActions>
                        </S.PersonContent>
                      </S.PersonRow>
                    </S.ItemRow>
                  ))}
              </S.InfosContainer>

              {!loading &&
                renderPagination({
                  pagination: employeePagination,
                  onPageChange: setEmployeePage,
                  onPageSizeChange: (nextPageSize) => {
                    setEmployeePageSize(nextPageSize);
                    setEmployeePage(1);
                  },
                })}

              {editingEmployee && (
                <S.Panel>
                  <S.Form onSubmit={employeeEditForm.handleSubmit(saveEmployeeEdition)}>
                    <S.FormTitle>Editar funcionário</S.FormTitle>
                    <Input
                      label="Nome:"
                      placeholder="Nome completo"
                      type="text"
                      register={employeeEditForm.register("name")}
                    />
                    <Input
                      label="E-mail:"
                      placeholder="funcionario@empresa.com"
                      type="text"
                      register={employeeEditForm.register("email")}
                    />
                    <PhoneInput
                      label="Telefone:"
                      placeholder="(11) 99999-9999"
                      control={employeeEditForm.control}
                      name="phone"
                    />
                    <Input
                      label="Cargo:"
                      placeholder="Ex: Analista de Atendimento"
                      type="text"
                      register={employeeEditForm.register("jobTitle")}
                    />
                    <S.ReadOnlyInfo>
                      <strong>CPF bloqueado:</strong> {editingEmployee.cpf || "-"}
                    </S.ReadOnlyInfo>
                    <S.RowActions>
                      <Button variant="primary" type="submit" disabled={saving}>
                        Salvar funcionário
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        disabled={saving}
                        onClick={cancelEditEmployee}
                      >
                        Cancelar
                      </Button>
                    </S.RowActions>
                  </S.Form>
                </S.Panel>
              )}
            </S.TabContent>
          )}

          {activeTab === "admins" && (
            <S.TabContent>
              <S.TabHeader>
                <div>
                  <S.SectionTitle>Administradores</S.SectionTitle>
                  <S.TabDescription>
                    Associe um administrador existente ou crie um novo para a empresa.
                  </S.TabDescription>
                </div>
              </S.TabHeader>

              <S.ActionBar>
                <S.FilterRow>
                  <S.SearchInput
                    value={adminSearch}
                    onChange={(event) => setAdminSearch(event.target.value)}
                    placeholder="Buscar por nome, e-mail ou cargo"
                  />
                  <S.FilterSelect
                    value={adminRoleFilter}
                    onChange={(event) => {
                      setAdminRoleFilter(event.target.value);
                      setAdminPage(1);
                    }}
                  >
                    <option value="all">Todos os vínculos</option>
                    <option value="primary">Principal</option>
                    <option value="secondary">Demais administradores</option>
                  </S.FilterSelect>
                </S.FilterRow>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setShowAdminPanel((prev) => !prev)}
                  disabled={saving}
                >
                  {showAdminPanel ? "Fechar painel" : "Associar administrador"}
                </Button>
              </S.ActionBar>

              {showAdminPanel && (
                <S.Panel>
                  <S.AdminPanelLayout>
                    <S.AssociateStrip>
                      <S.AssociateTitle>Associar administrador existente</S.AssociateTitle>
                      <S.AssociateControls>
                        <S.AssociateEmailGroup>
                          <S.Label>E-mail do administrador:</S.Label>
                          <S.AssociateEmailInput
                            value={associateEmail}
                            onChange={(event) => setAssociateEmail(event.target.value)}
                            placeholder="usuario@empresa.com"
                          />
                        </S.AssociateEmailGroup>
                        <S.AssociateActions>
                          <Button
                            variant="primary"
                            type="button"
                            onClick={associateExistingAdmin}
                            disabled={saving}
                            full
                          >
                            Associar
                          </Button>
                        </S.AssociateActions>
                      </S.AssociateControls>
                    </S.AssociateStrip>

                    <S.PanelDivider />

                    <S.Form onSubmit={adminForm.handleSubmit(createAdmin)}>
                      <S.FormTitle>Criar novo administrador</S.FormTitle>
                      <S.AdminFormGrid>
                        <Input
                          label="Nome:"
                          placeholder="Nome completo"
                          type="text"
                          register={adminForm.register("name")}
                        />
                        <Input
                          label="E-mail:"
                          placeholder="usuario@empresa.com"
                          type="text"
                          register={adminForm.register("email")}
                        />
                        <PhoneInput
                          label="Telefone:"
                          placeholder="(11) 99999-9999"
                          control={adminForm.control}
                          name="phone"
                        />
                        <CpfInput
                          label="CPF:"
                          placeholder="000.000.000-00"
                          control={adminForm.control}
                          name="cpf"
                        />
                        <Input
                          label="Cargo:"
                          placeholder="Ex: Coordenador de Suporte"
                          type="text"
                          register={adminForm.register("jobTitle")}
                        />
                        <Input
                          label="Senha:"
                          placeholder="Senha"
                          type="password"
                          register={adminForm.register("password")}
                        />
                      </S.AdminFormGrid>
                      <S.FormActions>
                        <Button variant="primary" type="submit" disabled={saving} full>
                          Criar e associar admin
                        </Button>
                      </S.FormActions>
                    </S.Form>
                  </S.AdminPanelLayout>
                </S.Panel>
              )}

              <S.AdminsGroup>
                {loading && <p>Carregando administradores...</p>}
                {!loading && admins.length === 0 && (
                  <S.EmptyState>Nenhum administrador encontrado.</S.EmptyState>
                )}
                {!loading &&
                  admins.map((admin) => (
                    <S.ItemRow key={admin.id}>
                      <S.PersonRow>
                        {renderPersonAvatar(admin, "admin")}
                        <S.PersonContent>
                          <S.PersonHeader>
                            <strong>{admin.name}</strong>
                            <span>{admin.email}</span>
                            {admin.isPrimary && <S.Badge>Principal</S.Badge>}
                          </S.PersonHeader>
                          <S.InfoRow>
                            CPF: {admin.cpf || "-"} | Telefone: {admin.phone || "-"} |
                            Cargo: {admin.jobTitle || "-"}
                          </S.InfoRow>
                          <S.RowActions>
                            <Button
                              variant="transparent"
                              type="button"
                              disabled={saving || admin.isPrimary}
                              onClick={() => setPrimary(admin.id)}
                            >
                              Tornar principal
                            </Button>
                            <Button
                              variant="secondary"
                              type="button"
                              disabled={saving}
                              onClick={() => removeAdmin(admin.id)}
                            >
                              Remover
                            </Button>
                          </S.RowActions>
                        </S.PersonContent>
                      </S.PersonRow>
                    </S.ItemRow>
                  ))}
              </S.AdminsGroup>

              {!loading &&
                renderPagination({
                  pagination: adminPagination,
                  onPageChange: setAdminPage,
                  onPageSizeChange: (nextPageSize) => {
                    setAdminPageSize(nextPageSize);
                    setAdminPage(1);
                  },
                })}
            </S.TabContent>
          )}
        </S.Card>
      </S.Container>
    </S.Page>
  );
};

export default CompanyAdminsPage;
