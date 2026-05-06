import { createContext, useContext, useState, useCallback } from "react";
import AlertModal from "../components/AlertModal";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [state, setState] = useState(null);

  const showAlert = useCallback((message, type = "info", title) => {
    return new Promise((resolve) => {
      setState({ message, title, type, resolve, isConfirm: false });
    });
  }, []);

  const showConfirm = useCallback((message, title) => {
    return new Promise((resolve) => {
      setState({ message, title, type: "confirm", resolve, isConfirm: true });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {state && (
        <AlertModal
          isOpen={true}
          type={state.type}
          title={state.title}
          message={state.message}
          isConfirm={state.isConfirm}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
