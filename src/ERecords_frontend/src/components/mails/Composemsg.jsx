import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';
import './Styles.css'

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

  // const sendMessage = async (event) => {
  //   event.preventDefault();
  //   if (!authClient) {
  //     console.log('AuthClient not initialized');
  //     return;
  //   }
  
  //   const senderId = authClient.getIdentity().getPrincipal().toText();
  
  //   // Convert the first attachment to Blob (Uint8Array) or set to null
  //   let attachmentBlob;
  //   if (attachments.length > 0) {
  //     const file = attachments[0];
  //     const arrayBuffer = await file.arrayBuffer();
  //     attachmentBlob = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
  //   }
  
  //   try {
  //     // Ensure that null is passed when there's no attachment
  //     console.log("Send message", attachmentBlob);
  //     await ERecords_backend.sendMessage(senderId, recipient, subject, body, attachmentBlob);
  //     console.log('Mail sent');
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //   }
  // };
  
  
  const sendMessage = async (event) => {
    event.preventDefault();
    if (!authClient) {
      console.log('AuthClient not initialized');
      return;
    }
    const senderId = authClient.getIdentity().getPrincipal().toText();
    let attachmentBlob = null;
    if (attachments.length > 0) {
      const file = attachments[0];
      const arrayBuffer = await file.arrayBuffer();
      attachmentBlob = new Uint8Array(arrayBuffer);
      console.log(attachmentBlob);
    }
    try {
      // console.log(attachmentBlob)
      // await ERecords_backend.sendMessage(senderId, recipient, subject, body, attachmentBlob);
      await ERecords_backend.sendMessage(senderId, recipient, subject, body, attachments);
      console.log('Mail sent');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className='mainContainer'>
        <Sidebar/>
        <div className="main-contentarea">
        <div style={{display: 'flex', width: '70%', justifyContent: 'space-between', marginBottom: '20px'}}>
          <h2 style={{fontSize: 27, fontWeight: 'bold', margin: '20px', marginBottom: 0}}>Compose Email</h2><br/>
          <p className='' style={{ backgroundColor: '#f5f5f5', border: '1px solid gray', borderRadius: '5px', padding: '0 15px', margin: '5px 20px'}}><i class="bi bi-arrow-left"></i><Link to="/Mails" onClick={() => {window.location.href = '/Mails'}} style={{textDecoration: 'none', color: '#000', fontSize: '20px', marginLeft: '10px'}}>Inbox</Link></p>
        </div>
        <form onSubmit={sendMessage} className='send-mail-form'>
            <div style={{minWidth: '100%'}}>
              <div className="mb-1" style={{minWidth: '100%'}}>
                <label className="form-label">Recipient</label>
                <input
                    type="text"
                    className="form-control"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                />
              </div><br/>
              <div className="mb-1" style={{minWidth: '100%'}}>
                <label className="form-label">Subject</label>
                <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
                </div><br/>
              <div className="mb-1"  style={{minWidth: '100%'}}>
                <label className="form-label">Message</label>
                <textarea
                    className="form-control"
                    rows="5"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                ></textarea>
              </div><br/>
            </div>
            {/* <div className="mb-3">
            <label className="form-label">Attachments</label>
            <input
                type="file"
                className="form-control"
                multiple
                onChange={handleFileChange}
            />
            </div> */}
            <button type='submit' className='mail-send-btn'>Send</button>
        </form>
        </div>
    </div>
  );
}

export default Composemsg;
