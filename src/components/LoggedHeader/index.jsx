import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logoImage from "../../../assets/flaticon.svg";
import {
  getHomePathByUserType,
  getUserSettingsPathByUserType,
  normalizeUserType,
  USER_TYPES,
} from "../../utils/userType";
import * as S from "./styles";

const LoggedHeader = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const userType = normalizeUserType(userData?.userType);
  const settingsPath = getUserSettingsPathByUserType(userType);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [userData?.avatarUrl]);

  const menuItems = useMemo(() => {
    if (userType === USER_TYPES.CLIENTE) {
      return [
        { key: "configuracoes", label: "Configurações", path: "/cliente/configuracoes" },
        { key: "home", label: "Home", path: "/cliente/home" },
        { key: "atendimentos", label: "Atendimentos", path: "/cliente/pending-tickets" },
      ];
    }

    if (userType === USER_TYPES.EMPRESA) {
      return [
        { key: "home", label: "Home", path: "/empresa/home" },
        { key: "insights", label: "Insights", path: "/empresa/insights" },
        { key: "tickets", label: "Chamados", path: "/empresa/chamados" },
        { key: "configuracoes", label: "Configurações", path: "/empresa/configuracoes" },
        { key: "admins", label: "Colaboradores", path: "/empresa/administradores" },
      ];
    }

    if (userType === USER_TYPES.FUNCIONARIO) {
      return [
        { key: "home", label: "Home", path: "/funcionario/home" },
        { key: "configuracoes", label: "Configurações", path: "/funcionario/configuracoes" },
        { key: "atendimentos", label: "Atendimentos", path: "/funcionario/atendimentos" },
      ];
    }

    return [{ key: "home", label: "Home", path: getHomePathByUserType(userType) }];
  }, [userType]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenSettings = () => {
    navigate(settingsPath);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActivePage = (path) => {
    const currentPath = location.pathname.toLowerCase();
    return currentPath === path.toLowerCase();
  };

  const getUserInitials = () => {
    if (!userData?.name) return "GS";
    const names = userData.name.trim().split(" ").filter(Boolean);
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <S.HeaderContainer>
      <S.LeftSection>
        <S.Logo src={logoImage} alt="Resolve + Logo" />
      </S.LeftSection>

      <S.NavSection>
        <S.NavList>
          {menuItems.map((item) => (
            <S.NavItem
              key={item.key}
              $active={isActivePage(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </S.NavItem>
          ))}
        </S.NavList>
      </S.NavSection>

      <S.RightSection>
        <S.UserInfo>
          <S.UserName>{userData?.name || ""}</S.UserName>
        </S.UserInfo>

        <S.UserMenuContainer>
          <S.UserAvatar onClick={handleOpenSettings} title="Abrir configurações do usuário">
            {userData?.avatarUrl && !avatarLoadError ? (
              <S.UserAvatarImage
                src={userData.avatarUrl}
                alt="Foto do usuário"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              getUserInitials()
            )}
          </S.UserAvatar>
        </S.UserMenuContainer>

        <S.LogoutButtonInline onClick={handleLogout} type="button">
          Sair
        </S.LogoutButtonInline>
      </S.RightSection>
    </S.HeaderContainer>
  );
};

export default LoggedHeader;
