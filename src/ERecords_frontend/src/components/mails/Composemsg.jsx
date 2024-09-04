import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';

function Composemsg() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();
  const authClient = useAuth();

  const handleFileChange = (event) => {
    setAttachments([...event.target.files]);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const senderId = authClient.getIdentity().getPrincipal().toText();
    try {
      await ERecords_backend.sendMessage(senderId, recipient, subject, body, attachments);
      console.log('Mail sent');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className='mainContainer'>
        <Sidebar/>
        <div className="compose-message main-contentarea">
        <h2>Compose Message</h2>
        <form onSubmit={sendMessage}>
            <div className="mb-3">
            <label className="form-label">Recipient</label>
            <input
                type="text"
                className="form-control"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Subject</label>
            <input
                type="text"
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea
                className="form-control"
                rows="5"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
            ></textarea>
            </div>
            <div className="mb-3">
            <label className="form-label">Attachments</label>
            <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
            />
            </div>
            <button type="submit" className="btn btn-primary">Send</button>
        </form>
        </div>
    </div>
  );
}

export default Composemsg;
