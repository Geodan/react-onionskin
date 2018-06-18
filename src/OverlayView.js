import React, { Component } from 'react';
import './OverlayView.css';

class OverlayView extends Component {
  constructor (props) {
    super(props);    
    this.state = {
      src : this.props.src
    }
  }
  componentWillReceiveProps(nextProps) 
  {
    if (nextProps.rect) {
      this.overlayViewFrameStyle = {
        left: nextProps.rect.left + 'px',
        top: nextProps.rect.top + 'px',
        width: nextProps.rect.width + 'px',
        height: nextProps.rect.height + 'px'
      };
    }
    if (nextProps.src) {
      this.setState({src: this.props.src});
    }
  }
  render() {
    if (this.state.src) {
      return (
          <div className="overlayviewframe" style={this.overlayViewFrameStyle}>
            <img src={this.state.src} alt="overlay" />                        
          </div>          
      );
    }
    return null;
  }
}

export default OverlayView;
