/*var helpBox = document.getElementById("help-box");

var showHelpBox = function(show) {
    if (show) {
        helpBox.classList.remove("hidden");
    }
    else {
        helpBox.classList.add("hidden");
    }
};

// show help box for first time
if (!localStorage["iamnop.particles.helpShown"]) {
    helpBox.classList.remove("hidden");
    localStorage["iamnop.particles.helpShown"] = true;
}*/

// start app
var app = new App();



// animate hamburger
const setStylesOnElement = function (styles, element) {
    Object.assign(element.style, styles);
}

// setters
const menuButton = document.getElementsByClassName('menu-button')[0];
const lineTop = document.getElementsByClassName('menu-button-lineTop')[0];
const lineMiddle = document.getElementsByClassName('menu-button-lineMiddle')[0];
const lineBottom = document.getElementsByClassName('menu-button-lineBottom')[0];

var menuButtonStyles = {
    borderColor: '#fff'
};
var lineTopStyles = {
    '-webkit-transform': 'translateY(7px) rotate(45deg)',
    transform: 'translateY(7px) rotate(45deg)',
    width: '30px',
    background: '#fff'
    
}
var lineMiddleStyles = {
    '-webkit-transform': 'translateX(26px)',
    transform: 'translateX(26px)',
    opacity: 0
    
}
var lineBottomStyles = {
    background: '#fff',
    width: '30px',
    '-webkit-transform-origin': 'top left',
    'transform-origin': 'top left',
    '-webkit-transform': 'translate(4px,4px) rotate(-45deg)',
    transform: 'translate(4px,4px) rotate(-45deg)'
}

menuButton.addEventListener('click', function () {
    setStylesOnElement(menuButtonStyles, menuButton);
    setStylesOnElement(lineTopStyles, lineTop);
    setStylesOnElement(lineMiddleStyles, lineMiddle);
    setStylesOnElement(lineBottomStyles, lineBottom);

});