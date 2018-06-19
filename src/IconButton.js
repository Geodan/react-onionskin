import React, { Component } from 'react';
import './IconButton.css';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';


class IconButton extends Component {
  render() {
    return (
      <div className={"iconbutton " + this.props.className} onClick={this.props.onClick}>
        <FontAwesomeIcon icon={this.props.icon} />
      </div>
    );
  }
}

export default IconButton;
