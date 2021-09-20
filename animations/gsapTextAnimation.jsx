import { css } from 'emotion';

import {gsap} from 'gsap';


export default function gsapTextAnimation({ parentNode,
					    style,
					    entrySide = 'left',
					    text,
					    duration = .75,
					    displayTime = 1,
					    ease = 'sine'}) {

    let div = document.createElement('div');	   
    div.textContent = text;

    const offScreenDistance = 50;
    const inScreenDistance = 250;

    let left;
    switch( entrySide ) {
        
    case 'left':
        left = -offScreenDistance;
        break;
    case 'right':
        left = 100 + offScreenDistance;
        break;
    }

    const cssClass = css`
                    background-color: ${style.backgroundColor};                  
                    border: ${style.border};
                    color: ${style.color};             
                    padding: ${style.padding};
                    position: absolute;
                    margin: 0;        
                    left: ${style.left};
                    top: ${style.top};
                    opacity: 1;
                    font-size: ${style.fontSize};
                    zIndex: 100;`;
    div.classList.add(cssClass);

    parentNode.appendChild( div );

    const tl = gsap.timeline();

    tl.from( div, { duration, opacity: 0,  ease } )
	.to( div, { duration, opacity: 0,  ease, delay: displayTime } ); 

    return tl;
    
}

