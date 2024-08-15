import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleClick = (index) => {
        setActiveIndex(index);
    };

    const styles = {
        sidebar: {
            paddingTop: 20,
            paddingBottom: 20,
            backgroundColor: '#000',
            color: '#f5f5f5',
            height: '100%',
            position: 'fixed',
            width: '17%'

        },
        logo: {
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 20,
            height: '5%',
        },
        navLink: {
            color: '#f5f5f5',
            fontSize: 15,
            padding: '10px 15px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '15px',
        },
        navLinkHover: {
            backgroundColor: '#6E06B3',
        },
        icon: {
            marginRight: 10, 
        },
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                E-RECORDS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: "95%", justifyContent: 'space-between', paddingTop: 30}}>
                <ul className="nav flex-column p-4">
                    {['Files', 'Shared', 'Archived'].map((item, index) => (
                        <li
                            className="nav-item mb-2"
                            key={index}
                            onClick={() => handleClick(index)}
                        >
                            <a
                                href="#"
                                className="nav-link"
                                style={{
                                    ...styles.navLink,
                                    ...(activeIndex === index || false ? styles.navLinkHover : {}),
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index ? '#6E06B3' : 'transparent'}
                            >
                                <i className={`bi ${index === 0 ? 'bi-file-earmark-fill' : index === 1 ? 'bi-share-fill' : 'bi-archive-fill'}`} style={styles.icon}></i>{item}
                            </a>
                        </li>
                    ))}
                </ul>
                <ul className="nav flex-column p-3">
                    {['Settings', 'Logout'].map((item, index) => (
                        <li
                            className="nav-item mb-2"
                            key={index + 3}
                            onClick={() => handleClick(index + 3)}
                        >
                            <a
                                href="#"
                                className="nav-link"
                                style={{
                                    ...styles.navLink,
                                    ...(activeIndex === index + 3 || false ? styles.navLinkHover : {}),
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E06B3'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activeIndex === index + 3 ? '#6E06B3' : 'transparent'}
                            >
                                <i className={`bi ${index === 0 ? 'bi-gear-fill' : 'bi-box-arrow-right'}`} style={styles.icon}></i> {item}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;

