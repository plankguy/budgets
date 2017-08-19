import React, { Component } from 'react';

import styles from './App.scss';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.inner}>
          App
        </div>
      </div>
    );
  }
}

export default App;
