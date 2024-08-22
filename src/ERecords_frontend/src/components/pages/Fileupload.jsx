import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles.css';
import './Styles.css';
import ShareModal from '../subcomponents/ShareModal';
import Sidebar from '../Sidebar';
// import { AuthClient } from '@dfinity/auth-client';
// import { createActor } from '../../../../declarations/ERecords_backend';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../../declarations/ERecords_backend/ERecords_backend.did.js';

const canisterId = import.meta.env.VITE_CANISTER_ID;
const agent = new HttpAgent();
const erecords = Actor.createActor(idlFactory, { agent, canisterId });

function Fileupload() {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [modalFileIndex, setModalFileIndex] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const accessLink = "Accesslink://accesslink"; // Placeholder for dynamic generation

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
            setFiles(prevFiles => prevFiles.map((file, index) => 
                index === selectedFile ? { ...file, sharedTime: new Date().toLocaleString() } : file
            ));
            handleCloseShareModal();
        }
    };

    const handleArchive = () => {
        if (selectedFile !== null) {
            setFiles(prevFiles => prevFiles.filter((_, index) => index !== selectedFile));
            handleCloseOptionsModal();
        }
    };

    const handleFilesUpload = async (event) => {
        try {
            const uploadedItems = Array.from(event.target.files);
            const newFiles = uploadedItems.map(file => ({
                name: file.name,
                uploadTime: new Date().toLocaleString(),
                fileData: file,
                type: 'file',
            }));

            setFiles(prevFiles => [...prevFiles, ...newFiles]);

            // Example of how you might handle actual file upload to server
            // This part needs to be implemented based on your backend API
            newFiles.forEach(async (file) => {
                const arrayBuffer = await file.fileData.arrayBuffer();
                console.log(`Uploading file: ${file.name}`);
            });
        } catch (error) {
            console.error('File upload failed:', error);
        }
    };

    const handleFolderUpload = (event) => {
        try {
            const uploadedItems = Array.from(event.target.files);
            const newFolders = [];
    
            // Process folders
            uploadedItems.forEach(file => {
                const folderPath = file.webkitRelativePath.split('/');
                const folderName = folderPath[0];
                const fileName = folderPath.slice(1).join('/');
    
                let folder = newFolders.find(f => f.name === folderName);
                if (!folder) {
                    folder = { name: folderName, files: [] };
                    newFolders.push(folder);
                }
                folder.files.push({
                    name: fileName,
                    uploadTime: new Date().toLocaleString(),
                    fileData: file,
                });
            });
    
            // Update state with new folders
            setFolders(prevFolders => [...prevFolders, ...newFolders]);
            
            // Example of how you might handle actual folder upload to server
            newFolders.forEach(async (folder) => {
                console.log(`Uploading folder: ${folder.name}`);
                // Process each file in the folder
                folder.files.forEach(async (file) => {
                    const arrayBuffer = await file.fileData.arrayBuffer();
                    // Perform upload operation here
                });
            });
        } catch (error) {
            console.error('Folder upload failed:', error);
        }
    };
    

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        handleFilesUpload(event);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUploadFolderClick = () => {
        if (folderInputRef.current) {
            folderInputRef.current.click();
        }
    };

    const handleFolderToggle = (index) => {
        const updatedFolders = [...folders];
        updatedFolders[index].isOpen = !updatedFolders[index].isOpen;
        setFolders(updatedFolders);
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
                    <span className='upload-txt'>Upload Files</span>
                    <div className='file-upload'>
                        <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '80%'}}>
                            <div className='upload-btns'>
                                <button className="upload-btn" onClick={handleUploadClick}>
                                    <i className="bi bi-upload"></i> Select File
                                </button>
                                <button className="upload-btn" onClick={handleUploadFolderClick}>
                                    <i className="bi bi-folder2-open"></i> Upload Folder
                                </button>
                                <input
                                    ref={folderInputRef}
                                    id="folder-upload-input"
                                    type="file"
                                    webkitdirectory="true"
                                    directory=""
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFolderUpload}
                                />
                            </div>
                            <div
                                className="upload-box"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={handleUploadClick}
                                style={{display: 'flex', flexDirection: 'column'}}
                            >
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        id="file-upload-input"
                                        type="file"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFilesUpload}
                                    />
                                    <span style={{ margin: 'auto', color: 'gray', fontSize: '16' }}>
                                        Drag & drop files here or click to upload
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='ext-upload-btns'>
                            <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
                            <button className="ext-upload-btn" onClick={() => alert('coming soon!')}>
                                 <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
                             </button>
                             <button className="ext-upload-btn" onClick={() => alert('coming soon!')}>
                                 <i className="bi bi-dropbox"></i> Drop Box
                             </button>
                        </div>
                    </div>
                </div>
                <div className="files-list">
                    {folders.map((folder, index) => (
                        <div key={index} className="folder-item">
                            <div className="folder-header" onClick={() => handleFolderToggle(index)}>
                                <i className={`bi ${folder.isOpen ? 'bi-folder-open' : 'bi-folder'}`}></i>
                                <p className="folder-name">{folder.name}</p>
                            </div>
                            {folder.isOpen && (
                                <div className="folder-contents">
                                    {folder.files.map((file, fileIndex) => (
                                        <div key={fileIndex} className="file-item">
                                            <div className="file-details">
                                                <p className="file-name">{file.name}</p>
                                                <p className="file-upload-time">{file.uploadTime}</p>
                                                <div className="file-actions">
                                                    <i className="bi bi-three-dots" onClick={() => handleOptionsClick(fileIndex)}></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                                                        <div className="file-details">
                                <p className="file-name">{file.name}</p>
                                <p className="file-upload-time">{file.uploadTime}</p>
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
            </div>
        </div>
    );
};

export default Fileupload;

