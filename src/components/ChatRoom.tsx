import { useEffect, useRef, useState } from "react";
import styles from "./ChatRoom.module.css";
import { useChatRoom } from "../hooks/useChatRoom";
import { useMessageInput } from "../hooks/useMessageInput";
import { formatTime } from "../lib/format";

const rooms = ["general", "random", "tech"];

interface ChatRoomProps {
  username: string;
}

export function ChatRoom({ username }: ChatRoomProps) {
  const [roomId, setRoomId] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    onlineUsers,
    isConnected,
    connectionStatus,
    sendError,
    sendMessage,
  } = useChatRoom({ roomId, username });

  const { messageInput, setMessageInput, handleSendMessage } = useMessageInput(
    sendMessage,
    isConnected
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.container}>
      <div className={styles.chatHeader}>
        <h2>💬 Chat Room</h2>
      </div>

      <div className={styles.roomSelector}>
        {rooms.map((room) => (
          <button
            key={room}
            className={`${styles.roomBtn} ${roomId === room ? styles.roomBtnActive : ""}`}
            onClick={() => setRoomId(room)}
          >
            #{room}
          </button>
        ))}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.status}>
          {isConnected && <span className={styles.statusDot} />}
          <span>{connectionStatus}</span>
          {isConnected && (
            <span className={styles.onlineUsers}>
              <span className={styles.onlineCount}>{onlineUsers.length} online</span>
            </span>
          )}
        </div>

        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.username === username ? styles.messageOwn : ""} ${msg.username === "System" ? styles.messageSystem : ""}`}
            >
              {msg.username !== "System" && (
                <span className={styles.messageUsername}>{msg.username}</span>
              )}
              {msg.message}
              <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.messageForm} onSubmit={handleSendMessage}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={!isConnected}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!isConnected || !messageInput.trim()}
          >
            Send
          </button>
        </form>
        {sendError && <p className={styles.note}>{sendError}</p>}
      </div>

      <p className={styles.note}>
        💡 Messages are ephemeral and will be lost on page refresh. Open this
        page in multiple tabs or browsers to test real-time chat!
      </p>
    </div>
  );
}
