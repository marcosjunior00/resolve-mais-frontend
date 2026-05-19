import styled from "styled-components";

export const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  height: 70px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

export const Logo = styled.img`
  height: 40px;
  width: auto;
`;

export const NavSection = styled.nav`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const NavList = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 3rem;
`;

export const NavItem = styled.li`
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  color: ${({ $active }) => ($active ? "#10b981" : "#2c3e50")};
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  cursor: pointer;
  padding: 0.5rem 0;
  border-bottom: ${({ $active }) =>
    $active ? "2px solid #10b981" : "2px solid transparent"};
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: #10b981;
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
  position: relative;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const UserName = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2px;
`;

export const UserMenuContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

export const UserAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

export const LogoutButtonInline = styled.button`
  background: #fff;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #e74c3c;
    color: #fff;
  }
`;
