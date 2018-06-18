import React, { Component } from 'react';
import './IconButton.css';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';


class IconButton extends Component {
  constructor (props) {
    super(props);
    this.state = {
      left: props.left,
      top: props.top
    }
  }
  render() {
    return (
      <div className={"iconbutton " + this.props.className} onClick={this.props.onClick}>
        <FontAwesomeIcon icon={this.props.icon} />
      </div>
    );
  }
}

export default IconButton;
