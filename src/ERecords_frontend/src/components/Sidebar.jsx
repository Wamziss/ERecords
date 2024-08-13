import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Sidebar() {
    const styles ={
        sidebar: {
            paddingTop: 40,
            paddingHorizontal: 10,
            // backgroundColor: '#280137', 
            backgroundColor: '#333', 
            height: '100vh', 
            color: '#f5f5f5'
        },
        logo: {
            color: 'orange',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 20,
        },
        navLink: {
            color: '#f5f5f5',
            fontSize: 14
        }
    }
  return (
    <div style={styles.sidebar}>
        <div style={styles.logo}>
            E-RECORDS
        </div>
        <div className='flex-column justify-content-between' style={{height: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
            <ul className="nav flex-column p-3">
                <li className="nav-item mb-3">
                    <a href="#" className="nav-link" style={styles.navLink}>
                        <i className="bi bi-file-earmark-fill"></i> Files
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="#" className="nav-link" style={styles.navLink}>
                        <i className="bi bi-share-fill"></i> Shared files
                    </a>
                </li>
                <li className="nav-item mb-3">
                    <a href="#" className="nav-link" style={styles.navLink}>
                        <i className="bi bi-archive-fill"></i> Archived
                    </a>
                </li>
            </ul>
            <ul className="nav flex-column p-3">
                    <li className="nav-item mb-3">
                        <a href="#" className="nav-link" style={styles.navLink}>
                        <i className="bi bi-gear-fill"></i> Settings
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="#" className="nav-link" style={styles.navLink}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                        </a>
                    </li>
            </ul>
        </div>
    </div>
  );
}

export default Sidebar;
