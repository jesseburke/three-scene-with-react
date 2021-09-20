import {gsap} from 'gsap';

import * as THREE from 'three';

export default function gsapTranslate({ mesh,
					// following is a Vector3
					translateVec,
					// following is a Vector3 
					toVec,
					renderFunc,
					duration = 1,
					raiseDuration = .5,
					delay = .5,
					ease = 'pow4',
					onStart = identity,
					onComplete = identity,				
					options = {}}) {

    if( !mesh ) {
	console.log('gsapTranslate called with null mesh');
	return;
    }

    let destPos;
    
    if( translateVec ) {
	destPos = new THREE.Vector3();
	destPos.copy(mesh.position);

	destPos.add( translateVec );
    }

    else if (toVec) {
	destPos = toVec;
    }

    else {
	console.log('gsapTranslate needs translateVec or toVec; if both are given, translateVec takes precedence and toVec is ignored');

	return;
    }
    
    let time = {t: 0};
    const tl = gsap.timeline();   

    tl.to( time, {
        t: 1,
        ease,
        delay,
        duration,
	onStart,
        onUpdate: () => {	    
	    mesh.position.lerp( destPos, time.t);	  
	    renderFunc();
	},
        onComplete: () => {	   
	    onComplete();
	    renderFunc();	  	   
        },
	...options });    
   
    return tl;
}

const identity = (x) => x;

const string = (q) => [q.x, q.y, q.z, q.w];

