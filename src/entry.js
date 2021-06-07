import _ from "lodash";
require('./scss/ryder.scss');
import Scene from "./js/Scene";
require('rivets');

// import 'three';

var template = require("./templates/index.hbs");

const data = {
    author : false,
    gameActive : false,
    firstName: "dick",
    lastName: "wilkins",
    appName: "Ryder",
    test: "yoyoyoo",
    username: null,
    rooms : [{name: "Jeffrey's room"}]
}

function createHtml(d){
    var container = document.getElementById("app");
    container.innerHTML = template(d);
    attachListeners();
}

createHtml(data);

function parseInputs(){
    const inputs = document.querySelectorAll('[j-model]');
    inputs.forEach(input => {
        const attr = input.getAttribute("j-model");
        input.value = data[attr];
        input.addEventListener("input", (d) => {
           data[attr] = d.target.value;
        })
    })
}

parseInputs();

function attachListeners(elem){
    const next = document.getElementById("next");
    if(next){
        next.addEventListener("click", () => {{
            createHtml(data);
        }})
    }
    const cr = document.getElementById("create");
    if(cr){
        cr.addEventListener("click", createRoom);
    }
}

const createRoom = () => {
    data.gameActive = true;
    createHtml(data);
    const scene = new Scene();
    scene.setup();
}


// //start setup