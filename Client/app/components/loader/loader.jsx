import React, { Component } from "react";

export class loader extends Component {
  render() {
    return (
      <div>
        <div className="loader">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
}

export default loader;
