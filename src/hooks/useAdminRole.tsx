import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  setAsAdmin: () => void;
  unsetAsAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const setAsAdmin = () => setIsAdmin(true);
  const unsetAsAdmin = () => setIsAdmin(false);

  return (
    <AdminContext.Provider value={{ isAdmin, setAsAdmin, unsetAsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminRole = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminRole must be used within an AdminProvider');
  }
  return context;
};
