import * as THREE from 'three';

import { round } from '@jesseburke/basic-utils';

export default function Line2dFactory(pt1, pt2 = new THREE.Vector3(0, 0, 0), roundPlace = 2) {
    if (pt1.x === pt2.x && pt1.y === pt2.y) {
        console.log('LineFactory called with two points equal to each other');
        return null;
    }

    // in radians, between 0 and Math.PI
    function getAngle() {
        return (Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) + Math.PI) % Math.PI;
    }

    // unit THREE.Vector3
    function getDirection() {
        const newVec = new THREE.Vector3().copy(pt2);

        newVec.sub(pt1);

        return newVec.normalize();
    }

    // the returned object has keys 'y', 'x', 'c'.
    // assume the equation is ay = bx + d;
    // if a = 0, returns {x: 1, y:0, c: d/b}
    // otherwise, returns {x: b/a, y: 1, c: d/a}
    function getEquation() {
        const a = pt2.x - pt1.x;
        const b = pt2.y - pt1.y;
        const d = pt1.y * (pt2.x - pt1.x) - pt1.x * (pt2.y - pt1.y);

        if (a === 0) {
            if (b === 0) {
                console.log('non-existent line encountered in getEquation in LineFactory');
                return null;
            }

            return { x: 1, y: 0, c: d / b };
        }

        return { y: 1, x: round(b / a, roundPlace), c: round(d / a, roundPlace) };
    }

    // returns the x-point where the line passes through y = y0, or
    // null if no such point
    function xIntercept(y0 = 0) {
        const eq = getEquation();

        // horizontal case
        if (eq.x === 0) {
            return eq.c / eq.y === y0 ? 0 : null;
        }

        return (eq.y * y0 - eq.c) / eq.x;
    }

    // returns the y-point where the line passes through x = x0, or
    // null if no such point
    function yIntercept(x0 = 0) {
        const eq = getEquation();

        // vertical case
        if (eq.y === 0) {
            return eq.c / eq.x === -x0 ? 0 : null;
        }

        return (eq.x * x0 + eq.c) / eq.y;
    }

    function getSlope() {
        if (pt1.x === pt2.x) return Infinity;

        return (pt1.y - pt2.y) / (pt1.x - pt2.x);
    }

    function isVertical() {
        return pt1.x === pt2.x;
    }

    function containsOrigin() {
        return getEquation().c === 0;
    }

    function angleWithinEpsilon(line, epsilon) {
        if (!line.getAngle()) {
            //console.log( 'angleWithinEpsilon was called with line.getAngle() null (line is first argument to withinEpsilon)' );
            return false;
        }

        return Math.abs(getAngle() - line.getAngle()) < epsilon;
    }

    function slopeWithinEpsilon(line, epsilon) {
        if (!line.getSlope()) {
            //console.log( 'slopeWithinEpsilon was called with line.getSlope() null (line is first argument to withinEpsilon)' );
            return false;
        }

        const m1 = getSlope();
        const m2 = line.getSlope();

        if (epsilon === 0) {
            return m1 === m2;
        } else if (!isFinite(m1)) {
            return Math.abs(m2) > 1 / epsilon;
        } else if (!isFinite(m2)) {
            return Math.abs(m1) > 1 / epsilon;
        }

        return Math.abs(m1 - m2) < epsilon;
    }

    function makeGeometry({
        bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        radius = 0.1,
        tubularSegments = 64,
        radialSegments = 4
    } = {}) {
        const { xMin, xMax, yMin, yMax } = bounds;

        let p1, p2;

        if (isVertical()) {
            p1 = new THREE.Vector3(xIntercept(yMin), yMin, 0);
            p2 = new THREE.Vector3(xIntercept(yMax), yMax, 0);
        } else {
            p1 = new THREE.Vector3(xMin, yIntercept(xMin), 0);
            p2 = new THREE.Vector3(xMax, yIntercept(xMax), 0);
        }
        const geometry = new THREE.TubeBufferGeometry(
            new THREE.LineCurve3(p1, p2),
            tubularSegments,
            radius,
            radialSegments
        );
        return geometry;
    }

    // following two functions assume that the line is through the
    // origin...need to implement for arbitrary lines

    // pure; returns new geometry
    function reflectGeometry(geom) {
        const newGeom = geom.clone();
        const angle = getAngle();

        newGeom.rotateZ(-angle);
        newGeom.rotateX(-Math.PI);
        newGeom.rotateZ(angle);

        return newGeom;
    }

    // pure; takes a THREE.Vector3 and returns a new THREE.Vector3
    function reflectPoint(pt) {
        const newPt = pt.clone();

        newPt.applyAxisAngle(getDirection(), Math.PI);

        return newPt;
    }

    return {
        getAngle,
        getDirection,
        getEquation,
        xIntercept,
        yIntercept,
        getSlope,
        containsOrigin,
        isVertical,
        angleWithinEpsilon,
        slopeWithinEpsilon,
        makeGeometry,
        reflectGeometry,
        reflectPoint
    };
}

export function OriginLineFromSlope(m) {
    if (m === Infinity || m === -Infinity) return Line2dFactory(new THREE.Vector3(0, 1, 0));

    return Line2dFactory(new THREE.Vector3(1, m, 0));
}
