// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

// API configuration
const API_URL = `http://${window.location.hostname}:5000/api`;
const SOCKET_URL = `http://${window.location.hostname}:5000`;

// Main App Component
function App() {
  return (
      <div className="app">
        <header className="app-header">
          <h1>Multi-User AI Interface</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<Session />} />
            <Route path="/join/:sessionId" element={<JoinSession />} />
          </Routes>
        </main>
      </div>
  );
}

// Home Component
function Home() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState('');

  const createSession = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API_URL}/sessions`, {
        userId: username
      });

      if (response.data.success) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('sessionId', response.data.sessionId);
        localStorage.setItem('authToken', response.data.token);
        navigate(`/session/${response.data.sessionId}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="home-container">
      <div className="create-session-form">
        <h2>Create New AI Session</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <button 
          className="create-btn"
          onClick={createSession}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
}

// Join Session Component
function JoinSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [joining, setJoining] = useState(false);

  const joinSession = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(`${API_URL}/sessions/${sessionId}/join`, {
        userId: username
      });

      if (response.data.success) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('sessionId', response.data.sessionId);
        localStorage.setItem('authToken', response.data.token);
        navigate(`/session/${sessionId}`);
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="join-session-container">
      <div className="join-form">
        <h2>Join AI Session</h2>
        <p>Session ID: {sessionId}</p>
        <div className="form-group">
          <label htmlFor="join-username">Username:</label>
          <input
            type="text"
            id="join-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <button 
          className="join-btn"
          onClick={joinSession}
          disabled={joining}
        >
          {joining ? 'Joining...' : 'Join Session'}
        </button>
      </div>
    </div>
  );
}

// Session Component
function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const messagesEndRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const authToken = localStorage.getItem('authToken');

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId || !userId || !authToken) {
      navigate('/');
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        sessionId,
        token: authToken
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket');
      setLoading(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      alert('Failed to connect to session');
      navigate('/');
    });

    socketInstance.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketInstance.on('user_joined', (data) => {
      setUsers((prevUsers) => {
        if (!prevUsers.find(u => u.id === data.userId)) {
          return [...prevUsers, { id: data.userId }];
        }
        return prevUsers;
      });
    });

    socketInstance.on('user_left', (data) => {
      setUsers((prevUsers) => prevUsers.filter(u => u.id !== data.userId));
    });

    socketInstance.on('user_kicked', (data) => {
      if (data.userId === userId) {
        alert('You have been removed from the session');
        socketInstance.disconnect();
        navigate('/');
      } else {
        setUsers((prevUsers) => prevUsers.filter(u => u.id !== data.userId));
      }
    });

socketInstance.on('user_list_updated', (data) => {
  setUsers(data.users);
});

    setSocket(socketInstance);
    setShareLink(`${window.location.origin}/join/${sessionId}`);

    // Verify if user is admin
    try {
      const decodedToken = JSON.parse(atob(authToken.split('.')[1]));
      setIsAdmin(decodedToken.role === 'admin');
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [sessionId, userId, authToken, navigate]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit('message', { content: input });
    setInput('');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const kickUser = async (targetUserId) => {
    if (!isAdmin || targetUserId === userId) return;

    try {
      await axios.post(
        `${API_URL}/sessions/${sessionId}/users/${targetUserId}`,
        { action: 'kick' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error('Error kicking user:', error);
      alert('Failed to remove user');
    }
  };

  if (loading) {
    return <div className="loading">Connecting to session...</div>;
  }

  return (
    <div className="session-container">
      <div className="session-sidebar">
        <h3>Session Info</h3>
        <div className="session-id">ID: {sessionId}</div>
        
        <div className="share-link">
          <h4>Share Link</h4>
          <div className="share-link-container">
            <input type="text" value={shareLink} readOnly />
            <button onClick={copyShareLink}>
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        
        <div className="users-list">
          <h4>Users ({users.length})</h4>
          <ul>
            {users.map((user) => (
              <li key={user.id} className={user.id === userId ? 'current-user' : ''}>
                {user.id}
                {isAdmin && user.id !== userId && (
                  <button 
                    className="kick-btn"
                    onClick={() => kickUser(user.id)}
                    title="Remove user"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          className="leave-btn"
          onClick={() => {
            socket.disconnect();
            navigate('/');
          }}
        >
          Leave Session
        </button>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.userId === userId ? 'user-message' : msg.userId === 'ai-model' ? 'ai-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="message-user">{msg.userId === userId ? 'You' : msg.userId === 'ai-model' ? 'AI Assistant' : msg.userId}</span>
                <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="message-form" onSubmit={sendMessage}>
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type your message... (Start with 'AI ' to get AI response)"
  />
  <button type="submit">Send</button>
</form>
      </div>
    </div>
  );
}

export default App;
