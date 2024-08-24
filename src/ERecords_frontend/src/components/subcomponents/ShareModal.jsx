import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import PropTypes from 'prop-types';

function ShareModal({ show, handleClose, fileId }) {
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [countdown, setCountdown] = useState(0);
    const [accessLink, setAccessLink] = useState('');
    const [qrCodeValue, setQrCodeValue] = useState('');

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

    useEffect(() => {
        // Generate a unique access link and QR code
        const token = generateUniqueToken();
        const link = `https://yourappdomain.com/access/${token}`;
        setAccessLink(link);
        setQrCodeValue(link);
    }, [fileId]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    const handleInputChange = (setter, max) => (event) => {
        const value = event.target.value;
        // Ensure input values are numbers between 0 and max
        if (/^\d*$/.test(value)) {
            const number = Math.min(parseInt(value, 10), max).toString().padStart(2, '0');
            setter(number);
        }
    };

    const extendAccess = async () => {
        // Implement logic to extend access
        console.log('Access extended for', fileId);
    };

    const revokeAccess = async () => {
        // Implement logic to revoke access
        console.log('Access revoked for', fileId);
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
                <Button style={{ backgroundColor: '#333' }} onClick={extendAccess}>Extend Access</Button>
                <Button style={{ backgroundColor: '#6e06b5' }} onClick={revokeAccess}>Revoke Access</Button>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

ShareModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    fileId: PropTypes.string.isRequired
};

const generateUniqueToken = () => {
    // Generate a random unique token
    return Math.random().toString(36).substr(2, 9); // Adjust length if needed
};

export default ShareModal;




    // useEffect(() => {
    //     if (fileId) {
    //         // Configure HttpAgent with the authentication token
    //         const agent = new HttpAgent({ host: 'http://localhost:40915/_/dashboard' });

    //         agent.fetchRootKey().then(() => {
    //             agent._rootKeyFetched = true;
    //           }).catch((err) => {
    //             console.error("Error fetching root key:", err);
    //           });

    //         const eRecords = Actor.createActor(eRecordsIdl, {
    //             agent,
    //             canisterId: import.meta.env.VITE_CANISTER_ID,
    //         });

    //         // if (import.meta.env.DEV) {
    //         //     agent.fetchRootKey().catch((err) => {
    //         //         console.warn('Unable to fetch root key. This is expected if you are running in a local environment:', err);
    //         //     });
    //         // }

    //         // Create an actor to interact with the ERecords canister
            

    //         // Fetch access link and QR code URL from the canister
    //         const fetchAccessLink = async () => {
                
    //             // try {
    //             //     const response = await eRecords.generateAccessLink(fileId, countdown, sessionKey);
    //             //     setAccessLink(response.link);
    //             //     setQrCodeUrl(response.qrCodeUrl); 
    //             // } catch (error) {
    //             //     console.error('Error fetching access link:', error);
    //             // }
    //         };
            
    //         fetchAccessLink();
    //     }
    // }, [fileId, countdown]);




// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import QRCode from 'qrcode.react';

// function ShareModal({ show, handleClose, accessLink }) {
//     const [hours, setHours] = useState('00');
//     const [minutes, setMinutes] = useState('00');
//     const [seconds, setSeconds] = useState('00');
//     const [countdown, setCountdown] = useState(0); // Countdown in seconds

//     useEffect(() => {
//         // Calculate total countdown time
//         const totalSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
//         setCountdown(totalSeconds);

//         // Timer logic
//         let timer;
//         if (countdown > 0) {
//             timer = setInterval(() => {
//                 setCountdown(prevCountdown => {
//                     if (prevCountdown <= 1) {
//                         clearInterval(timer);
//                         return 0;
//                     }
//                     return prevCountdown - 1;
//                 });
//             }, 1000);
//         } else {
//             clearInterval(timer);
//         }

//         return () => clearInterval(timer);
//     }, [hours, minutes, seconds, countdown]);

//     const formatTime = (seconds) => {
//         const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
//         const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
//         const secs = (seconds % 60).toString().padStart(2, '0');
//         return `${hrs}:${mins}:${secs}`;
//     };

//     const handleInputChange = (setter) => (event) => {
//         const value = event.target.value;
//         // Ensure input values are numbers between 0 and 59 (for minutes and seconds) or 0-23 (for hours)
//         if (/^\d*$/.test(value)) {
//             setter(value.padStart(2, '0'));
//         }
//     };

//     const extendAccess = () => {
//         // Logic to extend access time
//         alert("Access extended!");
//     };

//     const revokeAccess = () => {
//         // Logic to revoke access
//         alert("Access revoked!");
//     };

//     return (
//         <Modal show={show} onHide={handleClose}>
//             <Modal.Header closeButton>
//                 <Modal.Title>Share Document</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <Form.Group controlId="accessTime">
//                     <Form.Label>Set Access Time:</Form.Label>
//                     <div className="d-flex">
//                         <Form.Control
//                             type="text"
//                             value={hours}
//                             onChange={handleInputChange(setHours)}
//                             placeholder="HH"
//                             maxLength={2}
//                             style={{ width: '60px', marginRight: '5px' }}
//                         />
//                         <span>:</span>
//                         <Form.Control
//                             type="text"
//                             value={minutes}
//                             onChange={handleInputChange(setMinutes)}
//                             placeholder="MM"
//                             maxLength={2}
//                             style={{ width: '60px', marginRight: '5px' }}
//                         />
//                         <span>:</span>
//                         <Form.Control
//                             type="text"
//                             value={seconds}
//                             onChange={handleInputChange(setSeconds)}
//                             placeholder="SS"
//                             maxLength={2}
//                             style={{ width: '60px' }}
//                         />
//                     </div>
//                 </Form.Group>
//                 <p className="mt-3">Temporary Access Link: <strong>{accessLink}</strong></p>
//                 <div className="text-center my-3">
//                     <QRCode value={accessLink} size={150} />
//                     <p className="mt-2">QR Code</p>
//                 </div>
//                 <p>Set Time: <strong>{formatTime(countdown)}</strong></p>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Button style={{backgroundColor: '#333'}}  onClick={extendAccess}>Extend Access</Button>
//                 <Button style={{backgroundColor: '#6e06b3'}}  onClick={revokeAccess}>Revoke Access</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// }

// export default ShareModal;
