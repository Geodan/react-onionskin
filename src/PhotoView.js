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
    this.state = {
      visible : this.props.visible ? true : false
    }
  }
  componentWillReceiveProps(nextProps) 
  {
    if (nextProps.rect) {
      this.photoViewFrameStyle = {
        left: nextProps.rect.left + 'px',
        top: nextProps.rect.top + 'px',
        width: nextProps.rect.width + 'px',
        height: nextProps.rect.height + 'px'
      };
    }
  }
  render() {
    if (this.props.visible) {
      return (
        <div className = "photoviewcontainer">
          <div className="photoviewframe" style={this.photoViewFrameStyle} onClick={this.props.onClick}>
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
