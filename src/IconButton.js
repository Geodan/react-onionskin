import React, { Component } from 'react';
import './IconButton.css';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

class IconButton extends Component {
  render() {
    if (this.props.visible === undefined || this.props.visible) {
      return (
        <span style={this.props.style} className={"iconbutton " + (this.props.className ? this.props.className : "")} onClick={this.props.onClick}>
          <FontAwesomeIcon icon={this.props.icon} />
        </span>
      );
    }
    return null;
  }
}

export default IconButton;
