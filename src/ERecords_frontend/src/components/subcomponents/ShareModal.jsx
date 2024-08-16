import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import QRCode from 'qrcode.react';

function ShareModal({ show, handleClose, accessLink }) {
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [countdown, setCountdown] = useState(0); // Countdown in seconds

    useEffect(() => {
        // Calculate total countdown time
        const totalSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
        setCountdown(totalSeconds);

        // Timer logic
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        } else {
            clearInterval(timer);
        }

        return () => clearInterval(timer);
    }, [hours, minutes, seconds, countdown]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleInputChange = (setter) => (event) => {
        const value = event.target.value;
        // Ensure input values are numbers between 0 and 59 (for minutes and seconds) or 0-23 (for hours)
        if (/^\d*$/.test(value)) {
            setter(value.padStart(2, '0'));
        }
    };

    const extendAccess = () => {
        // Logic to extend access time
        alert("Access extended!");
    };

    const revokeAccess = () => {
        // Logic to revoke access
        alert("Access revoked!");
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Document</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="accessTime">
                    <Form.Label>Set Access Time:</Form.Label>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            value={hours}
                            onChange={handleInputChange(setHours)}
                            placeholder="HH"
                            maxLength={2}
                            style={{ width: '60px', marginRight: '5px' }}
                        />
                        <span>:</span>
                        <Form.Control
                            type="text"
                            value={minutes}
                            onChange={handleInputChange(setMinutes)}
                            placeholder="MM"
                            maxLength={2}
                            style={{ width: '60px', marginRight: '5px' }}
                        />
                        <span>:</span>
                        <Form.Control
                            type="text"
                            value={seconds}
                            onChange={handleInputChange(setSeconds)}
                            placeholder="SS"
                            maxLength={2}
                            style={{ width: '60px' }}
                        />
                    </div>
                </Form.Group>
                <p className="mt-3">Temporary Access Link: <strong>{accessLink}</strong></p>
                <div className="text-center my-3">
                    <QRCode value={accessLink} size={150} />
                    <p className="mt-2">QR Code</p>
                </div>
                <p>Set Time: <strong>{formatTime(countdown)}</strong></p>
            </Modal.Body>
            <Modal.Footer>
                <Button style={{backgroundColor: '#333'}}  onClick={extendAccess}>Extend Access</Button>
                <Button style={{backgroundColor: '#6e06b3'}}  onClick={revokeAccess}>Revoke Access</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ShareModal;
