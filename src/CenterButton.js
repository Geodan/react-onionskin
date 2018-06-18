import React, { Component } from 'react';
import './CenterButton.css';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';


class CenterButton extends Component {
  constructor (props) {
    super(props);
    this.state = {
      left: props.left,
      top: props.top
    }
  }
  render() {
    return (
      <div className="centerbutton" onClick={this.props.onClick}>
        <FontAwesomeIcon icon={this.props.icon} />
      </div>
    );
  }
}

export default CenterButton;
