"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AdminPageHeaderContextValue = {
  content: React.ReactNode;
  setContent: (content: React.ReactNode) => void;
};

const AdminPageHeaderContext = createContext<AdminPageHeaderContextValue | null>(
  null,
);

export function AdminPageHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<React.ReactNode>(null);

  const value = useMemo(
    () => ({
      content,
      setContent,
    }),
    [content],
  );

  return (
    <AdminPageHeaderContext.Provider value={value}>
      {children}
    </AdminPageHeaderContext.Provider>
  );
}

export function useAdminPageHeader() {
  const context = useContext(AdminPageHeaderContext);

  if (!context) {
    throw new Error("useAdminPageHeader must be used within AdminPageHeaderProvider.");
  }

  return context;
}

export function AdminPageHeaderSlot({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setContent } = useAdminPageHeader();
  const stableChildren = useRef(children);

  useEffect(() => {
    setContent(stableChildren.current);

    return () => {
      setContent(null);
    };
  }, [setContent]);

  return null;
}
