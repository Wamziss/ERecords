import { useState } from 'react';
import { ERecords_backend } from 'declarations/ERecords_backend';
import Fileupload from './components/Fileupload';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';


function App() {

  const styles ={
    mainContainer: {
      height: '100vh',
      fontFamily: 'verdana'

    }
  }

  return (
      <div style={styles.mainContainer}>
        <div class="row">
          <div class="col-sm-2"><Sidebar/></div>
          <div class="col-sm-10"><Fileupload/></div>
        </div>
      </div>
  );
}

export default App;
