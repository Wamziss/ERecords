import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import Sidebar from '../Sidebar';

const Archived = ({ archivedFiles = [] }) => { // Default to an empty array if not provided

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
        <div className='archived-files'>
          <h2 style={{fontSize: 27, fontWeight: 'bold', margin: '20px', }}>Archived Files</h2>
          <ul>
            {archivedFiles.length > 0 ? (
              archivedFiles.map((file, index) => (
                <li key={index}>
                  <p>{file.name}</p>
                  <p>Archived Time: {file.archivedTime}</p>
                </li>
              ))
            ) : (
              <p>No archived files available.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Add prop types for validation
Archived.propTypes = {
  archivedFiles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      archivedTime: PropTypes.string.isRequired,
    })
  )
};

export default Archived;

