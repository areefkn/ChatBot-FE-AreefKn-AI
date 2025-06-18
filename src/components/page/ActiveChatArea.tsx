// src/components/page/ActiveChatArea.tsx
"use client";
import { useState } from "react";
import React from "react";
import { ChatMessageList, ChatInputBar } from "@/components/chat";

// Definisikan ulang atau impor interface ChatMessage jika diperlukan
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ActiveChatAreaProps {
  messages: ChatMessage[];
  isSending: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  activeSessionName?: string;
  pinnedMessages: ChatMessage[];
  onUnpinMessage: (messageId: string) => void;
  onPinMessage: (messageId: string) => void;
  inputMessage: string;
  onInputMessageChange: (value: string) => void;
  onSendMessage: () => Promise<void>;
  onSelectTemplate: (template: string) => void;
}

export function ActiveChatArea({
  messages,
  isSending,
  chatContainerRef,
  activeSessionName,
  pinnedMessages,
  onUnpinMessage,
  onPinMessage,
  inputMessage,
  onInputMessageChange,
  onSendMessage,
  onSelectTemplate, // Pastikan prop ini diterima
}: ActiveChatAreaProps) {
  return (
    <>
      <ChatMessageList
        messages={messages}
        isSending={isSending}
        chatContainerRef={chatContainerRef}
        activeSessionName={activeSessionName}
        pinnedMessages={pinnedMessages}
        onUnpinMessage={onUnpinMessage}
        onPinMessage={onPinMessage}
      />
      <ChatInputBar
        message={inputMessage}
        onMessageChange={onInputMessageChange}
        onSendMessage={onSendMessage}
        isSending={isSending}
      />
    </>
  );
}
