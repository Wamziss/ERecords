import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles.css'
import ShareModal from '../subcomponents/ShareModal';
import Sidebar from '../Sidebar';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../../declarations/ERecords_backend';

function Fileupload() {
    const [files, setFiles] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [modalFileIndex, setModalFileIndex] = useState(null); // To track the clicked file
    const accessLink = "Accesslink://accesslink"; // Placeholder for dynamic generation

    const handleShareClick = (index) => {
        setModalFileIndex(index); // Set the clicked file index
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalFileIndex(null); // Reset the clicked file index
    };

    const handleFilesUpload = async (uploadedFiles) => {
        try {
            const newFiles = Array.from(uploadedFiles).map(file => ({
                name: file.name,
                uploadTime: new Date().toLocaleString(),
                fileData: file
            }));

            setFiles([...files, ...newFiles]);

            // Upload each file to the backend
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            const eRecordsActor = createActor(process.env.CANISTER_ID, {
                agentOptions: {
                    identity,
                },
            });

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
                                    <ShareModal show={showModal} handleClose={handleCloseModal} accessLink={accessLink} />
                                )}
                                <i className="bi bi-three-dots" onClick={() => alert('Options: Delete, Archive, Rename')}></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Fileupload;
