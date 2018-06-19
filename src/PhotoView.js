import React, { Component } from 'react';
import CenterButton from './CenterButton';
import IconButton from './IconButton';
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft';
import './PhotoView.css';

class PhotoView extends Component {
  constructor (props) {
    super(props);
    this.imgRef = React.createRef();
  }
  render() {
    if (this.props.visible) {
      return (
        <div className = "photoviewcontainer">
          <div className="photoviewframe" style={this.props.style} onClick={this.props.onClick}>
            <img src={this.props.photodata} ref={this.imgRef} alt="preview" />            
            <CenterButton onClick={()=> this.props.onaccept()} icon={faCheckSquare}/>
          </div>
          <IconButton onClick={()=> this.props.oncancel()} className="backbutton" icon={faArrowLeft}/>
        </div>
      );
    }
    return null;
  }
}

export default PhotoView;
