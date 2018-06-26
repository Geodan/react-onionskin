import React, { Component } from 'react';
import './Camera.css';
import IconButton from './IconButton';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCamera from '@fortawesome/fontawesome-free-solid/faCamera';
import faClose from '@fortawesome/fontawesome-free-solid/faTimes';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faMinus from '@fortawesome/fontawesome-free-solid/faMinus';
import faOpacity from './iconOpacity.json';
import OverlayView from './OverlayView';
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft';
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
    this.opacityInfoRef = React.createRef();
    this.state = {
      hascamera: true,
      camRect: {left: 0, top: 0, width: 0, height: -40},
      videoWidth: 640,
      videoHeight: 480,
      photoVisible: false,
      overlayOpacity: 50
    };
    this.resolutions = [
      2304, /* 2304 x 1728, 3.9 Mpixel */
      2048, /* 2048 x 1536, QXGA, 3.1 Mpixel */
      1920, /* 1920 x 1440, 2.7 Mpixel */
      1600, /* 1600 x 1200, UXGA, 1.9 Mpixel */
      1440, /* 1440 x 1080, HD, 1.5 Mpixel */
      1280, /* 1280 x  960, SXGA, 1.2 Mpixel */
      1024, /* 1024 x  768, XGA,  0.78 Mpixel */
       800, /*  800 x  600, SVGA, 0.48 Mpixel */
       640  /*  640 x  480, VGA, 0.3 Mpixel */
    ];
  }
  componentDidMount()
  {
    window.addEventListener("resize", this.updateDimensions.bind(this));
    this.updateDimensions();
  }
  compontentWillUnmount()
  {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }
  updateDimensions()
  {
    if (!this.camFrameRef.current) {
      return;
    }
    const parentContainer = this.camFrameRef.current.parentNode;
    const containerWidth = parentContainer.clientWidth;
    const containerHeight = parentContainer.clientHeight;
    const cameraAspectRatio = this.state.videoWidth / this.state.videoHeight;
    const rectBefore = {}, rectAfter = {};
    const camRect = fitRectangleToDisplay(cameraAspectRatio, containerWidth, containerHeight, true, rectBefore, rectAfter);
    setElementStyleToRect(this.camFrameRef.current, camRect);
    setElementStyleToRect(this.beforeRef.current, rectBefore);
    setElementStyleToRect(this.afterRef.current, rectAfter);
    if (!this.state.camRect || JSON.stringify(this.state.camRect) !== JSON.stringify(camRect) ) {
      this.setState(Object.assign(this.state, {camRect: camRect}));
    }
  }
  componentDidUpdate()
  {
    this.updateDimensions();
    this.resolutionCount = 0;
    this.setMediaStream();
  }
  getStreamForResolution(deviceId, width, height) 
  {
    return navigator.mediaDevices.getUserMedia({audio: false, video: { deviceId: deviceId, width: width, height: height}});
  }
  setMediaStream()
  {
    if (this.state.photoVisible) {
      return; // preview photo in front, no need to activate cam
    }
    if (this.videoRef.current.srcObject) {
      return; // already set
    }
    if (!this.state.hascamera) {
      return; // no camera devices available
    }
    const self = this;
    navigator.mediaDevices.enumerateDevices()
    .catch(function(err) {
      console.log(err);
    })
    .then(function(devices){
      const videodevices = devices.filter(device=>device.kind==='videoinput');
      if (videodevices.length) {
        //const deviceId = videodevices[self.props.camnumber ? self.props.camnumber % videodevices.length : 0].deviceId;
        let width = self.resolutions[self.resolutionCount % self.resolutions.length];
        let height = (width/4) * 3;
        if (self.resolutionCount > self.resolutions.length) {
          // try inverse aspect ratios
          const tmp = width;
          width = height;
          height = tmp;
        }
        navigator.mediaDevices.getUserMedia({audio: false, video: { facingMode: "environment", width: {exact: width}, height: {exact: height} }})
        .then(function(stream){
          self.videoRef.current.srcObject = stream;
          self.videoRef.current.onloadedmetadata = function() {
            if (this.videoWidth !== self.state.videoWidth || this.videoHeight !== self.state.videoHeight) {
              self.setState(Object.assign(self.state, {videoWidth: this.videoWidth, videoHeight: this.videoHeight}));
            }
            self.videoRef.current.style.visibility = "visible";
          }
          self.videoRef.current.onresize = function() {
            self.setState(Object.assign(self.state, {videoWidth: this.videoWidth, videoHeight: this.videoHeight}));
          }
        }).catch(function(error) {
          self.resolutionCount++;
          if (self.resolutionCount < self.resolutions.length * 2) {
            self.setMediaStream();
          } else {
            // reset resolutionCount for next try, maybe camera used by other process?
            self.resolutionCount = 0;
            console.log(error);
          }
        });
      } else {
        self.setState(Object.assign(self.state, {hascamera: false}));
      }
    })
  }
  takePhoto() 
  {
    this.videoRef.current.style.visibility = "hidden";
    const context = this.canvasRef.current.getContext('2d');
    context.drawImage(this.videoRef.current, 0, 0, this.state.videoWidth, this.state.videoHeight);
    this.photoData = this.canvasRef.current.toDataURL('image/jpeg');
    // turn off video
    this.closeMediaStream();
    this.prevOverlayOpacity = this.state.overlayOpacity;
    this.setState(Object.assign(this.state, {photoVisible: true, overlayOpacity: 0}));
  }
  photoAccepted()
  {
    this.closeMediaStream();
    this.setState(Object.assign(this.state, {photoVisible: false, overlayOpacity: this.prevOverlayOpacity}));
    this.props.getphoto(this.photoData);
  }
  photoCancelled()
  {
    // user cancelled photo (using back button on photo)
    this.setState(Object.assign(this.state, {photoVisible: false, overlayOpacity: this.prevOverlayOpacity}));
    this.photoData = null;
  }
  closeMediaStream()
  {
    if (this.videoRef.current && this.videoRef.current.srcObject) {
      let stream = this.videoRef.current.srcObject;
      //console.log(stream.id, stream.active);
      let tracks = stream.getTracks();
      tracks.forEach(track=>track.stop());
      this.videoRef.current.srcObject = null;
    }
  }
  cameraCancelled()
  {
    // user clicked close
    this.closeMediaStream();
    this.setState(Object.assign(this.state, {photoVisible: false}));
    this.photoData = null;
    this.props.getphoto(null);
  }
  opacityUp() 
  { 
    if (this.state.overlayOpacity < 100) {
      this.setState(Object.assign(this.state, {overlayOpacity: this.state.overlayOpacity + 10}));
      setTimeout(function(){
          this.opacityInfoRef.current.classList.add("opacityanimation");
      }.bind(this), 100);
    }
  }
  opacityDown()
  {
    if (this.state.overlayOpacity > 0) {
      this.setState(Object.assign(this.state, {overlayOpacity: this.state.overlayOpacity - 10}));      
      setTimeout(function(){
        this.opacityInfoRef.current.classList.add("opacityanimation");
      }.bind(this), 100);
    }
  }
  render() {
    // The camera container fully occupies the window / screen.
    // For tech-reasons, everything under the camera preview has to be transparent
    // Therefore using camera_bars to blacken screen parts not covered by the camera preview
    // The camera_frame tightly fits the camera preview and is used to position elements 
    // on top of the camera preview (button and transparent image)
    
    const camRectStyle = {
      left: this.state.camRect.left + 'px',
      top: this.state.camRect.top + 'px',
      width: this.state.camRect.width + 'px',
      height: this.state.camRect.height + 'px'
    };

    const buttonStyle = {
      top: Math.round(this.state.camRect.top + (this.state.camRect.height - 40) * 0.8) + 'px'
    }
    
    if (this.state.hascamera) {
      return (
        <div className="cameracontainer">
          <div className="camera_bar" ref={this.beforeRef}></div>
          <div className="camera_frame" ref={this.camFrameRef}>
          <video autoPlay className="video" id={this.props.id} ref={this.videoRef}></video>
          </div>
          <canvas className="canvas" width={this.state.videoWidth} height={this.state.videoHeight} ref={this.canvasRef}/>
          <div className="camera_bar" ref={this.afterRef}></div>
          <OverlayView className="photoview" style={camRectStyle} visible={this.state.photoVisible} src={this.photoData}/>
          <OverlayView style={camRectStyle} src={this.props.overlayURL} opacity={this.state.overlayOpacity/100} />
          <IconButton style={buttonStyle} className="centerbutton" onClick={this.takePhoto.bind(this)} icon={faCamera} visible={!this.state.photoVisible}/>
          <IconButton style={buttonStyle} className="centerbutton" onClick={this.photoAccepted.bind(this)} icon={faCheckSquare} visible={this.state.photoVisible}/>
          <IconButton icon={faClose} className="closebutton" onClick={this.cameraCancelled.bind(this)} visible={!this.state.photoVisible}/>
          <IconButton onClick={this.photoCancelled.bind(this)} className="backbutton" icon={faArrowLeft} visible={this.state.photoVisible}/>
          {this.props.overlayURL && <div className="opacitybar">
          <IconButton icon={faMinus} className="opacitybutton" onClick={this.opacityDown.bind(this)} />
          &nbsp;
          <FontAwesomeIcon icon={faOpacity} className="opacityicon"/>
          &nbsp;
          <IconButton icon={faPlus} className="opacitybutton" onClick={this.opacityUp.bind(this)} />
          <div className={"opacityinfo a" + this.state.overlayOpacity} ref={this.opacityInfoRef}>{this.state.overlayOpacity + "%"}</div>
          </div>}
        </div>
      );
    }
    return (
        <div id={this.props.id}>No camera available</div>
    );
  }
}

export default Camera;
