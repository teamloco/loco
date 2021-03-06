import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import axios from 'axios';

import Main from './components/Main.jsx';
import NavBarContainer from './containers/NavBarContainer';

import { checkLogged } from './actions/login';
import store from './store';

class App extends Component {
  constructor(props) {
    super(props);
    // this.handleLogin = this.handleLogin.bind(this);
    // this.onLogout = this.onLogout.bind(this);
  }

  componentDidMount() {
    store.dispatch(checkLogged());
    // axios.get('/api/user/start/')
    // .then(({ data }) => this.setState({ logged: true }))
    // .catch((error) => console.log(error));
  }

  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));