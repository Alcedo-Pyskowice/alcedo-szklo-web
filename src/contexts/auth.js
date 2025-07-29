import { LocalStore } from 'devextreme/common/data';
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getUser, getUserLocal, signIn as sendSignInRequest } from '../api/auth';


function AuthProvider(props) {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (function() {
      const result = getUserLocal();
      if (result.isOk) {
        setUser(result.data);
      }

      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await sendSignInRequest(email, password);
    if (result.isOk) {
      setUser(result.data);

    }

    return result;
  }, []);

  const signOut = useCallback(() => {
    setUser(undefined);
    localStorage.removeItem("token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("name")
  }, []);


  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }} {...props} />
  );
}

const AuthContext = createContext({ loading: false });
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth }
