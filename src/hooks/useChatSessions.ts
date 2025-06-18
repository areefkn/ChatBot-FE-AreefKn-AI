"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// Definisikan tipe di sini atau impor dari file types global jika ada
export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  pinnedMessageIds?: string[];
  createdAt: Date;
  isPinned?: boolean;
  lastMessagePreview?: string;
}

const LOCAL_STORAGE_SESSIONS_KEY = "chatSessions_areefkn_v2";
const LAST_MESSAGE_PREVIEW_LENGTH = 40;
const MAX_PINNED_MESSAGES = 3;

function generateLastMessagePreview(messages: ChatMessage[]): string {
  if (messages.length === 0) {
    return "Belum ada pesan";
  }
  const lastMessageText = messages[messages.length - 1].text;
  return (
    lastMessageText.substring(0, LAST_MESSAGE_PREVIEW_LENGTH) +
    (lastMessageText.length > LAST_MESSAGE_PREVIEW_LENGTH ? "..." : "")
  );
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const storedSessions = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (storedSessions) {
      try {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions).map(
          (session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            isPinned: session.isPinned || false,
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
            lastMessagePreview: generateLastMessagePreview(session.messages), // Pastikan ini selalu terisi
            pinnedMessageIds: session.pinnedMessageIds || [],
          })
        );
        setSessions(parsedSessions);
      } catch (error) {
        console.error("Gagal memuat sesi dari localStorage:", error);
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const createNewSessionHook = useCallback(
    (baseName: string = "Percakapan"): ChatSession => {
      const newSessionId = `session-${uuidv4()}`;
      const newSession: ChatSession = {
        id: newSessionId,
        name: `${baseName} ${sessions.length + 1}`,
        messages: [],
        createdAt: new Date(),
        isPinned: false,
        lastMessagePreview: "Belum ada pesan",
        pinnedMessageIds: [],
      };
      setSessions((prev) => [...prev, newSession]);
      return newSession;
    },
    [sessions]
  );

  const deleteSessionHook = useCallback((sessionIdToDelete: string) => {
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionIdToDelete)
    );
  }, []);

  const renameSessionHook = useCallback(
    (sessionId: string, newName: string) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? { ...session, name: newName.trim() }
            : session
        )
      );
    },
    []
  );

  const togglePinSessionHook = useCallback((sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, isPinned: !session.isPinned }
          : session
      )
    );
  }, []);

  const addMessageToSessionHook = useCallback(
    (sessionId: string, message: ChatMessage) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, message],
                lastMessagePreview: generateLastMessagePreview([
                  ...session.messages,
                  message,
                ]),
              }
            : session
        )
      );
    },
    []
  );

  // Fungsi untuk pin/unpin pesan bisa ditambahkan di sini juga jika ingin lebih terpusat

  return {
    sessions,
    setSessions, // Tetap ekspor setSessions untuk fleksibilitas jika ada operasi yang sangat spesifik
    createNewSessionHook,
    deleteSessionHook,
    renameSessionHook,
    togglePinSessionHook,
    addMessageToSessionHook,
  };
}
