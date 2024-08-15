import { useState } from 'react';
import { ERecords_backend } from 'declarations/ERecords_backend';
import Fileupload from './components/Fileupload';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';


function App() {

  const styles ={
    mainContainer: {
      display: 'flex',
      fontFamily: 'verdana',
      margin: 0,
      padding: 0,
      width: '100%',
      height: '100vh',
      overflowY: 'scroll',
    }
  }

  return (
      <div style={styles.mainContainer} className='row'>
          <Sidebar/>
          <Fileupload/>
      </div>
  );
}

export default App;
