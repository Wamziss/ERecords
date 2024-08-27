import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import PropTypes from 'prop-types';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import '../pages/Styles.css'

import { ERecords_backend } from '../../../../declarations/ERecords_backend';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function ShareModal({ show, handleClose, fileId, filesMap }) {
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [countdown, setCountdown] = useState(0);
    const [accessLink, setAccessLink] = useState('Not set');
    const [qrCodeValue, setQrCodeValue] = useState(''); 
    const [timer, setTimer] = useState(null); 

    const retrieveFileContent = async () => {
        try {
            const fileArray = await ERecords_backend.getFile(fileId, userId); // Use fileId from props
    
            if (fileArray && fileArray.length > 0) {
                const file = fileArray[0];
    
                if (file) {
                    const fileContent = file.content;
                    const fileName = file.name;
                    const fileExtension = fileName.split('.').pop().toLowerCase(); // Extract file extension
    
                    // Handle different file types based on file extension
                    const arrayBuffer = fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
    
                    let textContent = '';
    
                    if (fileExtension === 'pdf') {
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const page = await pdf.getPage(1); // Assuming you want the first page content
                        const textContentObj = await page.getTextContent();
                        textContent = textContentObj.items.map(item => item.str).join(' ');
                    } 
                    else if (fileExtension === 'docx') {
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        textContent = result.value;
                    } 
                    else if (fileExtension === 'xlsx') {
                        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        textContent = XLSX.utils.sheet_to_html(worksheet);
                    } 
                    else {
                        // Handle other file types as text
                        textContent = new TextDecoder().decode(fileContent);
                    }
    
                    // Count words in textContent
                    const wordCount = textContent.trim().split(/\s+/).length;
                    // console.log(`Word count: ${wordCount}`);
    
                    if (wordCount > 100) {
                        // Generate token and store content
                        const token = generateUniqueToken();
                        await ERecords_backend.storeToken(token, textContent); // Store token and file content on the backend
    
                        // Construct the temporary access link
                        // const canisterId = "bd3sg-teaaa-aaaaa-qaaba-cai"; 
                        const link = `https://mkhvf-lyaaa-aaaal-qjqfq-cai.icp0.io/Files/Filecontent?token=${token}`
                        setAccessLink(link);
                        setQrCodeValue(link);
                        
                        alert("The document contains more than 100 words. A temporary access link will be used instead of a QR code.");
                    
                        
                        } else {
                        // For 100 words or less, set QR code to textContent
                        setQrCodeValue(textContent);
                    }
                } else {
                    console.error("File not found");
                }
            }
        } catch (error) {
            console.error("Failed to retrieve file:", error);
        }
    };
    

    const startCountdown = async () => {
        const totalSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
        setCountdown(totalSeconds);

        const currentTime = Math.floor(Date.now() / 1000);
        const expiryTime = currentTime + totalSeconds;

        const success = await ERecords_backend.setShareExpiry(fileId, expiryTime);
        if (success) {
            setTimer(setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                        clearInterval(timer);
                        revokeAccess();  // Auto-revoke when time expires
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000));
        }
    };

    const revokeAccess = async () => {
        const success = await ERecords_backend.revokeAccess(fileId);
        if (success) {
            clearInterval(timer);
            setQrCodeValue('Access revoked');
            setAccessLink('Access revoked');
        }
    };

    const extendAccess = async () => {
        const additionalSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
        const newCountdown = countdown + additionalSeconds;

        const currentTime = Math.floor(Date.now() / 1000);
        const newExpiryTime = currentTime + newCountdown;

        const success = await ERecords_backend.setShareExpiry(fileId, newExpiryTime);
        if (success) {
            clearInterval(timer);
            setCountdown(newCountdown);
            setTimer(setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown <= 1) {
                        clearInterval(timer);
                        revokeAccess();  // Auto-revoke when time expires
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000));
        }
    };

    useEffect(() => {
        retrieveFileContent();
    }, [fileId]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleInputChange = (setter, max) => (event) => {
        const value = event.target.value;
        if (/^\d*$/.test(value)) {
            const number = Math.min(parseInt(value, 10), max).toString().padStart(2, '0');
            setter(number);
        }
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
                        onChange={handleInputChange(setHours, 23)}
                        placeholder="HH"
                        maxLength={2}
                        style={{ width: '60px', marginRight: '5px' }}
                    />
                    <span>:</span>
                    <Form.Control
                        type="text"
                        value={minutes}
                        onChange={handleInputChange(setMinutes, 59)}
                        placeholder="MM"
                        maxLength={2}
                        style={{ width: '60px', marginRight: '5px' }}
                    />
                    <span>:</span>
                    <Form.Control
                        type="text"
                        value={seconds}
                        onChange={handleInputChange(setSeconds, 59)}
                        placeholder="SS"
                        maxLength={2}
                        style={{ width: '60px' }}
                    />
                </div>
            </Form.Group>
            <p className="mt-3">Temporary Access Link: <strong>{accessLink}</strong></p>
            <div className="text-center my-3">
                <QRCode value={qrCodeValue} />
            </div>
            <p>Set Time: <strong>{formatTime(countdown)}</strong></p>
        </Modal.Body>
        <Modal.Footer>
            <Button style={{ backgroundColor: '#6e06b5' }} onClick={startCountdown}>Grant Access</Button>
            <Button style={{ backgroundColor: '#333' }} onClick={extendAccess}>Extend Access</Button>
            <Button style={{ backgroundColor: 'red' }} onClick={revokeAccess}>Revoke Access</Button>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
    </Modal>
    );
}

ShareModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    fileId: PropTypes.string.isRequired,
    filesMap: PropTypes.instanceOf(Map).isRequired,  // Corrected this line
};

const generateUniqueToken = () => {
    return Math.random().toString(36).substr(2, 11);
};

export default ShareModal;
