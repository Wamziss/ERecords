import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './Styles.css'

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const authClient = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleShowModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  useEffect(() => {
    if (authClient) {
      createMail();
      fetchInbox();
    }
  }, [authClient]);

  const createMail = async () => {
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const userId = authClient.getIdentity().getPrincipal().toText();

    try {
      const result = await ERecords_backend.createMailAccount(userId);
      console.log('Mail created!');
    } catch (error) {
      console.error('Error creating mail account:', error);
    }
  };
  const fetchInbox = async () => {
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    
    const userId = authClient.getIdentity().getPrincipal().toText();
    try {
      const result = await ERecords_backend.receiveMessages(userId);
      console.log('result:', result);
  
      // Convert the timestamp strings to Date objects
      const messagesWithDate = result.map(message => ({
        ...message,
        // timestamp: new Date(message.timestamp)
        timestamp: new Date(parseInt(message.timestamp) * 1000)
 // Convert string to Date object
      }));
  
      setMessages(messagesWithDate);
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
    <div className="mainContainer">
      <Sidebar />
      <div className='main-contentarea'>
        <div className="mail-header-area">
          <h2 style={{fontSize: 27, fontWeight: 'bold', margin: '20px', marginTop: '0'}}>Inbox</h2>
          {/* <br/> */}
          <div style={{margin: '10px 20px'}}>
            <span onClick={fetchInbox}><i class="bi bi-arrow-repeat"></i></span>
            <Link to="/Mails/Compose" className="compose-mail" onClick={() => {window.location.href = '/Mails/Compose'}}>Compose Mail <i class="bi bi-pencil" style={{marginLeft: '5px'}}></i></Link>
          </div>
        </div>
        <ul className="mail-list">
          {messages.length > 0 ? (
            messages.map((message) => (
              <li key={message.id} className="mail-list-item">
                <div onClick={() => handleShowModal(message)} style={{ cursor: 'pointer' }} className='mail-content'>
                  <strong>{message.subject}</strong> <br/>
                  <span style={{color: '#666', fontSize: 'smaller'}}>{new Date(message.timestamp).toLocaleString()} </span>
                  <p className="mb-0" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px'}}>{message.body}</p>
                </div>
                <span className="del-mail-item" onClick={() => deleteMessage(message.id)}>
                  <i className="bi bi-trash3" style={{color: 'red'}}></i>
                </span>
              </li>
            ))
          ) : (
            <li style={{border: 'none', listStyleType: 'none', fontSize: 'larger'}}>No emails yet</li>
          )}
        </ul>

        {/* <ul className="mail-list">
        {
          messages.length > 0 ? 
          {messages.map((message) => (
            <li key={message.id} className="mail-list-item">
              <div onClick={() => handleShowModal(message)} style={{ cursor: 'pointer' }} className='mail-content'>
                <strong>{message.subject}</strong> <br/> <span style={{color: '#666', fontSize: 'smaller'}}>{new Date(message.timestamp).toLocaleString()} </span>
                <p className="mb-0" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px'}}>{message.body}</p>
              </div>
              <span className="del-mail-item" onClick={() => deleteMessage(message.id)}>
                <i className="bi bi-trash3" style={{color: 'red'}}></i>
              </span>
            </li>
          ))} : 
            'No emails yet'
        }
        </ul> */}

        {/* Modal for displaying message content */}
        {selectedMessage && (
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title style={{fontSize: 25, fontWeight: 'bold', margin: '20px'}}>{selectedMessage.subject}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>From:</strong> {selectedMessage.sender}</p>
              <p><strong>Message:</strong><br/>{selectedMessage.body}</p>
              {/* {selectedMessage.attachment && (
                <div>
                  <strong>Attachment:</strong>
                  <a href={URL.createObjectURL(new Blob([selectedMessage.attachment]))} download="attachment">Download</a>
                </div>
              )} */}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Inbox;



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
