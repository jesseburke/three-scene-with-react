import * as THREE from 'three';
import { mergeBufferGeometries } from './MergeGeometries';

// output has middle at origin; arrow is parallel to y-axis
// base of arrow is at (0, -length/2) and tip of arrow is at (0, length/2)

export default function ArrowGeom({ length, thickness = 1 }) {
    const rawGeom = RawArrowGeom({
        baseLength: 1.5,
        baseRadius: 0.04 * thickness,
        tipLength: 0.5,
        tipRadius: 0.15 * thickness
    });

    // the 2 is the length of the raw arrow above
    rawGeom.scale(length / 2, length / 2, length / 2);

    return rawGeom;
}

function RawArrowGeom({ baseLength, baseRadius, tipLength, tipRadius }) {
    const radiusTop = baseRadius;
    const radiusBottom = baseRadius;
    let height = baseLength;
    let radialSegments = 8;
    let heightSegments = 1;
    let openEnded = false;

    const base = new THREE.CylinderBufferGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );

    const radius = tipRadius;
    height = tipLength;
    radialSegments = 8;
    heightSegments = 1;
    openEnded = false;

    const tip = new THREE.ConeBufferGeometry(
        radius,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );

    // moves up so origin is at base
    tip.translate(0, tipLength / 2 + baseLength, 0);
    base.translate(0, baseLength / 2, 0);

    let geometries = [base, tip];

    const arrowGeom = mergeBufferGeometries(geometries);

    // move so origin is through center of arrow
    //arrowGeom.translate(0, -(baseLength + tipLength)/2, 0);

    return arrowGeom;
}
