import React, { useState, useEffect, useRef } from "react";
import {EventWebSocketClient} from "@portal/event";

interface ChatMessage {
  id: string;
  content: string;
  type: "question" | "answer";
  timestamp: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [clientId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsClientRef = useRef<EventWebSocketClient | null>(null);

  // Initialize WebSocket client with clientId
  useEffect(() => {
    const client = new EventWebSocketClient(`ws://localhost:8000/ws/events/${clientId}`, {
      debug: true,
      autoReconnect: true,
    });

    client.on('connected', () => {
      console.log('Chat WebSocket connected with clientId:', clientId);
      // Subscribe to chat answer events
      client.subscribe<{ content: string; questionId: string }>('ChatMessage', (data) => {
        console.log('Received ChatMessage:', data);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: data.content,
            type: "answer",
            timestamp: new Date(),
          },
        ]);
      });
    });

    client.connect();
    wsClientRef.current = client;

    return () => {
      client.disconnect();
    };
  }, [clientId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async () => {
    if (!inputText.trim() || isSending) return;

    const questionMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputText,
      type: "question",
      timestamp: new Date(),
    };

    // Add question to messages immediately
    setMessages((prev) => [...prev, questionMessage]);
    setInputText("");
    setIsSending(true);

    try {
      // Send question to backend
      const response = await fetch('http://localhost:8000/api/chat/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionMessage.content,
          questionId: questionMessage.id,
          clientId: clientId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send question:', response.statusText);
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: "Sorry, I couldn't send your message. Please try again.",
            type: "answer",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending question:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "Sorry, there was an error. Please try again.",
          type: "answer",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div
      style={{
        width: "400px",
        height: "100vh",
        backgroundColor: "#0b141a",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #2a2f32",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#1f2c33",
          borderBottom: "1px solid #2a2f32",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#00a884",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          AI
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#e9edef" }}>
            AI Assistant
          </div>
          <div style={{ fontSize: "13px", color: "#8696a0" }}>
            Online
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundImage: "radial-gradient(circle, #0d1418 10%, transparent 10%)",
          backgroundSize: "20px 20px",
          backgroundColor: "#0b141a",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.type === "question" ? "flex-end" : "flex-start",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                position: "relative",
                maxWidth: "75%",
                padding: "6px 7px 8px 9px",
                borderRadius: "7.5px",
                backgroundColor: msg.type === "question" ? "#005c4b" : "#202c33",
                color: "#e9edef",
                fontSize: "14.2px",
                lineHeight: "19px",
                wordBreak: "break-word",
                boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
              }}
            >
              {/* Bubble tail - simple triangle */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  width: "0",
                  height: "0",
                  ...(msg.type === "question" ? {
                    right: "-4px",
                    borderTop: "8px solid transparent",
                    borderBottom: "0px solid transparent",
                    borderLeft: "8px solid #005c4b",
                  } : {
                    left: "-4px",
                    borderTop: "8px solid transparent",
                    borderBottom: "0px solid transparent",
                    borderRight: "8px solid #202c33",
                  }),
                }}
              />
              <div>{msg.content}</div>
              <div
                style={{
                  fontSize: "11px",
                  color: msg.type === "question" ? "rgba(233, 237, 239, 0.6)" : "rgba(134, 150, 160, 0.9)",
                  marginTop: "4px",
                  textAlign: "right",
                  marginLeft: "4px",
                  display: "inline-block",
                  float: "right",
                }}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#1f2c33",
          borderTop: "1px solid #2a2f32",
          display: "flex",
          gap: "8px",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#2a3942",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#e9edef",
              fontSize: "15px",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          onClick={sendQuestion}
          disabled={!inputText.trim() || isSending}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: inputText.trim() && !isSending ? "#00a884" : "#2a3942",
            border: "none",
            cursor: inputText.trim() && !isSending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: "#fff",
            transition: "background-color 0.2s",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
