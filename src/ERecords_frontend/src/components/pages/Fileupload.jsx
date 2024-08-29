import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles.css';
import './Styles.css';
import ShareModal from '../subcomponents/ShareModal';
import Sidebar from '../Sidebar';
import { useAuth } from '../../AuthContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ERecords_backend } from '../../../../declarations/ERecords_backend';
import Archived from './Archived.jsx';
import { Actor, HttpAgent} from '@dfinity/agent';
import { idlFactory } from '../../../../declarations/ERecords_backend/ERecords_backend.did.js';
// import { useAuth } from '../../AuthContext';

function Fileupload() {
    const [files, setFiles] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [modalFileId, setModalFileId] = useState(null);
    const [archivedFiles, setArchivedFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [filesMap, setFilesMap] = useState(new Map());
    const [myalert, setMyalert] = useState('');
    const [myalertmsg, setShowalert] = useState(false);
    const [successmsg, setSuccessmsg] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const authClient = useAuth();

    const showSuccessMessage = (message) => {
        setSuccessmsg(message);
        setShowMessage(true);
      };
    const ShowMyalert = (message) => {
        setMyalert(message);
        setShowalert(true);
      };

    //   useEffect(() => {
    //     first
      
    //     return () => {
    //       second
    //     }
    //   }, [third])
      

      useEffect(() => {
        if (showMessage) {
          const timer = setTimeout(() => {
            setShowMessage(false);
          }, 500); // 500 seconds
    
          return () => clearTimeout(timer); // Cleanup timer on unmount
        }
      }, [showMessage]);

      useEffect(() => {
        if (myalertmsg) {
          const timer = setTimeout(() => {
            setShowalert(false);
          }, 500); // 500 seconds
    
          return () => clearTimeout(timer); // Cleanup timer on unmount
        }
      }, [myalertmsg]);

    useEffect(() => {
        if (!authClient) {
            console.log("AuthClient is not yet initialized.");
            return;
        }

        
        const identity = authClient.getIdentity();
        const canisterId = import.meta.env.VITE_CANISTER_ID;

        console.log("Hurray!:", identity.getPrincipal().toText());

        if (!canisterId) {
            throw new Error('Canister ID is not defined');
        }

        const getAuthenticatedActor = () => {
            try {
                const agent = new HttpAgent({ identity });
                return Actor.createActor(idlFactory, { agent, canisterId });
            } catch (error) {
                console.error("Failed to create actor:", error);
                throw error;
            }
        }

        console.log("AuthClient initialized:");

        // Fetch files from the backend when authClient is available
        const fetchFiles = async () => {
            const actor = getAuthenticatedActor();
            console.log("actor:", actor);
            try {
                const userId = authClient.getIdentity().getPrincipal().toText();
                // console.log(userId);
                // const fetchedFiles = await ERecords_backend.getUserFiles(userId);
                const fetchedFiles = await actor.getUserFiles(userId);
                setFiles(fetchedFiles);
                const fileMap = new Map(fetchedFiles.map(file => [file.id, file.fileData]));
                setFilesMap(fileMap);
            } catch (error) {
                console.error("Error fetching files:", error);
                // setMyalert('Error retrieving files');
            }
        };

        fetchFiles();
    }, [authClient]);

    const generateUniqueToken = () => {
    return Math.random().toString(36).substr(2, 17);
};

    const handleFilesUpload = async (uploadedFiles) => {
        if (!authClient) {
            console.error("AuthClient is not initialized.");
            return;
        }

        const userId = authClient.getIdentity().getPrincipal().toText();
        const newFilesMap = new Map(filesMap);
        const newFiles = Array.from(uploadedFiles).map(file => {
            const fileId = generateUniqueToken(); 
            return {
                id: fileId,
                name: file.name,
                uploadTime: new Date().toLocaleString(),
                fileData: file
            };
        });

        newFiles.forEach(file => newFilesMap.set(file.id, file.fileData));
        setFilesMap(newFilesMap);
        setFiles([...files, ...newFiles]);

        for (const file of newFiles) {
            try {
                const arrayBuffer = await file.fileData.arrayBuffer();
                const fileBlob = new Uint8Array(arrayBuffer);
                let folder = "Uploaded Files";
                await ERecords_backend.uploadFile( file.id, fileBlob, file.name, folder, userId);
                showSuccessMessage('File successfully uploaded')
            } catch (error) {
                console.error("File upload failed:", error);
                ShowMyalert('File upload failed');
            }
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

    const handleShareClick = (fileId) => {
        
        setModalFileId(fileId);
        setShowShareModal(true);
    };

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        setModalFileId(null);
    };

    const handleOptionsClick = (fileId) => {
        setSelectedFileId(fileId);
        setShowOptionsModal(true);
    };

    const handleCloseOptionsModal = () => {
        setShowOptionsModal(false);
        setSelectedFileId(null);
    };

    const handleArchive = async () => {
        if (selectedFileId !== null) {
            const fileToArchive = files.find(file => file.id === selectedFileId);
    
            if (fileToArchive) {
                const userId = authClient.getIdentity().getPrincipal().toText();
                try {
                    const success = await ERecords_backend.archiveFile(userId, fileToArchive.id);
                    if (success) {
                        setArchivedFiles([...archivedFiles, {
                            ...fileToArchive,
                            archivedTime: new Date().toLocaleString(),
                        }]);
                        setFiles(files.filter(file => file.id !== selectedFileId));
                        
                        showSuccessMessage('File archived')
                    } else {
                        console.error("Failed to archive the file.");
                    }
                } catch (error) {
                    console.error("Error archiving file:", error);
                    ShowMyalert('Unable to archive file');
                    
                }
    
                handleCloseOptionsModal();
            }
        }
    };

    const handleUnarchive = async (fileId) => {
        try {
            const success = await ERecords_backend.unarchiveFile(userId, fileId);
            if (success) {
                const fileToRestore = archivedFiles.find(file => file.id === fileId);
                if (fileToRestore) {
                    setFiles(prevFiles => [...prevFiles, {
                        ...fileToRestore,
                        archivedTime: null, // Clear archived time for restored files
                    }]);
                    setArchivedFiles(prevArchivedFiles => prevArchivedFiles.filter(file => file.id !== fileId));
                }
            } else {
                console.error("Failed to unarchive the file.");
            }
        } catch (error) {
            console.error("Error unarchiving file:", error);
        }
    };

    const handleDelete = async () => {
        if (selectedFileId !== null) {
            const fileToDelete = files.find(file => file.id === selectedFileId);
            
            if (fileToDelete) {
                const userId = authClient.getIdentity().getPrincipal().toText();
                try {
                    console.log(userId, fileToDelete.id);
                    const success = await ERecords_backend.deleteFile(userId, fileToDelete.id);
                    console.log("Success value:", success);
                    if (success) {
                        setFiles(files.filter(file => file.id !== selectedFileId));
                        
                        showSuccessMessage('File deleted')
                        // console.log("Success!!")
                    } else {
                        console.error("Failed to delete file from backend.");
                    }
                } catch (error) {
                    console.error("Error deleting file:", error);
                    ShowMyalert('Unable to delete file');
                }
            } else {
                console.error("File not found:", selectedFileId);
            }
    
            handleCloseOptionsModal();
        }
    };

    const handleShare = () => {
        if (selectedFileId !== null) {
            const fileToShare = files.find(file => file.id === selectedFileId);
            setSharedFiles([...sharedFiles, {
                ...fileToShare,
                sharedTime: new Date().toLocaleString(),
            }]);
            handleCloseShareModal();
        }
    };


    const handleGoogleDriveUpload = () => {
        try {
            window.gapi.load('auth2', () => {
                const clientId = '422376043263-906451d89c8gqtb5b6e5t2pi326ulp69.apps.googleusercontent.com'
                window.gapi.auth2.init({client_id: clientId}).then(() => {
                    window.gapi.auth2.getAuthInstance().signIn().then(() => {
                        const picker = new window.google.picker.PickerBuilder()
                            .addView(window.google.picker.ViewId.DOCS)
                            .setOAuthToken(window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
                            .setDeveloperKey('AIzaSyD_OOEI0EBqbcEejutLLfvVdiEGaYijLPs')
                            .setCallback((data) => {
                                if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                                    const doc = data[window.google.picker.Response.DOCUMENTS][0];
                                    const fileId = doc[window.google.picker.Document.ID];
                                    console.log(`Selected file ID: ${fileId}`);
                                    // Implement your backend upload logic here
                                }
                            })
                            .build();
                        picker.setVisible(true);
                    });
                });
            });
            
            showSuccessMessage('Uploading from Google Drive')
        } catch (error) {
            ShowMyalert('Unable to access Google Drive');
        }
    };
    const handleDropboxUpload = () => {
        if (typeof Dropbox !== 'undefined' && Dropbox.choose) {
            Dropbox.appKey = "gea0iibazz6rxwt";
            Dropbox.choose({
                success: async (files) => {
                    const file = files[0];
                    console.log(`Selected file: ${file.name}`);
        
                    try {
                        const response = await fetch(file.link);
                        const arrayBuffer = await response.arrayBuffer();
                        const fileBlob = new Uint8Array(arrayBuffer);
        
                        const fileId = generateUniqueToken();
                        const newFile = {
                            id: fileId,
                            name: file.name,
                            uploadTime: new Date().toLocaleString(),
                            fileData: fileBlob,
                        };
        
                        // Check for duplicates before adding
                        const fileExists = files.some(existingFile => existingFile.id === newFile.id);
                        if (!fileExists) {
                            // Update filesMap
                            const newFilesMap = new Map(filesMap);
                            newFilesMap.set(newFile.id, newFile.fileData);
                            setFilesMap(newFilesMap);
        
                            // Update files state
                            setFiles(prevFiles => [...prevFiles, newFile]);
        
                            // Upload the file
                            await ERecords_backend.uploadFile(userId, newFile.id, newFile.fileData, newFile.name);
                        } else {
                            console.log("File already exists in the list.");
                        }
                    } catch (error) {
                        console.error("Error uploading file from Dropbox:", error);
                        // ShowMyalert('Unable to upload file from Dropbox');
                    }
                },
                linkType: 'direct',
                multiselect: false,
                extensions: ['.pdf', '.docx', '.pptx', '.xlsx'],
            });
            showSuccessMessage('Uploading from Dropbox')
        } else {
            console.error("Dropbox SDK not loaded.");
            ShowMyalert('Unable to load Dropbox');
        }
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
            <p style={{
                display: successmsg ? 'block' : 'none',
                backgroundColor: successmsg ? '#0f01' : 'transparent',
                // color: 'white',
                padding: '10px',
                borderRadius: '15px',
                position: 'absolute',
                right: '20px',
                top: '20px',
                border: '1px solid #0f0',
                zIndex: 999
            }}
            >{successmsg}</p>
            <p style={{
                display: myalert ? 'block' : 'none',
                backgroundColor: myalert ? '#f001' : 'transparent',
                // color: 'white',
                padding: '10px',
                borderRadius: '15px',
                position: 'absolute',
                right: '30px',
                top: '20px',
                border: '1px solid #f00',
                zIndex: 999
            }}
            >{myalert}</p>
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
                        <div className='ext-upload-btns'>
                            <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
                            <button className="ext-upload-btn" onClick={handleGoogleDriveUpload}>
                                <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
                            </button>
                            <button className="ext-upload-btn" onClick={handleDropboxUpload}>
                                <i className="bi bi-dropbox"></i> Drop Box
                            </button>
                        </div>
                    </div>
                </div>
                <div className="files-list">
                    {files.map((file) => (
                        <div key={file.id} className="file-item">
                            <div className="file-details">
                                <p className="file-name">{file.name}</p>
                                {/* <p className="upload-time">{file.uploadTime}</p> */}
                            </div>
                            <div className="file-actions">
                                <i className="bi bi-share" onClick={() => handleShareClick(file.id)}></i>
                                {modalFileId && (
                                    <ShareModal
                                        show={showShareModal}
                                        handleClose={handleCloseShareModal}
                                        fileId={modalFileId}
                                        filesMap={filesMap} 
                                    />
                                )}
                                <i className="bi bi-three-dots" onClick={() => handleOptionsClick(file.id)}></i>
                            </div>
                        </div>
                    ))}
                </div>
                {/* <Archived archivedFiles={archivedFiles} setFiles={setFiles} setArchivedFiles={setArchivedFiles} /> */}
    
                {/* Options Modal */}
                <Modal show={showOptionsModal} onHide={handleCloseOptionsModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>File Options</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Button variant="secondary" onClick={(userId) => handleArchive(userId)}>Archive</Button>
                        <Button variant="danger" className="ms-2" onClick={handleDelete}>Delete</Button>
                        <Button variant="warning" className="ms-2" onClick={() => alert('Rename option coming soon!')}>Rename</Button>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
}

export default Fileupload;