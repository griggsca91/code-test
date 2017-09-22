import { default as React, Component } from 'react';
import { render } from 'react-dom';
import { default as request } from 'superagent';

class Operator extends Component {

  constructor(props) {
    super(props);
    this.toggleAvailability = this.toggleAvailability.bind(this);
  }

  toggleAvailability() {
    this.props.toggleAvailability(this.props.data.loginID, 1, this.props.data.clientID, this.props.data.chatService);
  }

  render() {

    let className = this.props.data.chatService ? "btn-success" : "btn-warning";
    let buttonContent = this.props.data.chatService ? "Chat Available" : "Chat Unavailable";
    return (
      <div className="row justify-content-start">
        <div className="col-2">
          {this.props.data.name}
        </div>
        <div className="col-2">
        <button onClick={this.toggleAvailability} className={className} id={this.props.data.loginID}>{buttonContent}</button>
        </div>
      </div>
    )
  }
}

class OperatorsBox extends Component {

  constructor(props){
    // Pass props to parent class
    super(props);
    // Set initial state
    this.state = {
      operators: [],
      isLoading: false
    }
    this.getOperators = this.getOperators.bind(this);
    this.toggleAvailability = this.toggleAvailability.bind(this);

  }
  componentDidMount(){
    this.getOperators();
  }


  toggleAvailability(operatorID, serviceTypeID, clientID, statusType) {
    request
      .post('/api/setOperatorAvailability')
      .send({operatorID: operatorID, serviceTypeID: serviceTypeID, clientID:clientID, statusType:statusType ? 1 : 2})
      .set('accept', 'json')
      .end((err, res) => {
        this.getOperators();
      });
  }


  getOperators() {
    this.setState({isLoading: true});
    request
      .get("/api/getOperators")
      .end((err, res) => {
        this.setState({operators: res.body.data, isLoading: false})
      });
  }

  render() {


    let operators = this.state.operators.map(i => {
      return <Operator data={i} key={i.loginID} toggleAvailability={this.toggleAvailability}/>
    });

    return (
        <div className="container">
          <h3>Current Operators</h3>
          {operators.length == 0 && this.state.isLoading == false &&
            <p>There aren't any operators logged in right now.</p>
          }
          {operators}
        </div>
    );
  }
}

render(
    <OperatorsBox />,
    document.getElementById('operators')
);
