import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles.css'

function Fileupload() {
    const [files, setFiles] = useState([]);
    const [isFocused, setIsFocused] = React.useState(false);
    const fileInputRef = useRef(null);

    const handleFilesUpload = (uploadedFiles) => {
        const newFiles = Array.from(uploadedFiles).map(file => ({
            name: file.name,
            uploadTime: new Date().toLocaleString(),
        }));
        setFiles([...files, ...newFiles]);
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
          // marginBottom: '20px',
          margin: '10px auto',
      }
    }

    return (
      <div className='main-file-upload'>
        <div style={styles.searchContainer}>
            <input 
                type="text" 
                className="form-control" 
                style={isFocused ? {...styles.searchInput, ...styles.searchInputFocus} : styles.searchInput}
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
                  <span style={{margin: 'auto', color: 'gray', fontSize: '16'}}>Drag & drop files here or click to upload</span>
            </div>
            <div className='upload-btns'>
              <span style={{fontSize: 10, color: 'gray',}}>upload from*</span>
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
                            <i className="bi bi-share"></i>
                            <i className="bi bi-three-dots" onClick={() => alert('Options: Delete, Archive, Rename')}></i>
                        </div>
                    </div>
                ))}
            </div>
      </div>
    );
}

export default Fileupload;

