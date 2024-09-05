import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';
import QRmodal from './QRmodal';
import { Button } from 'react-bootstrap';
function Settings() {
    const authClient = useAuth();
    const [principalId, setPrincipalId] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [copyFail, setCopyFail] = useState('');
    const inputRef = useRef(null);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleShowQRModal = () => setShowQRModal(true);
    const handleCloseQRModal = () => setShowQRModal(false);
  
    useEffect(() => {
      if (authClient) {
        const principal = authClient.getIdentity().getPrincipal().toText();
        setPrincipalId(principal);
      }
    }, [authClient]);
  
    // Clipboard API copy function
    const copyToClipboard = async () => {
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(principalId || '');
          setCopySuccess('Copied!');
        } catch (err) {
          setCopyFail('Failed to copy!');
        }
      } else {
        fallbackCopyToClipboard(); // Fallback if Clipboard API is not supported
      }
      setTimeout(() => setCopySuccess(''), 2000); // Reset message after 2 seconds
      setTimeout(() => setCopyFail(''), 2000); // Reset message after 2 seconds
    };
  
    // Fallback copy function
    const fallbackCopyToClipboard = () => {
      const inputElement = inputRef.current;
      inputElement.select(); // Select the input's content
      document.execCommand('copy'); // Fallback for older browsers
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); // Reset message after 2 seconds
    }


    const styles = {
        mainContainer: {
            display: 'flex',
            fontFamily: 'verdana',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100vh',
            overflowY: 'auto',
        },
        section: {
            margin: 'auto',
            marginBottom: '20px',
            width: '90%',
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '5px',
        },
        option: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #ddd',
        },
        label: {
            fontSize: '16px',
        },
        switch: {
            cursor: 'pointer',
        }
    };

    return (
        <div style={styles.mainContainer} className='row'>
            <Sidebar />
            <div className='main-contentarea'>
                <div className="principal-id-section">
                    <label htmlFor="principalId"><h2 style={styles.sectionTitle}>Principal ID:</h2></label><br/>
                    {copySuccess && <span className="copy-success-message">{copySuccess}</span>}
                    {copyFail && <span className="copy-fail-message">{copyFail}</span>}
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 0' }}>
                        <input
                            id="principalId"
                            type="text"
                            value={principalId || 'Loading...'}
                            readOnly
                            style={{ marginRight: '10px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', border: 'none', boxShadow: '0 0 2px lightgray', padding: '2px' }}
                        />
                        <button onClick={copyToClipboard} className="copy-btn" disabled={!principalId}>
                            <i class="bi bi-copy" ></i>
                        </button>
                        <button onClick={handleShowQRModal} style={{backgroundColor: '#f5f5f5', padding: '2px 5px', borderRadius: '5px', marginLeft: '10px', width: 'fit-content', border: 'none'}}>Share as QR</button>
                        <QRmodal show={showQRModal} handleClose={handleCloseQRModal} />
                    </div>
                    
                </div>
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Appearance</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Dark Theme</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Security</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Enable Two-Factor Authentication</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div style={styles.option}>
                        <span style={styles.label}>Auto-lock after inactivity</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Notifications</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Email Notifications</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div style={styles.option}>
                        <span style={styles.label}>Push Notifications</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Privacy</h2>
                    <div style={styles.option}>
                        <span style={styles.label}>Hide Activity Status</span>
                        <label className="switch">
                            <input type="checkbox" />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;


