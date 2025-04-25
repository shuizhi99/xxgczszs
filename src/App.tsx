// src/App.tsx

import React, { useState, useRef, useEffect, CSSProperties } from 'react';

// ================= 配置区域 (需要修改部分) ================= //
interface AppConfig {
  API_URL: string;
  API_KEY: string;
  BOT_ID: string;
  USER_ID: string;
}

const CONFIG: AppConfig = {
  API_URL: 'https://api.coze.cn/v3/chat',   // API 地址（通常不需要修改）
  API_KEY: 'pat_Vimuiyx1boJxpfrkJeG7tlh6n0OyTmwTfsn3RH0zN6Dq0yf7pjhmwu7db37jNBKo',  // 替换为你的 API 密钥
  BOT_ID: '7487915922322391040',     // 替换为你的机器人 ID
  USER_ID: 'xxgczzzs' // 自定义用户标识（建议保持固定）
};
// ================= 配置结束 ================= //

// 类型定义
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 样式对象
const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#1a73e8'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px'
  },
  chatBox: {
    height: '500px',
    border: '1px solid #e0e0e0',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
    scrollbarWidth: 'thin',
    scrollbarColor: '#1a73e8 #f0f0f0'
  },
  message: {
    padding: '12px 16px',
    margin: '12px 0',
    borderRadius: '18px',
    maxWidth: '75%',
    fontSize: '15px',
    lineHeight: '1.5',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease'
  },
  userMessage: {
    backgroundColor: '#e3f2fd',
    marginLeft: 'auto',
    borderBottomRightRadius: '0'
  },
  assistantMessage: {
    backgroundColor: '#f1f3f5',
    marginRight: 'auto',
    borderBottomLeftRadius: '0'
  },
  systemMessage: {
    backgroundColor: '#fff3f3',
    border: '1px solid #ff6b6b',
    margin: '0 auto',
    maxWidth: '90%',
    textAlign: 'center'
  },
  inputContainer: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  input: {
    flex: 1,
    padding: '14px 20px',
    border: '1px solid #e0e0e0',
    borderRadius: '25px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    backgroundColor: '#fafafa'
  },
  button: {
    padding: '14px 30px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    fontSize: '15px'
  },
  loadingDots: {
    display: 'inline-block',
    marginLeft: '5px'
  }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // 发送消息处理
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // 添加用户消息
    const newMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          bot_id: CONFIG.BOT_ID,
          user_id: CONFIG.USER_ID,
          stream: true,
          auto_save_history: true,
          conversation_id: conversationId,
          additional_messages: [{
            role: "user",
            content: inputMessage,
            content_type: "text"
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let currentMessage = '';
      const updateMessage = (content: string) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content = content;
          } else {
            newMessages.push({
              role: 'assistant',
              content: content
            });
          }
          return newMessages;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.type === 'answer' && data.content_type === 'text') {
                currentMessage += data.content;
                updateMessage(currentMessage);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }

      setIsLoading(false);
      setConversationId(null);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `请求失败: ${(error as Error).message}`
      }]);
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>校园招生助手</h1>
        <p style={styles.subtitle}>智能解答您的招生相关问题</p>
      </div>
      
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === 'user' ? styles.userMessage : 
                  msg.role === 'assistant' ? styles.assistantMessage : 
                  styles.systemMessage)
            }}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{...styles.message, ...styles.assistantMessage}}>
            正在思考中<span style={styles.loadingDots}>...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div style={styles.inputContainer}>
        <input
          style={{
            ...styles.input,
            borderColor: inputMessage ? '#1a73e8' : '#e0e0e0'
          }}
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
          placeholder="输入关于招生的问题..."
          disabled={isLoading}
        />
        <button
          style={{
            ...styles.button,
            backgroundColor: isLoading ? '#6c757d' : '#1a73e8',
            transform: isLoading ? 'scale(0.98)' : 'scale(1)'
          }}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default App;
