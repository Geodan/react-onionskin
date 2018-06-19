import React, { Component } from 'react';
import './OverlayView.css';

class OverlayView extends Component {
  render() {
    if (this.props.src) {
      return (
          <div className="overlayviewframe" style={this.props.style}>
            <img src={this.props.src} alt="overlay" />                        
          </div>          
      );
    }
    return null;
  }
}

export default OverlayView;
