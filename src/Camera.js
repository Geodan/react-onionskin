import React, { Component } from 'react';
import './Camera.css';
import CenterButton from './CenterButton';
import IconButton from './IconButton';
import faCamera from '@fortawesome/fontawesome-free-solid/faCamera';
import faClose from '@fortawesome/fontawesome-free-solid/faTimes';
import faOpacity from './iconOpacity.json';
import PhotoView from './PhotoView';
import OverlayView from './OverlayView';
import 'webrtc-adapter';

const fitRectangleToDisplay = function(rectangleAspect, displayWidth, displayHeight, fitInside, rectBefore, rectAfter)
{
  var rectangle = {};
  var displayAspect = displayWidth / displayHeight;
  if ((fitInside && displayAspect > rectangleAspect) || (!fitInside && displayAspect < rectangleAspect)) {
    // fit to height
    rectangle.height = displayHeight;
    rectangle.width = displayHeight * rectangleAspect;
  } else {
    // fit to width
    rectangle.width = displayWidth;
    rectangle.height = displayWidth / rectangleAspect;
  }
  rectangle.left = Math.round((displayWidth - rectangle.width) / 2);
  rectangle.top = Math.round((displayHeight - rectangle.height) / 2);
  if (rectangle.left > 0 && (rectBefore || rectAfter)) {
    // fit rectBefore/rectAfter to height
    if (rectBefore) {
      rectBefore.left = 0;
      rectBefore.top = 0;
      rectBefore.width = rectangle.left;
      rectBefore.height = displayHeight;
    }
    if (rectAfter) {
      rectAfter.top = 0;
      rectAfter.left = rectangle.left + rectangle.width;
      rectAfter.width = rectangle.left;
      rectAfter.height = displayHeight;
    }
  } else if (rectangle.top > 0 && (rectBefore || rectAfter)) {
    if (rectBefore) {
      rectBefore.top  = 0;
      rectBefore.left = 0;
      rectBefore.width = displayWidth;
      rectBefore.height = rectangle.top;
    }
    if (rectAfter) {
      rectAfter.top = rectangle.top + rectangle.height;
      rectAfter.left = 0;
      rectAfter.width = displayWidth;
      rectAfter.height = rectangle.top;
    }
  }
  return rectangle;
};

const setElementStyleToRect = function(element, rect) {
  element.style.left = rect.left + 'px';
  element.style.top = rect.top + 'px';
  element.style.width = rect.width + 'px';
  element.style.height = rect.height + 'px';
};

class Camera extends Component {
  constructor (props) {
    super(props);
    this.camFrameRef = React.createRef();
    this.beforeRef = React.createRef();
    this.afterRef = React.createRef();
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.state = {
      id: props.id,
      camnumber: props.camnumber,
      overlay: props.overlay,
      hascamera: true
    }
  }
  componentDidMount()
  {
    window.addEventListener("resize", this.updateDimensions.bind(this));
    if (this.state.hascamera) {
      this.setMediaStream();
    }
    console.log(JSON.stringify(faClose));
  }
  compontentWillUnmount()
  {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
  fitToParentContainer()
  {
    const parentContainer = this.camFrameRef.current.parentNode;
    const containerWidth = parentContainer.clientWidth;
    const containerHeight = parentContainer.clientHeight;
    const cameraAspectRatio = 4/3;
    const rectBefore = {}, rectAfter = {};
    const camRect = fitRectangleToDisplay(cameraAspectRatio, containerWidth, containerHeight, true, rectBefore, rectAfter);
    setElementStyleToRect(this.camFrameRef.current, camRect);
    setElementStyleToRect(this.beforeRef.current, rectBefore);
    setElementStyleToRect(this.afterRef.current, rectAfter);
    if (!this.state.camRect || JSON.stringify(this.state.camRect) !== JSON.stringify(camRect) ) {
      this.setState(Object.assign(this.state, {camRect: camRect}));
    }
  }
  updateDimensions()
  {
    if (this.state.videoWidth && this.state.videoHeight) {
      this.fitToParentContainer();
    }
  }
  componentDidUpdate()
  {
    this.updateDimensions();
    if (this.state.hascamera) {
      this.setMediaStream();
    }
  }
  setMediaStream()
  {
    const self = this;
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices){
      const videodevices = devices.filter(device=>device.kind==='videoinput');
      if (videodevices.length) {
        const camnumber = self.props.camnumber ? self.props.camnumber % videodevices.length: 0;
        navigator.mediaDevices.getUserMedia({audo: false, video: { deviceId: videodevices[camnumber].deviceId }})
        .then(function(stream){
          self.videoRef.current.srcObject = stream;
          self.videoRef.current.onloadedmetadata = function() {
            if (this.videoWidth !== self.state.videoWidth || this.videoHeight !== self.state.videoHeight) {
              let tmp = Object.assign({}, self.state);
              tmp.videoWidth = this.videoWidth;
              tmp.videoHeight = this.videoHeight;
              self.setState(tmp);
            }
          }
        }).catch(function(error) {
          console.log(error);
        });
      } else {
        let tmp = Object.assign({}, self.state);
        tmp.hascamera = false;
        self.setState(tmp);
      }
    })
  }
  takePhoto() 
  {
    const context = this.canvasRef.current.getContext('2d');
    context.drawImage(this.videoRef.current, 0, 0, this.state.videoWidth, this.state.videoHeight);
    this.photoData = this.canvasRef.current.toDataURL('image/jpeg');
    this.setState(Object.assign(this.state, {photoVisible: true}));
    // turn off video
    const self = this;
    setTimeout(function() {
      let stream = self.videoRef.current.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach(track=>track.stop());
      self.videoRef.current.srcObject = null;
    }, 1000);
    console.log("picture taken!", this.photoData.length);
  }
  photoAccepted()
  {
    this.props.photo(this.photoData);
  }
  photoCancelled()
  {
    this.setState(Object.assign(this.state, {photoVisible: false}));
    this.photoData = null;
  }
  render() {
    // The camera container fully occupies the window / screen.
    // For tech-reasons, everything under the camera preview has to be transparent
    // Therefore using camera_bars to blacken screen parts not covered by the camera preview
    // The camera_frame tightly fits the camera preview and is used to position elements 
    // on top of the camera preview (button and transparent image)
    if (this.state.hascamera) {
      return (
        <div className="cameracontainer">
          <div className="camera_bar" ref={this.beforeRef}></div>
          <div className="camera_frame" ref={this.camFrameRef}>
          <video autoPlay className="video" id={this.state.id} ref={this.videoRef}></video>
          <CenterButton onClick={()=> this.takePhoto()} icon={faCamera}/>          
          </div>
          <canvas className="canvas" width={this.state.videoWidth} height={this.state.videoHeight} ref={this.canvasRef}/>
          <div className="camera_bar" ref={this.afterRef}></div>
          <IconButton icon={faClose} className="closebutton" onClick={this.photoCancelled.bind(this)} />          
          <PhotoView rect={this.state.camRect} visible={this.state.photoVisible} photodata={this.photoData} onaccept={this.photoAccepted.bind(this)} oncancel={this.photoCancelled.bind(this)}/>
          <OverlayView rect={this.state.camRect} src={this.props.overlayURL} opacity={this.opacity} />
          <IconButton icon={faOpacity} className="opacitybutton" onClick={this.photoCancelled.bind(this)} />
        </div>
      );
    } else {
      return (
        <div id={this.state.id}>No camera available</div>
      );
    }
  }
}

export default Camera;
