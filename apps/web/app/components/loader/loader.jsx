import React, { Component } from "react";

export class loader extends Component {
  render() {
    return (
      <div>
        <div className="loader">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
}

export default loader;
