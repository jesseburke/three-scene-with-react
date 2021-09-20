import { gsap } from 'gsap';

import * as THREE from 'three';

export default function gsapRotate({
    mesh,
    angle,
    quaternion,
    axis = new THREE.Vector3(0, 0, 1),
    renderFunc,
    duration = 1,
    raiseDuration = 0.5,
    delay = 0.5,
    ease = 'pow4',
    onComplete = identity,
    onStart = identity,
    clampToEnd = false,
    options = {}
}) {
    if (!mesh) {
        console.log('gsapRotate called with null mesh');
        return;
    }

    let qStart = new THREE.Quaternion();
    qStart.copy(mesh.quaternion);

    let qEnd;

    if (angle) {
        let emptyObj = new THREE.Object3D();
        emptyObj.quaternion.copy(qStart);
        emptyObj.rotateOnAxis(axis.normalize(), angle);
        qEnd = emptyObj.quaternion;
    } else if (quaternion) {
        qEnd = quaternion;
    } else {
        console.log(
            'gsapRotate needs angle or quaternion argument; if both are given, angle takes precedence and quaternion is ignored'
        );

        return;
    }

    let time = { t: 0 };

    const tl = gsap.timeline();

    //console.log('gsapRotate called with qEnd = ', qEnd);
    //console.log('qStart is ', qStart);
    //console.log('qEnd is ', qEnd);

    tl.to(time, {
        t: 1,
        ease,
        delay,
        duration,
        onStart,
        onUpdate: () => {
            THREE.Quaternion.slerp(qStart, qEnd, mesh.quaternion, time.t);
            renderFunc();
        },
        onComplete: () => {
            // commented out following because am using this as yo-yo
            if (clampToEnd) mesh.quaternion.copy(qEnd);
            onComplete();
            renderFunc();
        },
        ...options
    });

    return tl;
}

const identity = (x) => x;

const string = (q) => [q.x, q.y, q.z, q.w];
