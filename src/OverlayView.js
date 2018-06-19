import React, { Component } from 'react';
import './OverlayView.css';

class OverlayView extends Component {
  render() {
    let myStyle = this.props.style ? Object.assign({}, this.props.style) : {};
    if (this.props.opacity) {
      myStyle = Object.assign(myStyle, {opacity: this.props.opacity});
    }
    if ((this.props.visible === undefined || this.props.visible) && this.props.src) {
      return (
          <div className={"overlayviewframe " + this.props.className} style={myStyle}>
            <img src={this.props.src} alt="overlay" />                        
          </div>          
      );
    }
    return null;
  }
}

export default OverlayView;
