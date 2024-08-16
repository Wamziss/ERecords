import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';

const Shared = () => {
  const [sharedFiles, setSharedFiles] = useState([]);

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('sharedFiles')) || [];
    setSharedFiles(storedFiles);
  }, []);

  const styles = {
    mainContainer: {
      display: 'flex',
      fontFamily: 'verdana',
      margin: 0,
      padding: 0,
      width: '100%',
      height: '100vh',
      overflowY: 'scroll',
    }
  };

  return (
    <div style={styles.mainContainer} className='row'>
      <Sidebar />
      <div className='main-contentarea'>
        <div className='shared-files'>
          <h2 style={{fontSize: 27, fontWeight: 'bold', marginBottom: '20px', }}>Shared Files</h2>
          <ul className='shared-file-items'>
            {sharedFiles.length > 0 ? (
              sharedFiles.map((file, index) => (
                <li key={index} className='shared-file-item'>
                  <div className='shared-file-details'>
                    <p className='shared-file-name' >{file.name}</p>
                    <p className='shared-file-time'>Shared Time: {file.sharedTime}</p>
                  </div>
                  <div className='shared-file-actions'>
                    <i className='bi bi-three-dots' onClick={() => alert('Options: Download, Delete')}></i>
                  </div>
                </li>
              ))
            ) : (
              <p>No shared files available.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Shared;


