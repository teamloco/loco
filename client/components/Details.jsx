import React from 'react';
import axios from 'axios';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routeId: '',
      upvotes: 0,
      downvotes: 0,
      comments: [],
      staticSched: [],
      realTimeSched: [],
      stations : {},
      value : '',
      delayed : 0,
      closed : 0,
      accident: 0,
      crowded : 0
    };
    this.addVote = this.addVote.bind(this);
    this.downVote = this.downVote.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleComplaintSubmit = this.handleComplaintSubmit.bind(this);
  }

  componentDidMount() {
    // 1) The number of complaints : we have that endpoint
    // 2) when we incorporate a comments page, we'll need to display those too (priority TBD)
    // TODO: Come up with a way to retrieve the total number of complaints across all categories for a particular route/line
    // TODO: Come up with a way for app to detect whether its a weekday, saturday or sunday
    // TODO: Come up with a way to change schedules according to whether its satuday, sunday or a weekday
    // TODO: The routes send back 404s if no complaints exists; we'd need to change that logic, so if no complaint exists, we send back something we can work with (boolean?)
    let routeId = this.props.match.params.routeId;
    this.setState({ routeId }, () => {
      axios.get('/api/route/stops', {
        params: { route_id: this.state.routeId }
      })
      .then(({ data }) => {
        console.log(data);
        this.setState({stations: data}, () => console.log(this.state.stations));
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  addVote(e) {
    // e.preventDefault()
    // this.setState({
    //   upvotes: this.state.upvotes + 1
    // })
  }

  downVote(e) {
    // e.preventDefault()
    // this.setState({
    //   downVotes: this.state.downVotes + 1
    // }, this.props.setAppState('deets'));
  }

  handleChange(event) {
    this.setState({value : event.target.value}, () => {
      axios.get('/api/times/stoproute', {
        params : {
          stop_id : this.state.value,
          route_id : this.state.routeId,
          route_type : 'wkd'
        }
      })
      .then(({ data }) => {
        let currentTime = new Date().toLocaleTimeString('en-GB')
        let relevantSched = data.filter((el) => el.arrival_time >= currentTime).slice(0, 10);
        console.log(data)
        this.setState({staticSched : relevantSched})

        // TODO : FIX THIS JANKY MESS

        axios.get('/api/report', {
          params : {
            type : 'delayed',
            stop_id : this.state.value,
            route_id : this.state.routeId
          }
        })
        .then(data => this.setState({delayed : data.data.count}))
        .catch(err => this.setState({delayed: 0}, () => console.log(err)));

        axios.get('/api/report', {
          params : {
            type : 'closed',
            stop_id : this.state.value,
            route_id : this.state.routeId
          }
        }).then(data => { this.setState({closed : data.data.count}) })
          .catch(err => this.setState({closed : 0}, () => console.log(err)));

        axios.get('/api/report', {
          params : {
            type : 'accident',
            stop_id : this.state.value,
            route_id : this.state.routeId
          }
        }).then(data => { this.setState({accident : data.data.count}) })
          .catch(err => this.setState({accident: 0}, () => console.log(err)));

        axios.get('/api/report', {
          params : {
            type : 'crowded',
            stop_id : this.state.value,
            route_id : this.state.routeId
          }
        }).then(data => { this.setState({crowded : data.data.count}) })
          .catch(err => this.setState({crowded: 0}, () => console.log(err)));
      })
      .catch((error) => console.log(error));
    });
  }

  handleComplaintSubmit(input) {
    axios.post('/api/report/add', {
      type : input,
      stop_id : this.state.value,
      route_id : this.state.routeId
    })
    .then(data => {
      switch (true) {
        case input === 'delayed':
          this.setState({delayed : data.data.count})
          break;
        case input === 'closed':
          this.setState({closed : data.data.count})
          break;
        case input === 'accident':
          this.setState({accident: data.data.count})
          break;
        case input === 'crowded':
          this.setState({crowded: data.data.count})
          break;
      }
    })
    .catch(err => console.log(err))
  }

  render() {
    return (
      <div>
        <div className="line-logo">
          Route: {this.state.routeId}
        </div>
        <div className="vote-row">
          <div className="vote-count">
            TBD: {this.state.upvotes}
          </div>
          <button onClick={this.addVote}>
            (thumbs up)
          </button>
        </div>
        <div className="vote-row">
          <div className="vote-count">
            {this.state.downVotes}
          </div>
          <button onClick={this.downVote}>
            (thumbs down)
          </button>
        </div>
        <div className="schedule">
          <div className="adj-sched">
            Uptown Schedule:
            {this.state.stations.N ?
              <select onChange={this.handleChange}>
                {this.state.stations.N.map((element, idx) =>
                  <option key={idx} value={element.stop_id}>{element.stop_name}</option>)}
              </select> : null}
          </div>
          <div className="adj-sched">
            Downtown Schedule:
            {this.state.stations.S ?
              <select onChange={this.handleChange}>
                {this.state.stations.S.map((element, idx) =>
                  <option key={idx} value={element.stop_id}>{element.stop_name}</option>)}
              </select> : null}
          </div>
          <div className="adj-sched">
            {this.state.staticSched.map((element, idx) => {
              return <div key={idx}>{element.arrival_time}</div>
            })}
          </div>
          <div className="user-comments">
            Reported Complaints:
            {this.state.comments.map((comment, idx) => {
              return <div key={idx}>{comment}</div>
            })}
          </div>
          <div onClick={() => {this.handleComplaintSubmit('delayed')}}>
            Delayed : {this.state.delayed}
          </div>
          <div onClick={() => {this.handleComplaintSubmit('closed')}}>
            Closed : {this.state.closed}
          </div>
          <div onClick={() => {this.handleComplaintSubmit('accident')}}>
            Accident : {this.state.accident}
          </div>
          <div onClick={() => {this.handleComplaintSubmit('crowded')}}>
            Crowded : {this.state.crowded}
          </div>
        </div>
      </div>
    );
  }
}
