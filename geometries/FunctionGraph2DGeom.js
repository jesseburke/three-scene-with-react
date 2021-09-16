import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import CurvedPathGeom from './CurvedPathGeom.jsx';

// func: f(x)
export default function FunctionGraph2DGeom({
    func,
    bounds,
    color,
    approxH = 0.1,
    // this is the max no of line segments in a component
    maxSegLength = 20,
    tubularSegments = 1064,
    radius = 0.15,
    radialSegments = 4
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    let compArray = curveComps({ bounds, func, approxH });

    return BufferGeometryUtils.mergeBufferGeometries(
        compArray.map((c) =>
            CurvedPathGeom({ ptArray: c, tubularSegments, radius, radialSegments })
        )
    );
}

// this will output an array of arrays, with each array representing a connected component of
// the graph of func, which is inside bounds
//

function curveComps({ bounds, func, approxH }) {
    const { xMin, xMax, yMin, yMax } = bounds;

    let compArray = [];
    let curArray = [];

    let pointArray = [];

    let x0, y0, x1, y1, m, tx, ty, lastOutPt;

    for (let i = Math.floor(xMin / approxH); i < Math.ceil(xMax / approxH); i++) {
        ty = func(i * approxH);

        // if out of bounds, will try to add point on the boundary (but potentially off the x-grid)
        if (ty < yMin || ty > yMax) {
            // were out of bounds previous iteration, still out of bounds,
            // so nothing to do
            if (curArray.length === 0) {
                lastOutPt = [i * approxH, ty];
                continue;
            }

            // otherwise, to draw equation until edge of bounds, will do linear
            // approximation for the last bit

            [x0, y0] = Vector3ToArray(curArray[curArray.length - 1]);
            [x1, y1] = [i * approxH, ty];

            // x1 - x0 is nonzero by construction
            m = (y1 - y0) / (x1 - x0);

            if (ty > yMax) {
                tx = x0 + (yMax - y0) / m;
                curArray.push(new THREE.Vector3(tx, yMax, 0));
                lastOutPt = [x1, y1];
            } else if (ty < yMin) {
                tx = x0 + (yMin - y0) / m;
                curArray.push(new THREE.Vector3(tx, yMin, 0));
                lastOutPt = [x1, y1];
            }

            compArray.push(curArray);
            curArray = [];
            continue;
        }

        // if curArray is empty, then will add point on the boundary
        if (curArray.length === 0 && lastOutPt) {
            [x0, y0] = lastOutPt;
            [x1, y1] = [i * approxH, ty];

            m = (y1 - y0) / (x1 - x0);

            if (y0 > yMax) {
                tx = x0 + (yMax - y0) / m;
                curArray.push(new THREE.Vector3(tx, yMax, 0));
            } else if (y0 < yMin) {
                tx = x0 + (yMin - y0) / m;
                curArray.push(new THREE.Vector3(tx, yMin, 0));
            } else {
                curArray.push(new THREE.Vector3(x0, y0, 0));
            }
        }

        curArray.push(new THREE.Vector3(i * approxH, ty, 0));
    }

    if (curArray.length > 0) compArray.push(curArray);

    return compArray;
}

function Vector3ToArray(v) {
    return [v.x, v.y];
}
