import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles.css';
import './Styles.css';
import ShareModal from '../subcomponents/ShareModal';
import Sidebar from '../Sidebar';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../../declarations/ERecords_backend';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Actor, HttpAgent} from '@dfinity/agent';
import { DelegationIdentity } from '@dfinity/identity';
import { idlFactory } from '../../../../declarations/ERecords_backend/ERecords_backend.did.js';
import { useAuth } from '../../AuthContext.jsx';

const agent = new HttpAgent();
// const erecords = Actor.createActor(idlFactory, { agent, canisterId });



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
    const accessLink = "Accesslink://accesslink"; 
    const [filesMap, setFilesMap] = useState(new Map());
    const [modalFileId, setModalFileId] = useState(null);
    const authClient = useAuth();
    // const handleShareClick = (index) => {
    //     setModalFileIndex(index);
    //     setShowShareModal(true);
    // };
    const handleShareClick = (fileId) => {
        
        // const file = files[index];
        // const sharedFiles = JSON.parse(localStorage.getItem('sharedFiles')) || [];
        // sharedFiles.push({
        //     name: file.name,
        //     sharedTime: new Date().toLocaleString(),
        // });
        // localStorage.setItem('sharedFiles', JSON.stringify(sharedFiles));
        // setModalFileIndex(index);
        setShowShareModal(true);
        setModalFileId(fileId);
        
    };
    

    const handleCloseShareModal = () => {
        setShowShareModal(false);
        setModalFileIndex(null);
    };

    const handleOptionsClick = (fileId) => {
        setSelectedFile(fileId);
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

    const getAuthenticatedActor = () => {
        if (!authClient) {
            throw new Error("User is not authenticated. Please sign in first.");
        }
    
        const identity = authClient.getIdentity(); // Get the identity directly from the AuthClient instance
        const canisterId = import.meta.env.VITE_CANISTER_ID;
        
        console.log("Hurray!:", identity.getPrincipal().toText());

        if (!canisterId) {
            throw new Error('Canister ID is not defined');
        }
    
        try {
            const agent = new HttpAgent({ host: 'http://localhost:8000', identity });
            return Actor.createActor(idlFactory, { agent, canisterId });
        } catch (error) {
            console.error("Failed to create actor:", error);
            throw error;
        }
    };
    
    const handleFilesUpload = async (uploadedFiles) => {
        const actor = getAuthenticatedActor();
        try {
            const newFilesMap = new Map(filesMap);
            const newFiles = Array.from(uploadedFiles).map(file => {
                const fileId = generateUniqueToken(); // Implement your unique token generation
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
                const arrayBuffer = await file.fileData.arrayBuffer();
                const fileBlob = new Uint8Array(arrayBuffer);
                let folder = "Uploaded Files";
    
                try {
                    await actor.uploadFile(fileBlob, file.name, folder);
                } catch (error) {
                    console.error("Error is:", error)
                }
            }
        } catch (error) {
            console.error('File upload failed:', error);
        }
    };    

    // const getAuthenticatedActor = () => {
    //     const identityJson = window.sessionStorage.getItem('identity');

    //     const canisterId = import.meta.env.VITE_CANISTER_ID;
        
    //     if (!canisterId) {
    //         throw new Error('Canister ID is not defined');
    //     }
    
    //     if (identityJson) {
    //         const identity = JSON.parse(identityJson);
    
    //         try {
    //             const agent = new HttpAgent({ identity });
    //             return Actor.createActor(idlFactory, { agent, canisterId });
    //         } catch (error) {
    //             console.error("Failed to create actor:", error);
    //             throw error;
    //         }
    //     }

        
        
    // };

    // const handleFilesUpload = async (uploadedFiles) => {
    //     const actor = getAuthenticatedActor();
    //     try {
    //       const newFilesMap = new Map(filesMap);
    //       const newFiles = Array.from(uploadedFiles).map(file => {
    //           const fileId = generateUniqueToken(); // Implement your unique token generation
    //           return {
    //               id: fileId,
    //               name: file.name,
    //               uploadTime: new Date().toLocaleString(),
    //               fileData: file
    //           };
    //       });
  
    //       newFiles.forEach(file => newFilesMap.set(file.id, file.fileData));
    //       setFilesMap(newFilesMap);
    //       setFiles([...files, ...newFiles]);
      
    //       for (const file of newFiles) {
    //         const arrayBuffer = await file.fileData.arrayBuffer();
    //         // const fileBlob = new Blob([arrayBuffer]); // Convert to Blob type
    //         const fileBlob = new Uint8Array(arrayBuffer);
    //         let folder = "Uploaded Files";
        
    //         try {
    //             await actor.uploadFile(fileBlob, file.name, folder);
    //         } catch (error) {
    //             console.error("Error is:", error)
    //         }
    //     }
        
      
    //     } catch (error) {
    //       console.error('File upload failed:', error);
    //     }
    //   };
    

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
                    {files.map((file, fileId) => (
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
                                <i className="bi bi-three-dots" onClick={() => handleOptionsClick(fileId)}></i>
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

const generateUniqueToken = () => {
    return Math.random().toString(36).substr(2, 11);
};



// {folders.map((folder, index) => (
//     <div key={index}>
//         <div
//             onClick={() => handleFolderToggle(index)}
//             style={{ cursor: 'pointer', fontWeight: 'bold' }}
//         >
//             {folder.name} {openFolders.includes(index) ? '[-]' : '[+]'}
//         </div>
//         {openFolders.includes(index) && (
//             <div style={{ marginLeft: '20px' }}>
//                 {folder.files.map((file, fileIndex) => (
//                     <div key={fileIndex} className="file-item">
//                         <div className="file-details">
//                             <p className="file-name">{file.name}</p>
//                             <p className="upload-time">{file.uploadTime}</p>
//                         </div>
//                         <div className="file-actions">
//                             <i className="bi bi-share" onClick={() => handleShareClick(fileIndex)}></i>
//                             {modalFileIndex === fileIndex && (
//                                 <ShareModal
//                                     show={showShareModal}
//                                     handleClose={handleCloseShareModal}
//                                     accessLink={accessLink}
//                                 />
//                             )}
//                             <i className="bi bi-three-dots" onClick={() => handleOptionsClick(fileIndex)}></i>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         )}
//     </div>
// ))}
// import React, { useState, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import '../styles.css';
// import './Styles.css';
// import ShareModal from '../subcomponents/ShareModal';
// import Sidebar from '../Sidebar';
// import Modal from 'react-bootstrap/Modal';
// import Button from 'react-bootstrap/Button';
// import { Actor, HttpAgent } from '@dfinity/agent';
// import { idlFactory } from '../../../../declarations/ERecords_backend/ERecords_backend.did.js';
// import mammoth from 'mammoth';
// import { PDFDocumentProxy } from 'pdfjs-dist';
// import * as XLSX from 'xlsx';

// const canisterId = import.meta.env.VITE_CANISTER_ID;
// const agent = new HttpAgent();
// const erecords = Actor.createActor(idlFactory, { agent, canisterId });

// function Fileupload({ fileId }) {
//     const [files, setFiles] = useState([]);
//     const [folders, setFolders] = useState([]);
//     const [isFocused, setIsFocused] = useState(false);
//     const fileInputRef = useRef(null);
//     const folderInputRef = useRef(null);
//     const [showShareModal, setShowShareModal] = useState(false);
//     const [showOptionsModal, setShowOptionsModal] = useState(false);
//     const [modalFileIndex, setModalFileIndex] = useState(null);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [selectedFolder, setSelectedFolder] = useState(null);
//     const [selectedFileContent, setSelectedFileContent] = useState('');
//     const [showFileModal, setShowFileModal] = useState(false);
//     const [qrCodeValue, setQrCodeValue] = useState('');
//     const accessLink = `https://yourappdomain.com/access/${fileId}`;
//     const [selectedFileId, setSelectedFileId] = useState(null);
    
//     const generateUniqueToken = () => {
//         return Math.random().toString(36).substr(2, 9); // Adjust length if needed
//     };


//     const handleFileClick = (file) => {
//         const reader = new FileReader();
    
//         reader.onload = () => {
//             if (file.fileData.type === 'application/pdf') {
//                 const arrayBuffer = reader.result;
//                 pdfjsLib.getDocument(arrayBuffer).promise.then(pdf => {
//                     pdf.getPage(1).then(page => {
//                         page.getTextContent().then(textContent => {
//                             // Display PDF text content
//                             setSelectedFileContent(textContent.items.map(item => item.str).join(' '));
//                         });
//                     });
//                 }).catch(error => {
//                     console.error('Error reading PDF file:', error);
//                     setSelectedFileContent('Error reading file content.');
//                 });
//             } else if (file.fileData.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
//                 // Handle .docx files
//                 try {
//                     const arrayBuffer = reader.result;
//                     const result = mammoth.extractRawText({ arrayBuffer });
//                     setSelectedFileContent(result.value);
//                 } catch (error) {
//                     console.error('Error reading .docx file:', error);
//                     setSelectedFileContent('Error reading file content.');
//                 }
//             } else if (file.fileData.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//                     const arrayBuffer = reader.result;
//                     const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//                     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//                     const data = XLSX.utils.sheet_to_html(worksheet);
//                     setSelectedFileContent(data); // Display the sheet as HTML
//             } else {
//                 // Handle other file types as text
//                 setSelectedFileContent(reader.result);
//                 reader.readAsArrayBuffer(file.fileData);
//             }
//             setShowFileModal(true);
//         };
    
//         reader.readAsArrayBuffer(file.fileData); // Read as ArrayBuffer for .docx
//     };
    

//     const handleShareClick = ({ fileId }) => {
//         setSelectedFileId(fileId);
//         setShowShareModal(true);
//         setQrCodeValue(accessLink);
//     };

//     const handleCloseShareModal = () => {
//         setShowShareModal(false);
//         setModalFileIndex(null);
//     };

//     const handleOptionsClick = (index) => {
//         setSelectedFile(index);
//         setShowOptionsModal(true);
//     };

//     const handleCloseOptionsModal = () => {
//         setShowOptionsModal(false);
//         setSelectedFile(null);
//     };

//     const handleShare = () => {
//         if (selectedFile !== null) {
//             const fileToShare = files[selectedFile];
//             setFiles(prevFiles => prevFiles.map((file, index) => 
//                 index === selectedFile ? { ...file, sharedTime: new Date().toLocaleString() } : file
//             ));
//             handleCloseShareModal();
//         }
//     };

//     const handleArchive = () => {
//         if (selectedFile !== null) {
//             setFiles(prevFiles => prevFiles.filter((_, index) => index !== selectedFile));
//             handleCloseOptionsModal();
//         }
//     };

//     const handleFilesUpload = async (event) => {
//         try {
//             const uploadedItems = Array.from(event.target.files);
//             const newFiles = uploadedItems.map(file => ({
//                 name: file.name,
//                 uploadTime: new Date().toLocaleString(),
//                 fileData: file,
//                 type: 'file',
//             }));

//             setFiles(prevFiles => [...prevFiles, ...newFiles]);

//             newFiles.forEach(async (file) => {
//                 const arrayBuffer = await file.fileData.arrayBuffer();
//                 console.log(`Uploading file: ${file.name}`);
//             });
//         } catch (error) {
//             console.error('File upload failed:', error);
//         }
//     };

//     const handleFolderUpload = (event) => {
//         try {
//             const uploadedItems = Array.from(event.target.files);
//             const newFolders = [];
    
//             uploadedItems.forEach(file => {
//                 const folderPath = file.webkitRelativePath.split('/');
//                 const folderName = folderPath[0];
//                 const fileName = folderPath.slice(1).join('/');
    
//                 let folder = newFolders.find(f => f.name === folderName);
//                 if (!folder) {
//                     folder = { name: folderName, files: [] };
//                     newFolders.push(folder);
//                 }
//                 folder.files.push({
//                     name: fileName,
//                     uploadTime: new Date().toLocaleString(),
//                     fileData: file,
//                 });
//             });
    
//             setFolders(prevFolders => [...prevFolders, ...newFolders]);
            
//             newFolders.forEach(async (folder) => {
//                 console.log(`Uploading folder: ${folder.name}`);
//                 folder.files.forEach(async (file) => {
//                     const arrayBuffer = await file.fileData.arrayBuffer();
//                 });
//             });
//         } catch (error) {
//             console.error('Folder upload failed:', error);
//         }
//     };

//     const handleDragOver = (event) => {
//         event.preventDefault();
//     };

//     const handleDrop = (event) => {
//         event.preventDefault();
//         handleFilesUpload(event);
//     };

//     const handleUploadClick = () => {
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     };

//     const handleUploadFolderClick = () => {
//         if (folderInputRef.current) {
//             folderInputRef.current.click();
//         }
//     };

//     const handleFolderToggle = (index) => {
//         const updatedFolders = [...folders];
//         updatedFolders[index].isOpen = !updatedFolders[index].isOpen;
//         setFolders(updatedFolders);
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
//                     <span className='upload-txt'>Upload Files</span>
//                     <div className='file-upload'>
//                         <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '80%'}}>
//                             <div className='upload-btns'>
//                                 <button className="upload-btn" onClick={handleUploadClick}>
//                                     <i className="bi bi-upload"></i> Select File
//                                 </button>
//                                 <button className="upload-btn" onClick={handleUploadFolderClick}>
//                                     <i className="bi bi-folder2-open"></i> Upload Folder
//                                 </button>
//                                 <input
//                                     ref={folderInputRef}
//                                     id="folder-upload-input"
//                                     type="file"
//                                     webkitdirectory="true"
//                                     directory=""
//                                     multiple
//                                     style={{ display: 'none' }}
//                                     onChange={handleFolderUpload}
//                                 />
//                             </div>
//                             <div
//                                 className="upload-box"
//                                 onDragOver={handleDragOver}
//                                 onDrop={handleDrop}
//                                 onClick={handleUploadClick}
//                                 style={{display: 'flex', flexDirection: 'column'}}
//                             >
//                                 <div>
//                                     <input
//                                         ref={fileInputRef}
//                                         id="file-upload-input"
//                                         type="file"
//                                         multiple
//                                         style={{ display: 'none' }}
//                                         onChange={handleFilesUpload}
//                                     />
//                                     <span style={{ margin: 'auto', color: 'gray', fontSize: '16' }}>
//                                         Drag & drop files here or click to upload
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className='ext-upload-btns'>
//                             <span style={{ fontSize: 10, color: 'gray', }}>upload from*</span>
//                             <button className="ext-upload-btn" onClick={() => alert('coming soon!')}>
//                                  <i className="bi bi-cloud-arrow-up-fill"></i> Google Drive
//                              </button>
//                              <button className="ext-upload-btn" onClick={() => alert('coming soon!')}>
//                                  <i className="bi bi-cloud-arrow-up-fill"></i> Dropbox
//                              </button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="files-list">
//                     {files.length > 0 && (
//                         <div className="files-section">
//                             <h3>Files</h3>
//                             {files.map((file, index) => (
//                                 <div key={index} className="file-item">
//                                     <span className="file-name">{file.name}</span>
//                                     <button
//                                         className="btn btn-secondary btn-sm"
//                                         onClick={() => handleFileClick(file)}
//                                     >
//                                         <i className="bi bi-eye"></i> View
//                                     </button>
//                                     <button
//                                         className="btn btn-info btn-sm"
//                                         onClick={() => handleShareClick(file)}
//                                     >
//                                         <i className="bi bi-share"></i> Share
//                                     </button>
//                                     <button
//                                         className="btn btn-danger btn-sm"
//                                         onClick={() => handleOptionsClick(index)}
//                                     >
//                                         <i className="bi bi-gear"></i> Options
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 <Modal show={showShareModal} onHide={handleCloseShareModal}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>Share File</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <p>Share the file using this QR code:</p>
//                         <div className="qr-code-container">
//                             {/* Replace with actual QR code rendering */}
//                             <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrCodeValue}`} alt="QR Code" />
//                         </div>
//                         <p>Access link: <a href={qrCodeValue} target="_blank" rel="noopener noreferrer">{qrCodeValue}</a></p>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={handleCloseShareModal}>Close</Button>
//                         <Button variant="primary" onClick={handleShare}>Share</Button>
//                     </Modal.Footer>
//                 </Modal>

//                 <Modal show={showOptionsModal} onHide={handleCloseOptionsModal}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>Options</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Button variant="primary" onClick={handleShare}>
//                             <i className="bi bi-share"></i> Share
//                         </Button>
//                         <Button variant="danger" onClick={handleArchive} className="mt-2">
//                             <i className="bi bi-archive"></i> Archive
//                         </Button>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={handleCloseOptionsModal}>Close</Button>
//                     </Modal.Footer>
//                 </Modal>

//                 <Modal show={showFileModal} onHide={() => setShowFileModal(false)}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>File Content</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <pre>{selectedFileContent}</pre>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button variant="secondary" onClick={() => setShowFileModal(false)}>Close</Button>
//                     </Modal.Footer>
//                 </Modal>
//             </div>
//         </div>
//     );
// }

// export default Fileupload;



