const list = [];
let currentUser;
const socket = io();

function addItem() {
  console.log(list);
  const username = document.querySelector(".username").value;
  const value = document.querySelector(".item").value;
  if (value !== "") {
    list.push(value);
    document.querySelector(".item").value = "";
    document.querySelector(".username").value = currentUser;
    const p = document.createElement("p");
    p.textContent = username + ": " + value;
    document.querySelector(".list").appendChild(p);
    const data = { username, value };
    socket.emit("addItem", data);
  }
}

function select() {
  const index = Math.floor(Math.random() * list.length);
  const p = document.createElement("p");
  p.textContent = list[index];
  document.querySelector(".choosen").appendChild(p);
}

socket.on("sendData", (data) => {
  // console.log(data);
  data.forEach((ele) => {
    list.push(ele.name);
  });
});

function main() {
  const btn = document.querySelector(".add");
  if (btn) {
    socket.emit("gettingData");
    currentUser = document.querySelector(".username").value;
    btn.addEventListener("click", addItem);
    document.querySelector(".select").addEventListener("click", select);
  }
}

document.addEventListener("DOMContentLoaded", main);
