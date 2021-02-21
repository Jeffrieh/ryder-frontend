import _ from "lodash";

function component() {
  const element = document.createElement("div");

  element.innerHTML = "<canvas id='test'>";

  return element;
}

document.body.appendChild(component());
