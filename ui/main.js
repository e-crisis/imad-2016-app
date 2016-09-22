console.log('Loaded!');
//change the text of the main text div
var element = document.getElementById('main-text');
element.innerHTML = 'New value';
//move the image
var img = document.getElementById('move');
var marginLeft = 0;
function moveRight() {
    marginLeft = marginLeft + 10; //increment value of marginLeft
    img.style.marginLeft =  marginLeft + 'px';//set the css to that value
}
img.onclick = function () {
    var interval = setInterval(moveRight, 100);//every 100 millisec apply the function moveRight
};
