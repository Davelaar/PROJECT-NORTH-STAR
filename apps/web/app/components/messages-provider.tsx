"use client";

import { createContext, useContext } from "react";
import type { Locale, Messages } from "@/lib/messages/types";
import { messages as en } from "@/lib/messages/en";

const MessagesContext = createContext<{ locale: Locale; messages: Messages }>({
  locale: "en",
  messages: en,
});

export function MessagesProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <MessagesContext.Provider value={{ locale, messages }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages(): Messages {
  return useContext(MessagesContext).messages;
}

export function useLocale(): Locale {
  return useContext(MessagesContext).locale;
}
