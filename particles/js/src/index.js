/*  Observers  BEGIN */
// select the target node
var target = document.querySelector('#webgl-container');

// create an observer instance
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.target.attributes['class'].value === 'rendered') {
            // later replace by annimation

            document.getElementsByClassName('splash-module')[0].classList.add('disable');
            setTimeout(() => {
                document.getElementsByClassName('splash-module')[0].remove();
            }, 300);
            document.getElementsByTagName('body')[0].style.overflow = 'auto';
            // stop observing
            observer.disconnect();
        }
    });
});

// configuration of the observer:
var config = {
    attributes: true,
    childList: true,
    characterData: true
}

// pass in the target node, as well as the observer options
observer.observe(target, config);

/*  Observers  END  */




// start app
var app = new App();
const SELECTORS = {}

// hide splash when rendered



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

function hamburgerAnimation() {


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
}

/* Animate hamburger button END */


/* Works with menu module START */

// setters

const menuModule = document.getElementsByClassName('menu-module')[0];
const body = document.getElementsByTagName('body')[0];


function deactivateMenu(clickedMenuItem) {
    menuModule.innerHTML = '';
    // enable scrolling
    body.style.overflow = 'unset';
    // hide menu
    menuModule.classList.remove('active');
    hamburgerAnimation();
    if (clickedMenuItem.id !== 'showContact') {
        // hide contact module
        deactivateContact();
    }
}


// menu choosing adding listeners
function chooseMenuListeners() {
    // if any of menu clicked launch close module functionlity
    var chooseMenu = document.querySelectorAll('.js-choose-menu');
    chooseMenu.forEach(function (item) {
        item.addEventListener('click', function () {
            deactivateMenu(this);
        });
    });

    // listener for contact module
    document.getElementById('showContact').addEventListener('click', activateContact);

    // close menu module and get back home by clicking logo
    document.getElementById('menuLogo').addEventListener('click', function () {
        location.href = '#';
        deactivateMenu(this);
    });
}


function activateMenu() {
    // disbale scrolling
    body.style.overflow = 'hidden';
    // show menu
    menuModule.classList.add('active');

    menuModule.innerHTML = '<div class="menu-container"><img id="menuLogo" class="logo" src="images/logo.png" alt=""><div class="menu-list">\
    <a class="js-choose-menu" href="#capabilities"><div class="menu-item">Capabilities</div></a>\
    <a  id="showContact" class="js-choose-menu" ><div class="menu-item">Contact</div></a>\
    <a class="js-choose-menu" href="#clients"><div class="menu-item">Clients</div></a>\
    <a class="js-choose-menu" href="#"><div class="menu-item rainbow">The Cool Wall</div></a></div><div class="lets-build">\
    <a href="mailto:newbusiness@albi.studio">Let\'s build something awesome together!</a></div> </div>';
    chooseMenuListeners();
    hamburgerAnimation();

}

//event listener for hamburger menu
menuButton.addEventListener('click', function () {

    if (menuModule.classList.contains('active') === true) {
        deactivateMenu(this);
    } else {
        activateMenu();
    }

});




/* Works with menu module END */



/* Works with contacts module START */

// setters
const contactModule = document.getElementsByClassName('contact-module')[0];
const tags = document.querySelectorAll('.tags .tag');
const menuItem = document.getElementById('js-contact-item');
const middleTag = document.getElementById('emailTag');
const contactSVG = document.querySelectorAll('.contact-menu svg')[0];



function activateContact() {
    location.hash = "contact";
    // disbale scrolling
    body.style.overflow = 'hidden';
    // show menu
    contactModule.classList.add('active');

}


function deactivateContact() {
    // enable scrolling
    body.style.overflow = 'unset';
    // hide menu
    contactModule.classList.remove('active');
}


// Main function for single menu item
function activateContactInfo(tagObject) {

    // get clicked menu tag ID
    let id = tagObject.id;

    // get which one is clicked
    if (id === 'emailTag') {

        // filling the content
        menuItem.innerHTML = '<div class="item">Get in touch: \
            <a href="mailto:hello@albi.studio">hello@albi.studio</a>\
        </div>\
        <div class="item">Work with us: \
            <a href="mailto:newbusiness@albi.studio">newbusiness@albi.studio</a>\
        </div>';

    } else if (id === 'internetTag') {
        // pseudo animation for middle tag
        middleTag.classList.remove('left');
        middleTag.classList.add('right');

        // filling the content
        menuItem.innerHTML = '<div class="item">Reach Out On: \
            <a target="_blank"  href="https://t.me/albistudio">Telegram</a>\
        </div>\
        <div class="item">Follow On: \
            <a target="_blank" href="https://www.behance.net/albistudio">Behance</a>\
        </div>';
    } else {
        // pseudo animation for middle tag
        middleTag.classList.remove('right');
        middleTag.classList.add('left');

        // filling the content
        menuItem.innerHTML = '<div class="item flex">\
                <img class="flag" src="images/mapple.jpg" alt="" class="mapple">\
                <p class="city">toronto</p>\
            </div>\
        <div class="adress">2nd Floor, 205<br><a target="_blank" href="https://goo.gl/maps/kbfoaPWa4NVdRzxn8">181 Carlaw Ave.<br>Toronto, ON</a></div>';
    }
}

