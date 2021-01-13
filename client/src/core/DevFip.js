import React from "react";

import { is_dev_link } from "src/core/injected_build_constants.js";

export class DevFip extends React.Component {
  componentDidMount() {
    if (is_dev_link) {
      document
        .querySelector(".canada-logo")
        .setAttribute("data", "./svg/infobase-dev-fip.svg");
      document.querySelector("#ib-site-header").style.backgroundColor = "red";
    }
  }
  render() {
    return null;
  }
}
