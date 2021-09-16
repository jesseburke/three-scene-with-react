import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ptArray is an array of THREE.Vector3's to be drawn
export default function CurvedPathGeom({
    ptArray,
    tubularSegments = 2128,
    radius = 0.05,
    radialSegments = 4
}) {
    let curve;

    if (!ptArray || ptArray.length === 0) return null;

    //curve = curveSeg(ptArray);

    // if there is only one point, then return a sphere at that point
    if (ptArray.length === 1) {
        const pt = ptArray[0];

        return new THREE.SphereBufferGeometry(radius, 15, 15).translate(pt.x, pt.y, 0);
    }

    if (ptArray.length == 2) {
        curve = new THREE.LineCurve3(ptArray[0], ptArray[0]);
    } else if (ptArray.length == 3) {
        curve = new THREE.QuadraticBezierCurve3(ptArray[0], ptArray[1], ptArray[2]);
    } else {
        curve = new THREE.CatmullRomCurve3(ptArray);
    }

    return new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radialSegments, false);
}

function curveSeg(ptArray) {
    const l = ptArray.length;

    let curve = new THREE.CurvePath();

    // for( let i = 0; i < Math.floor((l-1)/2); i++ ) {

    // 	curve.add( new THREE.CatmullRomCurve3([ pointArray[2*i], pointArray[2*i+1], pointArray[2*i+2] ]) );

    // }

    // if( l % 2 === 0 )
    // 	curve.add( new THREE.LineCurve3( pointArray[l-2], pointArray[l-1] ) );

    for (let i = 0; i < l - 1; i++) {
        curve.add(new THREE.LineCurve3(ptArray[i], ptArray[i + 1]));
    }

    return curve;
}
