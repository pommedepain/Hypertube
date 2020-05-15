import React, { Component } from 'react'


export default class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
    }
  }

  handleInputChange = () => {
    this.setState({
      query: this.search.value
    })
    this.props.onChange(this.search.value);
  }

  submitHandler(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div style={{width: "80%"}}>
        <form onSubmit={this.submitHandler}>
          <input
            style={{
            width: "95%",
            outline: 0,
            border: 0,
            backgroundColor: "transparent",
            borderBottom: "solid 2px white",
            marginLeft: "10px",
            color: "white",
            fontSize: "2em"}}
            ref={input => this.search = input}
            onChange={this.handleInputChange}
            onClick={() => {this.props.handleSection(2)}}
          />
        </form>
      </div>
    )
  }
}
