import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import './Styles.css'; // Adjust the path as necessary
import { useAuth } from '../../AuthContext';

function QRmodal({ show, handleClose }) {
    const authClient = useAuth();
    if (authClient) {
        var principal = authClient.getIdentity().getPrincipal().toText();
        
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>QR Code</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center my-3">
                    <p>Principal ID:</p>
                    <QRCode value={principal} />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default QRmodal;