// Main function for menu elements
function contactOptionSelect() {

    // activate blob animation
    contactSVG.classList.add('active');
    // get clicked tag object
    let tagObject = this;

    // wait until blob animation is done
    setTimeout(() => {

        // run single menu item function
        activateContactInfo(tagObject);

        // clear active tags
        tags.forEach(function (tag) {
            tag.classList.remove('active');
        });

        // make clicked tag as active
        tagObject.classList.add('active');

        // activate default blob animation
        contactSVG.classList.remove('active');
    }, 300);
}

// Add event listener for crated content
tags.forEach(function (tag) {
    tag.addEventListener('click', contactOptionSelect);
});


// work with us event listener
document.getElementById('workWithUs').addEventListener('click', activateContact);

const contactBlackOut = document.getElementById('js-contact-black');
// close contact module and get back home by clicking logo
document.getElementById('contactLogo').addEventListener('click', function () {
    location.href = '#';
    contactBlackOut.classList.add('active');
    setTimeout(() => {
        deactivateContact();
    }, 300);
    setTimeout(() => {
        contactBlackOut.classList.remove('active');
    }, 300);
});

/* Works with contacts module END */



/*  Hint following curson on 1st Page only once BEGIN   */
var hint = document.getElementById("js-hint");
document.addEventListener("mousemove", getMouse);


hint.style.position = "absolute"; //css		
var hintPos = {
    x: 0,
    y: 0
};

setInterval(followMouse, 5);

var mouse = {
    x: 0,
    y: 0
}; //mouse.x, mouse.y

function getMouse(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
}

function followMouse() {
    //1. find distance X , distance Y
    var distX = mouse.x - hintPos.x;
    var distY = mouse.y - hintPos.y;
    //Easing motion
    //Progressive reduction of distance 
    hintPos.x += distX;
    hintPos.y += distY;

    hint.style.left = hintPos.x + "px";
    hint.style.top = hintPos.y + "px";
}

var helpBox = document.getElementById("js-hint");

var showHelpBox = function (show) {
    if (show) {
        helpBox.classList.remove("hidden");
    } else {
        helpBox.classList.add("hidden");
    }
};

// show help box for first time
if (!localStorage["albistudio.particles.helpShown"]) {
    helpBox.classList.remove("hidden");
    localStorage["albistudio.particles.helpShown"] = true;
}


/*  Hint following curson on 1st Page only once ENDS   */


/*  Video play functionality BEGINS */

var posters = document.querySelectorAll('.js-poster');
posters.forEach(function (poster) {

    // Desktop
    poster.addEventListener('mouseover', function () {
        this.nextElementSibling.play();
    });
    poster.addEventListener('mouseleave', function () {
        this.nextElementSibling.pause();
    });

    // IPad and Phones - NOT TESTED
    poster.addEventListener('touchstart', function () {
        this.nextElementSibling.play();
    });
    poster.addEventListener('touchend', function () {
        this.nextElementSibling.pause();
    });
});

/*  Video play functionality ENDS */

/*  Lottie animation functionality BEGINS */

// Getting json animation
var animData = {
    wrapper: document.getElementById('bodymovin'),
    animType: 'html',
    loop: true,
    prerender: true,
    autoplay: true,
    path: '/static/json/team-animation.json'

};
// Start animation
var anim = bodymovin.loadAnimation(animData);

// Event listener settings to play on click
// var svgAnimation = document.getElementById('bodymovin');
// var paused = document.querySelector('.paused');
// function actions() {
//     svgAnimation.classList.add('paused');
//     anim.pause();
//     paused.addEventListener('click', function () {
//         svgAnimation.classList.remove('paused');
//         anim.play();
//     });
// }
// svgAnimation.addEventListener('click', actions);

// Show bodymoving on hover

const bodymovinSelector = document.getElementById('bodymovin');


bodymovinSelector.addEventListener('mouseover', function () {
    setTimeout(function () {
        document.querySelector('#bodymovin > div:nth-child(2)').style.opacity = 1;
    }, 400);

});
bodymovinSelector.addEventListener('mouseleave', function () {
    setTimeout(function () {
        document.querySelector('#bodymovin > div:nth-child(2)').style.opacity = 0;
    }, 400);
});


/*  Lottie animation functionality ENDS */