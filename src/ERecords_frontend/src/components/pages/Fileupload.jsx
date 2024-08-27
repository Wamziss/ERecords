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
    const authClient = useAuth();

    useEffect(() => {
        if (!authClient) {
            console.log("AuthClient is not yet initialized.");
            return;
        }

        console.log("AuthClient initialized:");

        // Fetch files from the backend when authClient is available
        const fetchFiles = async () => {
            try {
                const userId = authClient.getIdentity().getPrincipal().toText();
                // console.log(userId);
                const fetchedFiles = await ERecords_backend.getUserFiles(userId);
                setFiles(fetchedFiles);
                const fileMap = new Map(fetchedFiles.map(file => [file.id, file.fileData]));
                setFilesMap(fileMap);
            } catch (error) {
                console.error("Error fetching files:", error);
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
            } catch (error) {
                console.error("File upload failed:", error);
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
                    } else {
                        console.error("Failed to archive the file.");
                    }
                } catch (error) {
                    console.error("Error archiving file:", error);
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
                    const success = await ERecords_backend.deleteFile(userId, fileToDelete.id);
                    console.log("Success value:", success);
                    if (success) {
                        setFiles(files.filter(file => file.id !== selectedFileId));
                        console.log("Success!!")
                    } else {
                        console.error("Failed to delete file from backend.");
                    }
                } catch (error) {
                    console.error("Error deleting file:", error);
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
    
                        const newFilesMap = new Map(filesMap);
                        newFilesMap.set(newFile.id, newFile.fileData);
                        setFilesMap(newFilesMap);
                        setFiles([...files, newFile]);
    
                        await ERecords_backend.uploadFile(userId, newFile.id, newFile.fileData, newFile.name);
                    } catch (error) {
                        console.error("Error uploading file from Dropbox:", error);
                    }
                },
                linkType: 'direct',
                multiselect: false,
                extensions: ['.pdf', '.docx', '.pptx', '.xlsx'],
            });
        } else {
            console.error("Dropbox SDK not loaded.");
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
                                <p className="upload-time">{file.uploadTime}</p>
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




// import React, { useState, useRef, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import '../styles.css';
// import './Styles.css';
// import ShareModal from '../subcomponents/ShareModal';
// import Sidebar from '../Sidebar';
// import { useAuth } from '../../AuthContext.jsx';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
// import { ERecords_backend } from '../../../../declarations/ERecords_backend';
// import Archived from './Archived.jsx';


// function Fileupload() {
//     const [files, setFiles] = useState([]);
//     const [isFocused, setIsFocused] = useState(false);
//     const fileInputRef = useRef(null);
//     const [showShareModal, setShowShareModal] = useState(false);
//     const [showOptionsModal, setShowOptionsModal] = useState(false);
//     const [modalFileId, setModalFileId] = useState(null);
//     const [archivedFiles, setArchivedFiles] = useState([]);
//     const [sharedFiles, setSharedFiles] = useState([]);
//     const [selectedFileId, setSelectedFileId] = useState(null);
//     const [filesMap, setFilesMap] = useState(new Map());
//     const authClient = useAuth();

//     const handleFilesUpload = async (uploadedFiles) => {
//         const newFilesMap = new Map(filesMap);
//         const newFiles = Array.from(uploadedFiles).map(file => {
//             const fileId = generateUniqueToken(); 
//             console.log(fileId);
//             return {
//                 id: fileId,
//                 name: file.name,
//                 uploadTime: new Date().toLocaleString(),
//                 fileData: file
//             };
//         });

//         newFiles.forEach(file => newFilesMap.set(file.id, file.fileData));
//         setFilesMap(newFilesMap);
//         setFiles([...files, ...newFiles]);

//         for (const file of newFiles) {
//             try {
//                 const arrayBuffer = await file.fileData.arrayBuffer();
//                 const fileBlob = new Uint8Array(arrayBuffer);
//                 let folder = "Uploaded Files";
//                 try {
//                     await ERecords_backend.uploadFile(file.id, fileBlob, file.name, folder);   
//                 } catch (error) {
//                     console.log("Error!!!", error);
//                 }
//             } catch (error) {
//                 console.error("File upload failed:", error);
//             }
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

//     const handleShareClick = (fileId) => {
//         setModalFileId(fileId);
//         setShowShareModal(true);
//     };

//     const handleCloseShareModal = () => {
//         setShowShareModal(false);
//         setModalFileId(null);
//     };

//     const handleOptionsClick = (fileId) => {
//         setSelectedFileId(fileId);
//         setShowOptionsModal(true);
//     };

//     const handleCloseOptionsModal = () => {
//         setShowOptionsModal(false);
//         setSelectedFileId(null);
//     };

//     const handleArchive = async () => {
//         if (selectedFileId !== null) {
//             const fileToArchive = files.find(file => file.id === selectedFileId);
    
//             if (fileToArchive) {
//                 try {
//                     // Call the backend to archive the file
//                     const success = await ERecords_backend.archiveFile(fileToArchive.id);
//                     if (success) {
//                         // Update the local state to reflect the archived status
//                         setArchivedFiles([...archivedFiles, {
//                             ...fileToArchive,
//                             archivedTime: new Date().toLocaleString(),
//                         }]);
//                         setFiles(files.filter(file => file.id !== selectedFileId));
//                     } else {
//                         console.error("Failed to archive the file.");
//                     }
//                 } catch (error) {
//                     console.error("Error archiving file:", error);
//                 }
    
//                 handleCloseOptionsModal();
//             }
//         }
//     };

//     // useEffect(() => {
//     //   // Fetch archived files from the backend or from props if needed
//     //   const fetchArchivedFiles = async (fileId) => {
//     //     try {
//     //       const archived = await ERecords_backend.unarchiveFile(fileId); // Add a method to get archived files
//     //       setArchivedFiles(archived);
//     //     } catch (error) {
//     //       console.error("Error fetching archived files:", error);
//     //     }
//     //   };
  
//     //   fetchArchivedFiles();
//     // }, []);
  
//     const handleUnarchive = async (fileId) => {
//       try {
//         const success = await ERecords_backend.unarchiveFile(fileId);
//         if (success) {
//           const fileToRestore = archivedFiles.find(file => file.id === fileId);
//           if (fileToRestore) {
//             setFiles(prevFiles => [...prevFiles, {
//               ...fileToRestore,
//               archivedTime: null, // Clear archived time for restored files
//             }]);
//             setArchivedFiles(prevArchivedFiles => prevArchivedFiles.filter(file => file.id !== fileId));
//           }
//         } else {
//           console.error("Failed to unarchive the file.");
//         }
//       } catch (error) {
//         console.error("Error unarchiving file:", error);
//       }
//     };
        

//     const handleDelete = async () => {
//         if (selectedFileId !== null) {
//             // Find the file to delete
//             const fileToDelete = files.find(file => file.id === selectedFileId);
            
//             if (fileToDelete) {
//                 // Delete the file from the backend
//                 try {
//                     await ERecords_backend.deleteFile(fileToDelete.id); // Assuming there's a deleteFile method in your backend
//                     // Remove the file from the state
//                     setFiles(files.filter(file => file.id !== selectedFileId));
//                     setSelectedFileId(null); // Reset selected file ID
//                 } catch (error) {
//                     console.error("Error deleting file:", error);
//                 }
//             } else {
//                 console.error("File not found:", selectedFileId);
//             }
    
//             handleCloseOptionsModal(); // Close the options modal
//         }
//     };
    

//     const handleShare = () => {
//         if (selectedFileId !== null) {
//             const fileToShare = files.find(file => file.id === selectedFileId);
//             setSharedFiles([...sharedFiles, {
//                 ...fileToShare,
//                 sharedTime: new Date().toLocaleString(),
//             }]);
//             handleCloseShareModal();
//         }
//     };

//     const handleGoogleDriveUpload = () => {
//         // Load the Google API client library
//         window.gapi.load('auth2', () => {
//             const clientId = '422376043263-906451d89c8gqtb5b6e5t2pi326ulp69.apps.googleusercontent.com'
//             window.gapi.auth2.init({client_id: clientId}).then(() => {
//                 // Prompt user to sign in
//                 window.gapi.auth2.getAuthInstance().signIn().then(() => {
//                     const picker = new window.google.picker.PickerBuilder()
//                         .addView(window.google.picker.ViewId.DOCS)
//                         .setOAuthToken(window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token)
//                         .setDeveloperKey('AIzaSyD_OOEI0EBqbcEejutLLfvVdiEGaYijLPs')
//                         .setCallback((data) => {
//                             if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
//                                 const doc = data[window.google.picker.Response.DOCUMENTS][0];
//                                 const fileId = doc[window.google.picker.Document.ID];
//                                 // Use the fileId to get the file content and upload it to your backend
//                                 console.log(`Selected file ID: ${fileId}`);
//                                 // Implement your backend upload logic here
//                             }
//                         })
//                         .build();
//                     picker.setVisible(true);
//                 });
//             });
//         });
//     };
    

//     const handleDropboxUpload = () => {
//         if (typeof Dropbox !== 'undefined' && Dropbox.choose) {
//             Dropbox.appKey = "gea0iibazz6rxwt";
//             Dropbox.choose({
//                 success: async (files) => {
//                     const file = files[0];
//                     console.log(`Selected file: ${file.name}`);
    
//                     // Fetch the file data from Dropbox
//                     try {
//                         const response = await fetch(file.link);
//                         const arrayBuffer = await response.arrayBuffer();
//                         const fileBlob = new Uint8Array(arrayBuffer);
    
//                         // Generate a unique ID for the file
//                         const fileId = generateUniqueToken();
//                         const newFile = {
//                             id: fileId,
//                             name: file.name,
//                             uploadTime: new Date().toLocaleString(),
//                             fileData: fileBlob,
//                         };
    
//                         // Add the file to the file list
//                         const newFilesMap = new Map(filesMap);
//                         newFilesMap.set(newFile.id, newFile.fileData);
//                         setFilesMap(newFilesMap);
//                         setFiles((prevFiles) => [...prevFiles, newFile]);
    
//                         // Upload to backend
//                         let folder = "Uploaded Files";
//                         try {
//                             await ERecords_backend.uploadFile(newFile.id, fileBlob, newFile.name, folder);   
//                         } catch (error) {
//                             console.log("Error uploading to backend:", error);
//                         }
//                     } catch (error) {
//                         console.error("Failed to fetch file from Dropbox:", error);
//                     }
//                 },
//                 linkType: 'direct', // Use 'direct' to get the actual file link
//                 multiselect: true,
//                 extensions: ['.pdf', '.doc', '.jpg', '.png', '.docx'],
//             });
//         } else {
//             console.error('Dropbox SDK is not loaded or choose method is not available');
//         }
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
//                         <div className='ext-upload-btns'>
//                             <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
//                             <button className="ext-upload-btn" onClick={handleGoogleDriveUpload}>
//                                 <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
//                             </button>
//                             <button className="ext-upload-btn" onClick={handleDropboxUpload}>
//                                 <i className="bi bi-dropbox"></i> Drop Box
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="files-list">
//                     {files.map((file) => (
//                         <div key={file.id} className="file-item">
//                             <div className="file-details">
//                                 <p className="file-name">{file.name}</p>
//                                 <p className="upload-time">{file.uploadTime}</p>
//                             </div>
//                             <div className="file-actions">
//                                 <i className="bi bi-share" onClick={() => handleShareClick(file.id)}></i>
//                                 {modalFileId && (
//                                     <ShareModal
//                                         show={showShareModal}
//                                         handleClose={handleCloseShareModal}
//                                         fileId={modalFileId}
//                                         filesMap={filesMap} 
//                                     />
//                                 )}
//                                 <i className="bi bi-three-dots" onClick={() => handleOptionsClick(file.id)}></i>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//                 {/* <Archived archivedFiles={archivedFiles} setFiles={setFiles} setArchivedFiles={setArchivedFiles} /> */}
    
//                 {/* Options Modal */}
//                 <Modal show={showOptionsModal} onHide={handleCloseOptionsModal}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>File Options</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Button variant="secondary" onClick={handleArchive}>Archive</Button>
//                         <Button variant="danger" className="ms-2" onClick={handleDelete}>Delete</Button>
//                         <Button variant="warning" className="ms-2" onClick={() => alert('Rename option coming soon!')}>Rename</Button>
//                     </Modal.Body>
//                 </Modal>
//             </div>
//         </div>
//     );
// }

// export default Fileupload;

// const generateUniqueToken = () => {
//     return Math.random().toString(36).substr(2, 17);
// };

