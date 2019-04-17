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
const SELECTORS = {}


/* Animate hamburger button START */
const setStylesOnElement = function (styles, element) {
    Object.assign(element.style, styles);
}

// setters
const menuButton = document.getElementsByClassName('menu-button')[0];
const lineTop = document.getElementsByClassName('menu-button-lineTop')[0];
const lineMiddle = document.getElementsByClassName('menu-button-lineMiddle')[0];
const lineBottom = document.getElementsByClassName('menu-button-lineBottom')[0];

// clicked styles
var menuButtonStyles = {
    borderColor: '#fff'
}
var lineTopStyles = {
    background: '#fff',
    '-webkit-transform': 'translateY(7px) rotate(45deg)',
    transform: 'translateY(7px) rotate(45deg)',
    width: '30px'
}
var lineMiddleStyles = {
    background: '#fff',
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

// default styles
var menuButtonStylesDef = {
    borderColor: '#4CA5AD'
}
var lineTopStylesDef = {
    background: '#4CA5AD',
    '-webkit-transform': 'unset',
    transform: 'unset',
    width: '25px'
}
var lineMiddleStylesDef = {
    background: '#4CA5AD',
    '-webkit-transform': 'translateX(0)',
    transform: 'translateX(0)',
    opacity: 1
}
var lineBottomStylesDef = {
    background: '#4CA5AD',
    width: '20px',
    '-webkit-transform': 'unset',
    transform: 'unset'
}

menuButton.addEventListener('click', function () {
    if (menuButton.classList.contains('open') === true) {
        menuButton.classList.remove('open');
        setStylesOnElement(menuButtonStylesDef, menuButton);
        setStylesOnElement(lineTopStylesDef, lineTop);
        setStylesOnElement(lineMiddleStylesDef, lineMiddle);
        setStylesOnElement(lineBottomStylesDef, lineBottom);
    } else {
        menuButton.classList.add('open');
        setStylesOnElement(menuButtonStyles, menuButton);
        setStylesOnElement(lineTopStyles, lineTop);
        setStylesOnElement(lineMiddleStyles, lineMiddle);
        setStylesOnElement(lineBottomStyles, lineBottom);
    }
});

/* Animate hamburger button END */


/* Animate menu module START */

// setters

const menuModule = document.getElementsByClassName('menu-module')[0];
const body = document.getElementsByTagName('body')[0];

function activateMenu(){
    menuModule.innerHTML = '<div class="menu-container"><img class="logo" src="images/logo.png" alt=""><div class="menu-list"><a href="#capabilities"><div class="menu-item">Capabilities</div></a><a href="#contact"><div class="menu-item">Contact</div></a><a href="#clients"><div class="menu-item">Clients</div></a><a href="#"><div class="menu-item rainbow">The Cool Wall</div></a></div><div class="lets-build"><a href="#">Let\'s build something awesome together!</a></div> </div>';
}
function deactivateMenu(){
    menuModule.innerHTML='';
}

//event listener for hamburger menu
menuButton.addEventListener('click', function () {

    if (menuModule.classList.contains('active') === true) {
        deactivateMenu();
        // enable scrolling
        body.style.overflow = 'unset';
        // hide menu
        menuModule.classList.remove('active');
    } else {
        // disbale scrolling
        body.style.overflow = 'hidden';
        // show menu
        menuModule.classList.add('active');
        activateMenu();
    }

});