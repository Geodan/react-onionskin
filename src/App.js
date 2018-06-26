import React, { Component } from 'react';
import './App.css';
import Camera from './Camera';

var loadScript = function(src) {
  var tag = document.createElement('script');
  tag.async = false;
  tag.src = src;
  document.getElementsByTagName('body')[0].appendChild(tag);
}

function getPermissions() 
{
  var permissions = window.cordova.plugins.permissions;
  permissions.checkPermission(permissions.CAMERA, function(status){
    if (!status.hasPermission) {
      permissions.requestPermission(permissions.CAMERA, function(status){
        if (!status.hasPermission) {
          console.warn("Permission not granted");
        }
      }), function() {
        console.warn('error getting camera permission')
      }
    }
  });
}

class App extends Component {
  constructor (props) 
  {
    super(props);
    this.state = {
      photo :  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
      camVisible: false,
      overlay: null
    };
  }
  showCam()
  {
    this.setState(Object.assign(this.state, {camVisible: true, overlayUrl: this.state.overlay}));
  }
  photoResult(photoData)
  {
    this.setState(Object.assign(this.state, photoData ? {photo: photoData, overlay: photoData, camVisible: false} : {camVisible: false}));
  }
  componentDidMount() {
    document.addEventListener('deviceready', getPermissions);
    loadScript('./cordova.js');
  }
  render() {
    if (this.state.camVisible) {
      return (<Camera camnumber="1" getphoto={this.photoResult.bind(this)} overlayURL={this.state.overlay}/>);
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
