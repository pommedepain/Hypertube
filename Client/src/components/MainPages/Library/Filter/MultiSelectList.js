import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';

class MultiSelectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: props.options,
      selectedOption: null,
    }
  }

  handleSelect =  (event, {value}) => {
    this.setState({
      selectedOption: value
    }, () => this.props.onChange(value));
  }

  render() {
    const {options} = this.state;
    return (
      <Dropdown 
      placeholder='Genres' 
      fluid multiple selection 
      options={options} 
      onChange={this.handleSelect}
      style={{
        width: "40%",
        height: "20px",
        marginTop: "20px",
        color: "white",
        fontWeight: "bold",
        backgroundColor: "transparent",
        border: "solid 2px white",
        fontFamily: "'Roboto', sans-serif"}}/>
    )
  }
}

export default MultiSelectList;
