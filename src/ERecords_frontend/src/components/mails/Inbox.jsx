import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import { Trash, Search } from 'react-bootstrap-icons';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const authClient = useAuth();

  useEffect(() => {
    console.log(authClient);
    fetchInbox();
  }, [authClient]);

  const fetchInbox = async () => {
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const userId = authClient.getIdentity().getPrincipal().toText();
    console.log(userId);
    try {
      const result = await ERecords_backend.receiveMessages(userId);
      setMessages(result);
    } catch (error) {
      console.error('Error fetching inbox:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const userId = authClient.getIdentity().getPrincipal().toText();
    try {
      await ERecords_backend.deleteMessage(userId, messageId);
      fetchInbox();  // Refetch inbox after deletion
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const searchMessages = async (event) => {
    event.preventDefault();
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const userId = authClient.getIdentity().getPrincipal().toText();
    try {
      const result = await ERecords_backend.searchMessages(userId, searchQuery);
      setMessages(result);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  return (
    <div className="inbox row mainContainer">
        <Sidebar />
        <div className='main-contentarea'>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Inbox</h2>
                <Link to="/Compose" className="btn btn-primary" onClick={() => { window.location.href = '/Compose'}}>Compose</Link>
            </div>
            {/* <form onSubmit={searchMessages} className="mb-4" >
                <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="submit">
                    
                    <i class="bi bi-search"></i>
                </button>
                </div>
            </form> */}
            <ul className="list-group">
                {messages.map((message) => (
                <li key={message.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                    <Link to={`/message/${message.id}`} className="text-decoration-none">
                        <strong>{message.senderId}</strong> - {message.subject} - {new Date(message.timestamp).toLocaleString()}
                    </Link>
                    <p className="mb-0">{message.body.slice(0, 100)}...</p>
                    </div>
                    <button className="btn btn-danger" onClick={() => deleteMessage(message.id)}>
                    {/* <Trash /> */}
                        <i class="bi bi-trash3"></i>
                    </button>
                </li>
                ))}
            </ul>
        </div>
    </div>
  );
}

export default Inbox;
