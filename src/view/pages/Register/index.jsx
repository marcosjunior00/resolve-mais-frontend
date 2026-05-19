import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Button from "../../../components/Button";
import Input from "../../../components/Input";
import PhoneInput from "../../../components/PhoneInput";
import CpfInput from "../../../components/CpfInput";
import CnpjInput from "../../../components/CnpjInput";
import * as S from "./styles";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";
import Logo from "../../../../assets/images/logo.png";
import RegisterImage from "../../../../assets/images/register.png";
import {
  PUBLIC_REGISTER_USER_TYPE_OPTIONS,
  USER_TYPES,
  getHomePathByUserType,
  isCompanyUser,
  normalizeUserType,
} from "../../../utils/userType";

const schema = yup.object().shape({
  userType: yup
    .string()
    .oneOf(
      PUBLIC_REGISTER_USER_TYPE_OPTIONS.map((option) => option.value),
      "Tipo de usuário inválido",
    )
    .required("Tipo de usuário é obrigatório"),

  name: yup.string().when("userType", {
    is: (value) => value !== USER_TYPES.EMPRESA,
    then: (rule) => rule.required("Nome é obrigatório"),
    otherwise: (rule) => rule.nullable(),
  }),

  phone: yup.string().when("userType", {
    is: (value) => value !== USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .required("Telefone é obrigatório")
        .matches(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, "Telefone inválido"),
    otherwise: (rule) => rule.nullable(),
  }),

  cpf: yup.string().when("userType", {
    is: (value) => value !== USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .required("CPF é obrigatório")
        .matches(
          /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          "CPF deve estar no formato 000.000.000-00",
        ),
    otherwise: (rule) => rule.nullable(),
  }),

  email: yup.string().when("userType", {
    is: (value) => value !== USER_TYPES.EMPRESA,
    then: (rule) =>
      rule.email("E-mail inválido").required("E-mail é obrigatório"),
    otherwise: (rule) => rule.nullable(),
  }),

  password: yup.string().when("userType", {
    is: (value) => value !== USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .min(6, "Senha deve ter pelo menos 6 caracteres")
        .required("Senha é obrigatória"),
    otherwise: (rule) => rule.nullable(),
  }),

  companyName: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) => rule.required("Nome da empresa é obrigatório"),
    otherwise: (rule) => rule.nullable(),
  }),

  companyDescription: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) => rule.required("Descrição é obrigatória"),
    otherwise: (rule) => rule.nullable(),
  }),

  companyCnpj: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .required("CNPJ é obrigatório")
        .matches(
          /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
          "CNPJ deve estar no formato 00.000.000/0000-00",
        ),
    otherwise: (rule) => rule.nullable(),
  }),

  adminName: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) => rule.required("Nome do administrador é obrigatório"),
    otherwise: (rule) => rule.nullable(),
  }),

  adminPhone: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .required("Telefone do administrador é obrigatório")
        .matches(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, "Telefone inválido"),
    otherwise: (rule) => rule.nullable(),
  }),

  adminCpf: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .required("CPF do administrador é obrigatório")
        .matches(
          /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          "CPF deve estar no formato 000.000.000-00",
        ),
    otherwise: (rule) => rule.nullable(),
  }),

  adminEmail: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .email("E-mail inválido")
        .required("E-mail do administrador é obrigatório"),
    otherwise: (rule) => rule.nullable(),
  }),

  adminPassword: yup.string().when("userType", {
    is: USER_TYPES.EMPRESA,
    then: (rule) =>
      rule
        .min(6, "Senha deve ter pelo menos 6 caracteres")
        .required("Senha do administrador é obrigatória"),
    otherwise: (rule) => rule.nullable(),
  }),
});

