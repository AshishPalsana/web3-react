import { createContext, useContext, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { setLoader, setNoLimit } from "../store/reducer";
import { ApiAuth, ApiCall } from "../utils/ApiUtils";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenId = searchParams.get("token");
  const dispatch = useDispatch();

  useEffect(() => {
    if (tokenId) {
      localStorage.setItem("token", tokenId);
    }
  }, [tokenId]);

  const login = async (data, pathname = "/") => {
    dispatch(setLoader(true));
    const resp = await ApiAuth(data);
    if (resp || tokenId) {
      setUser(resp);
      localStorage.setItem("token", resp.token);
      if (pathname === "/") navigate("/manage");
      else navigate(pathname);
      const LimitsResult = await ApiCall("GET", `/rest/allowlist/getAllowListLimits`);
      dispatch(
        setNoLimit({
          numberOfGroups: LimitsResult?.data?.maxAllowListGroups,
          numberOfAllowlist: LimitsResult?.data?.maxAllowLists,
          allowListMaxDiscordRolesInServer: LimitsResult?.data?.allowListMaxDiscordRolesInServer,
          allowListMaxDiscordServers: LimitsResult?.data?.allowListMaxDiscordServers,
        })
      );
    }
    dispatch(setLoader(false));
  };

  const logout = (redirect = true) => {
    setUser(null);
    localStorage.clear();
    if (redirect) window.location.replace("/");
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
