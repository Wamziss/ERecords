import React from 'react';
import Sidebar from '../components/Sidebar';
import Fileupload from '../components/Fileupload';

function Layout() {

    
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
  )
}

export default Layout