import {gsap} from 'gsap';

import * as THREE from 'three';

// onComplete was previously called doneCB; can't find any files that
// use this, but if they are broken, this may be the reason

export default function gsapReflect({ mesh,
                                      axis,
                                      renderFunc,
                                      duration = 1,
                                      delay = .5,
				      ease = 'pow4',
				      onStart = (x => x),
                                      onComplete = (x => x),
				      clampToEnd = false,
				      options = {}}) {
    
    let qStart = new THREE.Quaternion();
    qStart.copy( mesh.quaternion );
    
    let emptyObj = new THREE.Object3D();
    emptyObj.quaternion.copy(qStart);
    emptyObj.rotateOnWorldAxis( axis, Math.PI );
    let qEnd = emptyObj.quaternion;

    // not sure why this is needed, but it seems to be
    qStart.normalize();
    qEnd.normalize();

    //console.log('qstart is ', qStart);

    let time = {t: 0};
   
    return gsap.to( time, {
        t: 1,
        ease,
        delay,
        duration,
	onStart,
        onUpdate: () => {
	    THREE.Quaternion.slerp( qStart, qEnd, mesh.quaternion, time.t );	    
	    renderFunc();
	},
        onComplete: () => {	  
	    if( clampToEnd )  mesh.quaternion.copy( qEnd );
	    onComplete();
	    renderFunc();	  	   
        },
	...options });    
}

const identity = (x) => x;

const string = (q) => [q.x, q.y, q.z, q.w];

