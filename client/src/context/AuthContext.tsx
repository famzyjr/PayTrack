
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  SESSION_EXPIRED_EVENT,
  TOKEN_KEY,
} from "../services/api";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  type AuthUser,
  type LoginData,
  type RegisterData,
} from "../services/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);



export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the user's session when the application starts.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const savedToken = sessionStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getCurrentUser(savedToken);

        if (cancelled) return;

        setToken(savedToken);
        setUser(response.user);
      } catch {
        if (cancelled) return;

        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
  const handleSessionExpired = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  window.addEventListener(
    SESSION_EXPIRED_EVENT,
    handleSessionExpired
  );

  return () => {
    window.removeEventListener(
      SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );
  };
}, []);

  // Log in an existing user.
  const login = async (data: LoginData): Promise<void> => {
    const response = await loginUser(data);

    sessionStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  };

  // Register a new user and start their session.
  const register = async (data: RegisterData): Promise<void> => {
    const response = await registerUser(data);

    sessionStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  };

  // Clear the current browser session.
  const logout = (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
}
