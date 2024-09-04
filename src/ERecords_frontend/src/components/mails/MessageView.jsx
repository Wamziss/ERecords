import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';

function MessageView() {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const authClient = useAuth();

  useEffect(() => {
    viewMessage();
  }, [authClient]);

  const viewMessage = async () => {
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const userId = authClient.getIdentity().getPrincipal().toText();
    try {
      const result = await ERecords_backend.receiveMessages(userId);
      const selectedMessage = result.find((msg) => msg.id === parseInt(id));
      setMessage(selectedMessage);
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  const downloadAttachment = async (attachmentIndex) => {
    try {
      const file = await ERecords_backend.getAttachment(message.id, attachmentIndex);
      const url = window.URL.createObjectURL(new Blob([file]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  if (!message) return <p>Loading...</p>;

  return (
    <div className='mainContainer'>
        <Sidebar/>
        <div className="message-view main-contentarea">
        <h2>{message.subject}</h2>
        <p><strong>From:</strong> {message.senderId}</p>
        <p><strong>Date:</strong> {new Date(message.timestamp).toLocaleString()}</p>
        <p>{message.body}</p>
        {message.attachments && message.attachments.length > 0 && (
            <div className="attachments">
            <h5>Attachments</h5>
            <ul>
                {message.attachments.map((attachment, index) => (
                <li key={index}>
                    {attachment.name}
                    <button className="btn btn-link" onClick={() => downloadAttachment(index)}>
                    {/* <Download /> */}
                    <i class="bi bi-file-earmark-arrow-down"></i>
                    </button>
                </li>
                ))}
            </ul>
            </div>
        )}
        <Link to="/Mails" className="btn btn-secondary" onClick={() => { window.location.href = '/Mails'}}>Back to Inbox</Link>
        </div>
    </div>
  );
}

export default MessageView;
