function KeyboardState() {
  // bind keyEvents
  //   document.addEventListener("keydown", KeyboardState.onKeyDown, false);
  document.addEventListener("keyup", KeyboardState.onKeyUp, false);
  document.addEventListener("keydown", KeyboardState.onKeyDown, false);
}

KeyboardState.onKeyUp = function (event) {
  KeyboardState.cur = null;
};

KeyboardState.onKeyDown = function (event) {
  var key = KeyboardState.keyName(event.keyCode);
  KeyboardState.cur = key;
};

const keyMap = {
  87: "w",
  65: "a",
  83: "s",
  68: "d",
};

KeyboardState.currentKey = () => {
  return KeyboardState.cur;
};

KeyboardState.keyName = function (keyCode) {
  return keyMap[keyCode];
};

export default KeyboardState;
