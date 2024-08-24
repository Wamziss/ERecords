import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import security from '../assets/security.png';
import speed from '../assets/speed.png'
import transparency from '../assets/transparency.png'
import blockchain from '../assets/blockchain.jpg'
import share from '../assets/share.jpg'
import access from '../assets/access.jpg'
import { AuthClient } from '@dfinity/auth-client';
import decentralized from '../assets/decentralized.jpg'

function Home() {
    const handleSignIn = async (event) => {
        event.preventDefault();
        try {
            const authClient = await AuthClient.create();
    
            authClient.login({
                identityProvider: process.env.II_URL,
                onSuccess: async (response) => {
                    console.log("Logged in!");
    
                    // Store the authenticated actor
                    const identity = authClient.getIdentity();
                    window.sessionStorage.setItem('identity', JSON.stringify(identity));
                    window.location.href = '/Files';
                },
                onError: (error) => {
                    console.error("Login failed:", error);
                },
            });
        } catch (error) {
            console.error("AuthClient creation failed:", error);
        }
    };

    return (
        <div className="landing-page">
            <div className='my-header'>
                <nav className="navbar navbar-expand-lg">
                    <div className="container">
                        <a className="navbar-brand" href="#">E-RECORDS</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto" style={{fontWeight: 'bold'}}>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Home</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Features</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">About</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link btn action-btn btn-md" style={{boxShadow: '1px 1px 4px #333'}} onClick={(event) => handleSignIn(event)}>Get Started</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <header className="hero-section text-center d-flex align-items-center justify-content-center">
                    <div className="container" style={{padding: 20, width: '80%', }}>
                        <div className='hero-txtbox'>
                        <h1 className="display-4 hero-txt">Secure & Decentralized Records Management</h1>
                        <p className="lead hero-txt">Manage and store your records securely on the blockchain with E-Records.</p>
                        <a className="action-btn btn btn-lg mt-4" style={{boxShadow: '1px 1px 4px #333'}} onClick={(event) => handleSignIn(event)}>Join Us → </a>
                        </div>
                        {/* <p>Share your documents with confidence, knowing they're tamper-proof.</p>
                        <p>Access your files anytime, anywhere, with our decentralized storage solution.</p> */}
                        
                    </div>
                </header>
            </div>

            <section className="features-section py-5">
                <div className="container text-center">
                    <h2 style={{fontWeight: 'bold'}}>Why Choose E-Records?</h2>
                    <p className="lead mb-5">We offer the most secure and transparent records management on the blockchain.</p>
                    <div className="row justify-content-between">
                        <div className="col feature-card">
                            <img src={security} alt="Feature 1" className="img-fluid mb-3" style={{}} />
                            <h4>Security</h4>
                            <p>Your records are encrypted and stored securely on the blockchain.</p>
                        </div>
                        <div className="col feature-card">
                            <img src={speed} alt="Feature 2" className="img-fluid mb-3" />
                            <h4>Speed</h4>
                            <p>Access your records instantly from anywhere in the world.</p>
                        </div>
                        <div className="col feature-card">
                            <img src={transparency} alt="Feature 3" className="img-fluid mb-3" />
                            <h4>Transparency</h4>
                            <p>Every transaction is recorded and viewable on the blockchain.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{backgroundColor: '#f5f5f5', margin: 0, padding: '20px'}}>
                <section className="about-section py-5">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <img src={decentralized} alt="About Us" className="img-fluid my-img"/>
                            </div>
                            <div className="col-md-6">
                                <h2>About E-Records</h2>
                                <p>E-Records is leading the way in decentralized record management, offering unmatched security, speed, and transparency. With our blockchain-based platform, your data is always safe and accessible, no matter where you are.</p>
                                <a href="#" className="btn mt-3" style={{border: '2px solid #6e06b3', borderRadius: 20}}>Learn More</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section py-5">
                    <div className="container text-center">
                        <h2>Ready to Secure Your Records?</h2>
                        <p style={{color: '#333'}}>Join the many users who trust E-Records for their record management needs.</p>
                        <a className="btn btn-lg mt-3 action-btn" style={{boxShadow: '1px 1px 4px #333'}} onClick={(event) => handleSignIn(event)}>Get Started Now → </a>
                    </div>
                </section>
                
            </div>
            <footer className="footer text-white py-4 text-center">
                
                    <p>&copy; 2024 E-Records. All rights reserved.</p>
                
            </footer>
        </div>
    );
}

export default Home;
