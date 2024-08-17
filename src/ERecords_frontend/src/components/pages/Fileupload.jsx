import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles.css';
import ShareModal from '../subcomponents/ShareModal';
import Sidebar from '../Sidebar';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../../declarations/ERecords_backend';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../../declarations/ERecords_backend/ERecords_backend.did.js';

const canisterId = 'mngtr-gaaaa-aaaal-qjqfa-cai';
const agent = new HttpAgent();
const erecords = Actor.createActor(idlFactory, { agent, canisterId });

function Fileupload() {
    const [files, setFiles] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [modalFileIndex, setModalFileIndex] = useState(null);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [archivedFiles, setArchivedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const accessLink = "Accesslink://accesslink"; // Placeholder for dynamic generation

    // const handleShareClick = (index) => {
    //     setModalFileIndex(index);
    //     setShowShareModal(true);
    // };
    const handleShareClick = (index) => {
        
        const file = files[index];
        const sharedFiles = JSON.parse(localStorage.getItem('sharedFiles')) || [];
        sharedFiles.push({
            name: file.name,
            sharedTime: new Date().toLocaleString(),
        });
        localStorage.setItem('sharedFiles', JSON.stringify(sharedFiles));
        setModalFileIndex(index);
        setShowShareModal(true);
        
    };
    

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        setModalFileIndex(null);
    };

    const handleOptionsClick = (index) => {
        setSelectedFile(index);
        setShowOptionsModal(true);
    };

    const handleCloseOptionsModal = () => {
        setShowOptionsModal(false);
        setSelectedFile(null);
    };

    const handleShare = () => {
        if (selectedFile !== null) {
            const fileToShare = files[selectedFile];
            setSharedFiles([...sharedFiles, {
                name: fileToShare.name,
                sharedTime: new Date().toLocaleString(),
            }]);
            handleCloseShareModal();
        }
    };

    const handleArchive = () => {
        if (selectedFile !== null) {
            const fileToArchive = files[selectedFile];
            setArchivedFiles([...archivedFiles, {
                name: fileToArchive.name,
                archivedTime: new Date().toLocaleString(),
            }]);
            handleCloseOptionsModal();
        }
    };

    const handleFilesUpload = async (uploadedFiles) => {
        try {
          const newFiles = Array.from(uploadedFiles).map(file => ({
            name: file.name,
            uploadTime: new Date().toLocaleString(),
            fileData: file
          }));
      
          setFiles([...files, ...newFiles]);
      
          // Create AuthClient and get identity
          const authClient = await AuthClient.create();
          const identity = authClient.getIdentity();
      
          // Create the actor with the identity
          const eRecordsActor = createActor(process.env.REACT_APP_CANISTER_ID, {
            agentOptions: {
              identity,
            },
          });
      
          // Upload each file to the backend canister
          for (const file of newFiles) {
            const arrayBuffer = await file.fileData.arrayBuffer();
            const fileBlob = new Uint8Array(arrayBuffer);
            await eRecordsActor.uploadFile(file.name, fileBlob);
          }
      
        } catch (error) {
          console.error('File upload failed:', error);
        }
      };

    const handleFileInputChange = (event) => {
        handleFilesUpload(event.target.files);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        handleFilesUpload(event.dataTransfer.files);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const styles = {
        mainContainer: {
            display: 'flex',
            fontFamily: 'verdana',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100vh',
            overflowY: 'scroll',
        },
        searchInput: {
            paddingRight: '40px',
            borderRadius: '20px',
            border: '1px solid gray',
        },
        searchInputFocus: {
            outline: 'none',
            borderColor: '#6e06b3',
            boxShadow: '0 0 1px 2px #f5f5f5',
        },
        searchIcon: {
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'gray',
        },
        searchContainer: {
            position: 'relative',
            width: '45%',
            margin: '10px auto',
        }
    };

    return (
        <div style={styles.mainContainer} className='row'>
            <Sidebar />
            <div className='main-contentarea'>
                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        className="form-control"
                        style={isFocused ? { ...styles.searchInput, ...styles.searchInputFocus } : styles.searchInput}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search..."
                    />
                    <i className="bi bi-search" style={styles.searchIcon}></i>
                </div>
                <div className="file-upload-container">
                    <p className='upload-txt'>Upload Files</p>
                    <div className='file-upload'>
                        <div
                            className="upload-box"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={handleUploadClick}
                        >
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                            />
                            <span style={{ margin: 'auto', color: 'gray', fontSize: '16' }}>Drag & drop files here or click to upload</span>
                        </div>
                        <div className='upload-btns'>
                            <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
                            <button className="upload-btn" onClick={() => alert('coming soon!')}>
                                <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
                            </button>
                            <button className="upload-btn" onClick={() => alert('coming soon!')}>
                                <i className="bi bi-dropbox"></i> Drop Box
                            </button>
                        </div>
                    </div>
                </div>
                <div className="files-list">
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-details">
                                <p className="file-name">{file.name}</p>
                                <p className="upload-time">{file.uploadTime}</p>
                            </div>
                            <div className="file-actions">
                                <i className="bi bi-share" onClick={() => handleShareClick(index)}></i>
                                {modalFileIndex === index && (
                                    <ShareModal show={showShareModal} handleClose={handleCloseShareModal} accessLink={accessLink} />
                                )}
                                <i className="bi bi-three-dots" onClick={() => handleOptionsClick(index)}></i>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Options Modal */}
                <Modal show={showOptionsModal} onHide={handleCloseOptionsModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>File Options</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Button variant="secondary" onClick={handleArchive}>Archive</Button>
                        <Button variant="danger" className="ms-2" onClick={() => alert('Delete option coming soon!')}>Delete</Button>
                        <Button variant="warning" className="ms-2" onClick={() => alert('Rename option coming soon!')}>Rename</Button>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
}

export default Fileupload;


// import React, { useState, useRef, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import '../styles.css';
// import ShareModal from '../subcomponents/ShareModal';
// import Sidebar from '../Sidebar';
// import { AuthClient } from '@dfinity/auth-client';
// import { createActor } from '../../../../declarations/ERecords_backend';

// function Fileupload() {
//     const [files, setFiles] = useState([]);
//     const [isFocused, setIsFocused] = useState(false);
//     const fileInputRef = useRef(null);
//     const [showModal, setShowModal] = useState(false);
//     const [modalFileIndex, setModalFileIndex] = useState(null);

//     const handleShareClick = async (index) => {
//         setModalFileIndex(index);
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setModalFileIndex(null);
//     };

//     const handleFilesUpload = async (uploadedFiles) => {
//         try {
//             const newFiles = await Promise.all(
//                 Array.from(uploadedFiles).map(async (file) => {
//                     const arrayBuffer = await file.arrayBuffer();
//                     const fileBlob = new Uint8Array(arrayBuffer);
    
//                     const authClient = await AuthClient.create();
//                     const identity = authClient.getIdentity();
//                     const eRecordsActor = createActor(process.env.CANISTER_ID, {
//                         agentOptions: { identity },
//                     });
    
//                     const accessLink = await eRecordsActor.uploadFile(file.name, fileBlob);
//                     console.log('Access link received:', accessLink); // Debugging
    
//                     return {
//                         name: file.name,
//                         uploadTime: new Date().toLocaleString(),
//                         accessLink: accessLink,
//                     };
//                 })
//             );
    
//             console.log('New Files:', newFiles); // Debugging
//             setFiles([...files, ...newFiles]); // Add new files to the state
//             console.log('Files state after update:', files); // Debugging
//         } catch (error) {
//             console.error('File upload failed:', error);
//         }
//     };
    

//     const handleFileInputChange = (event) => {
//         handleFilesUpload(event.target.files);
//     };

//     const handleDragOver = (event) => {
//         event.preventDefault();
//     };

//     const handleDrop = (event) => {
//         event.preventDefault();
//         handleFilesUpload(event.dataTransfer.files);
//     };

//     const handleUploadClick = () => {
//         fileInputRef.current.click();
//     };

//     const styles = {
//         mainContainer: {
//             display: 'flex',
//             fontFamily: 'verdana',
//             margin: 0,
//             padding: 0,
//             width: '100%',
//             height: '100vh',
//             overflowY: 'scroll',
//         },
//         searchInput: {
//             paddingRight: '40px',
//             borderRadius: '20px',
//             border: '1px solid gray',
//         },
//         searchInputFocus: {
//             outline: 'none',
//             borderColor: '#6e06b3',
//             boxShadow: '0 0 1px 2px #f5f5f5',
//         },
//         searchIcon: {
//             position: 'absolute',
//             right: '15px',
//             top: '50%',
//             transform: 'translateY(-50%)',
//             color: 'gray',
//         },
//         searchContainer: {
//             position: 'relative',
//             width: '45%',
//             margin: '10px auto',
//         }
//     };

//     return (
//         <div style={styles.mainContainer} className='row'>
//             <Sidebar />
//             <div className='main-contentarea'>
//                 <div style={styles.searchContainer}>
//                     <input
//                         type="text"
//                         className="form-control"
//                         style={isFocused ? { ...styles.searchInput, ...styles.searchInputFocus } : styles.searchInput}
//                         onFocus={() => setIsFocused(true)}
//                         onBlur={() => setIsFocused(false)}
//                         placeholder="Search..."
//                     />
//                     <i className="bi bi-search" style={styles.searchIcon}></i>
//                 </div>
//                 <div className="file-upload-container">
//                     <p className='upload-txt'>Upload Files</p>
//                     <div className='file-upload'>
//                         <div
//                             className="upload-box"
//                             onDragOver={handleDragOver}
//                             onDrop={handleDrop}
//                             onClick={handleUploadClick}
//                         >
//                             <input
//                                 type="file"
//                                 multiple
//                                 ref={fileInputRef}
//                                 style={{ display: 'none' }}
//                                 onChange={handleFileInputChange}
//                             />
//                             <span style={{ margin: 'auto', color: 'gray', fontSize: '16' }}>Drag & drop files here or click to upload</span>
//                         </div>
//                         <div className='upload-btns'>
//                             <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
//                             <button className="upload-btn" onClick={() => alert('coming soon!')}>
//                                 <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
//                             </button>
//                             <button className="upload-btn" onClick={() => alert('coming soon!')}>
//                                 <i className="bi bi-dropbox"></i> Drop Box
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="files-list">
//                     {files.length > 0 ? (
//                         files.map((file, index) => (
//                             <div key={index} className="file-item">
//                                 <div className="file-details">
//                                     <p className="file-name">{file.name}</p>
//                                     <p className="upload-time">{file.uploadTime}</p>
//                                 </div>
//                                 <div className="file-actions">
//                                     <i className="bi bi-share" onClick={() => handleShareClick(index)}></i>
//                                     {modalFileIndex === index && (
//                                         <ShareModal
//                                             show={showModal}
//                                             handleClose={handleCloseModal}
//                                             accessLink={file.accessLink}
//                                             file={file}
//                                         />
//                                     )}
//                                     <i className="bi bi-three-dots" onClick={() => alert('Options: Delete, Archive, Rename')}></i>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <p>No files uploaded yet.</p>
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// }

// export default Fileupload;