const Register = () => {
  const { userData, isLoggedIn, logout, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const redirectPath = searchParams.get("redirect") || "";
  const loginPath = redirectPath
    ? `/login?redirect=${encodeURIComponent(redirectPath)}`
    : "/login";
  const resolvePostAuthPath = (userType) => {
    const normalizedUserType = normalizeUserType(userType);

    if (
      redirectPath &&
      (!redirectPath.startsWith("/cliente/") ||
        normalizedUserType === USER_TYPES.CLIENTE)
    ) {
      return redirectPath;
    }

    return getHomePathByUserType(userType);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userType: USER_TYPES.CLIENTE,
    },
  });

  const selectedUserType = watch("userType");
  const companySelected = isCompanyUser(selectedUserType);

  useEffect(() => {
    if (companySelected) {
      setValue("name", "", { shouldValidate: false });
      setValue("phone", "", { shouldValidate: false });
      setValue("cpf", "", { shouldValidate: false });
      setValue("email", "", { shouldValidate: false });
      setValue("password", "", { shouldValidate: false });
      return;
    }

    setValue("companyName", "", { shouldValidate: false });
    setValue("companyDescription", "", { shouldValidate: false });
    setValue("companyCnpj", "", { shouldValidate: false });
    setValue("adminName", "", { shouldValidate: false });
    setValue("adminPhone", "", { shouldValidate: false });
    setValue("adminCpf", "", { shouldValidate: false });
    setValue("adminEmail", "", { shouldValidate: false });
    setValue("adminPassword", "", { shouldValidate: false });
  }, [companySelected, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      let payload = null;

      if (companySelected) {
        payload = {
          userType: USER_TYPES.EMPRESA,
          companyName: data.companyName,
          companyDescription: data.companyDescription,
          companyCnpj: data.companyCnpj,
          adminUser: {
            name: data.adminName,
            phone: data.adminPhone,
            cpf: data.adminCpf,
            email: data.adminEmail,
            password: data.adminPassword,
          },
        };
      } else {
        payload = {
          userType: data.userType,
          name: data.name,
          phone: data.phone,
          cpf: data.cpf,
          email: data.email,
          password: data.password,
        };
      }

      const response = await api.post("/auth/register", payload);

      if (response.status === 201 && response.data?.token) {
        const { user, token } = response.data;
        login({ user, token });
        navigate(resolvePostAuthPath(user?.userType), { replace: true });
      } else {
        alert("Erro ao fazer cadastro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error);
      alert("Erro ao fazer cadastro. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData?.id && !isLoggedIn) {
      logout();
      return;
    }

    navigate(resolvePostAuthPath(userData?.userType), { replace: true });
  }, [userData, isLoggedIn, logout, navigate, redirectPath]);

  return (
    <S.Container>
      <S.GlobalStyle />

      <S.LogoContainer href="/">
        <S.Logo src={Logo} alt="Resolve Mais" />
      </S.LogoContainer>

      <S.Content>
        <S.Left>
          <S.Image src={RegisterImage} alt="Register" />
          <S.Text>Comece agora</S.Text>
          <S.SubText>
            Crie sua conta e acompanhe o status dos chamados.
          </S.SubText>
        </S.Left>

        <S.Right>
          <S.FormHeader>
            <S.FormTitle>Criar conta</S.FormTitle>
            <S.FormSubtitle>
              Cadastro para clientes ou empresas.
            </S.FormSubtitle>
          </S.FormHeader>

          <S.Form onSubmit={handleSubmit(onSubmit)}>
            <S.UserTypeGroup>
              <S.UserTypeLabel>Tipo de usuário:</S.UserTypeLabel>
              <S.UserTypeButtons>
                {PUBLIC_REGISTER_USER_TYPE_OPTIONS.map((option) => (
                  <S.UserTypeOption key={option.value}>
                    <S.UserTypeRadio
                      type="radio"
                      value={option.value}
                      {...register("userType")}
                    />
                    <S.UserTypeText>{option.label}</S.UserTypeText>
                  </S.UserTypeOption>
                ))}
              </S.UserTypeButtons>
              {errors.userType && (
                <S.UserTypeError>{errors.userType.message}</S.UserTypeError>
              )}
            </S.UserTypeGroup>

            {!companySelected && (
              <>
                <Input
                  label="Nome:"
                  placeholder="Digite seu nome"
                  type="text"
                  register={register("name")}
                  errors={errors.name}
                />

                <PhoneInput
                  label="Telefone:"
                  placeholder="(11) 99999-9999"
                  control={control}
                  name="phone"
                  errors={errors.phone}
                />

                <CpfInput
                  label="CPF:"
                  placeholder="000.000.000-00"
                  control={control}
                  name="cpf"
                  errors={errors.cpf}
                />

                <Input
                  label="E-mail:"
                  placeholder="Digite o e-mail"
                  type="text"
                  register={register("email")}
                  errors={errors.email}
                />

                <Input
                  label="Senha:"
                  placeholder="Digite a senha"
                  type="password"
                  register={register("password")}
                  errors={errors.password}
                />
              </>
            )}

            {companySelected && (
              <>
                <S.SectionTitle>Dados da empresa</S.SectionTitle>
                <Input
                  label="Nome da empresa:"
                  placeholder="Digite o nome da empresa"
                  type="text"
                  register={register("companyName")}
                  errors={errors.companyName}
                />

                <Input
                  label="Descrição:"
                  placeholder="Descreva brevemente a empresa"
                  type="text"
                  register={register("companyDescription")}
                  errors={errors.companyDescription}
                />

                <CnpjInput
                  label="CNPJ:"
                  placeholder="00.000.000/0000-00"
                  control={control}
                  name="companyCnpj"
                  errors={errors.companyCnpj}
                />

                <S.SectionTitle>Administrador inicial</S.SectionTitle>
                <Input
                  label="Nome do administrador:"
                  placeholder="Digite o nome"
                  type="text"
                  register={register("adminName")}
                  errors={errors.adminName}
                />

                <PhoneInput
                  label="Telefone do administrador:"
                  placeholder="(11) 99999-9999"
                  control={control}
                  name="adminPhone"
                  errors={errors.adminPhone}
                />

                <CpfInput
                  label="CPF do administrador:"
                  placeholder="000.000.000-00"
                  control={control}
                  name="adminCpf"
                  errors={errors.adminCpf}
                />

                <Input
                  label="E-mail do administrador:"
                  placeholder="Digite o e-mail"
                  type="text"
                  register={register("adminEmail")}
                  errors={errors.adminEmail}
                />

                <Input
                  label="Senha do administrador:"
                  placeholder="Digite a senha"
                  type="password"
                  register={register("adminPassword")}
                  errors={errors.adminPassword}
                />
              </>
            )}

            <S.Actions>
              <Button variant="transparent" redirect={loginPath} full>
                Login
              </Button>
              <Button variant="primary" type="submit" disabled={loading} full>
                Cadastrar
              </Button>
            </S.Actions>
          </S.Form>
        </S.Right>
      </S.Content>
    </S.Container>
  );
};

export default Register;
