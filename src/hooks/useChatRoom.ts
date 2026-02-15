import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface PresenceUser {
  odyseus: string;
  username: string;
  joinedAt: string;
}

interface UseChatRoomOptions {
  roomId: string;
  username: string;
}

interface UseChatRoomReturn {
  messages: ChatMessage[];
  onlineUsers: PresenceUser[];
  isConnected: boolean;
  connectionStatus: string;
  sendError: string | null;
  sendMessage: (message: string) => Promise<void>;
}

export function useChatRoom({
  roomId,
  username,
}: UseChatRoomOptions): UseChatRoomReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [sendError, setSendError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef(crypto.randomUUID());

  const sendMessage = useCallback(
    async (message: string) => {
      if (!channelRef.current || !isConnected) return;

      setSendError(null);

      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        username,
        message,
        timestamp: new Date().toISOString(),
      };

      const result = await channelRef.current.send({
        type: "broadcast",
        event: "chat-message",
        payload: chatMessage,
      });

      if (result !== "ok") {
        setSendError("Message could not be delivered. Try again.");
      }
    },
    [isConnected, username]
  );

  useEffect(() => {
    setMessages([]);
    setOnlineUsers([]);
    setIsConnected(false);
    setConnectionStatus("Connecting...");
    setSendError(null);

    const channel = supabase.channel(`chat-room-${roomId}`, {
      config: {
        broadcast: { ack: true, self: true },
        presence: { key: userIdRef.current },
      },
    });

    channelRef.current = channel;

    channel.on("broadcast", { event: "chat-message" }, ({ payload }) => {
      const chatMessage = payload as ChatMessage;
      setMessages((prev) => [...prev, chatMessage]);
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PresenceUser>();
      const usersById = new Map<string, PresenceUser>();

      Object.values(state)
        .flat()
        .forEach((user) => {
          usersById.set(user.odyseus, user);
        });

      setOnlineUsers(Array.from(usersById.values()));
    });

    channel.on("presence", { event: "join" }, ({ newPresences }) => {
      const joinedUsers = newPresences as unknown as PresenceUser[];
      joinedUsers.forEach((user) => {
        if (user.odyseus !== userIdRef.current) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              username: "System",
              message: `${user.username} joined the room`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });
    });

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const leftUsers = leftPresences as unknown as PresenceUser[];
      leftUsers.forEach((user) => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            username: "System",
            message: `${user.username} left the room`,
            timestamp: new Date().toISOString(),
          },
        ]);
      });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        setConnectionStatus(`Connected to #${roomId}`);

        const trackStatus = await channel.track({
          odyseus: userIdRef.current,
          username,
          joinedAt: new Date().toISOString(),
        });

        if (trackStatus !== "ok") {
          setConnectionStatus("Connected, but presence sync failed");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            username: "System",
            message: `You joined #${roomId}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else if (status === "CHANNEL_ERROR") {
        setConnectionStatus("Connection error");
        setIsConnected(false);
        setSendError("Realtime connection error. Reconnecting...");
      } else if (status === "TIMED_OUT") {
        setConnectionStatus("Connection timed out");
        setIsConnected(false);
        setSendError("Connection timed out. Please wait and retry.");
      } else if (status === "CLOSED") {
        setConnectionStatus("Connection closed");
        setIsConnected(false);
      }
    });

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, username]);

  return {
    messages,
    onlineUsers,
    isConnected,
    connectionStatus,
    sendError,
    sendMessage,
  };
}
