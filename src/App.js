import React, { Component } from 'react';
import './App.css';
import overlay from './overlay.jpg';
import Camera from './Camera';

class App extends Component {
  constructor (props) 
  {
    super(props);
    this.state = {
      photo :  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
      camVisible: false
    };
  }
  showCam()
  {
    this.setState(Object.assign(this.state, {camVisible: true}));
  }
  photoResult(photoData)
  {
    this.setState(Object.assign(this.state, photoData ? {photo: photoData, camVisible: false} : {camVisible: false}));
    console.log("hiero!")
  }
  render() {
    if (this.state.camVisible) {
      return (<Camera channel="0" getphoto={this.photoResult.bind(this)} overlayURL={overlay}/>);
    } else {
      return (
        <div className="App">
            <img src={this.state.photo} className="app-camphoto" alt="result" /><p/>
            <button onClick={this.showCam.bind(this)}>Get Photo</button>
        </div>
      );
    }
  }
}

export default App;
