import { useState } from "react";

export interface UseMessageInputReturn {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
}

export function useMessageInput(
  sendMessage: (message: string) => Promise<void>,
  isConnected: boolean
): UseMessageInputReturn {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (trimmed && isConnected) {
      await sendMessage(trimmed);
      setMessageInput("");
    }
  };

  return { messageInput, setMessageInput, handleSendMessage };
}
