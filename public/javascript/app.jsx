import { default as React, Component } from 'react';
import { render } from 'react-dom';

class OperatorsBox extends Component {

  render() {
    return (
        <div className="commentBox">
        </div>
    );
  }
}



render(
    <OperatorsBox />,
    document.getElementById('operators')
);
