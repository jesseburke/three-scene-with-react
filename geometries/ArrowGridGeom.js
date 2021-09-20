import * as THREE from 'three';
import { mergeBufferGeometries } from './MergeGeometries';

import ArrowGeom from './ArrowGeom.js';

// arrowLength*aGridSqSize will be actual arrow length

export default function ArrowGridGeom({
    arrowDensity,
    arrowLength,
    arrowThickness,
    bounds = {},
    func,
    zHeightFunc
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    const gridSqSize = 1 / arrowDensity;

    // getPtsArray returns array of two element arrays;
    // first element is standard coords (where arrow has length 1)
    // second element is scaled coords (where arrow has length
    // arrowLength)

    const array = getPtsArray({ bounds, gridSqSize });

    const geomArray = array.map(([[x, y], [a, b]]) => {
        const slope = func(a, b);

        const theta = Math.asin(slope / Math.sqrt(slope * slope + 1));

        const ag = ArrowGeom({ length: arrowLength, thickness: arrowThickness });
        const sg = new THREE.SphereBufferGeometry(0.1, 15, 15);

        const g = mergeBufferGeometries([ag, sg]);

        return g.rotateZ(theta - Math.PI / 2).translate(x, y, zHeightFunc(a, b));
    });

    const geom = mergeBufferGeometries(geomArray);
    const c = gridSqSize;
    geom.scale(c, c, 1);
    geom.translate(xMin, yMin, 0);

    return geom;
}

// returns array of two element arrays; the first element is std
// coords, the second is scaled coords
function getPtsArray({ bounds: { xMin, xMax, yMin, yMax }, gridSqSize }) {
    const h = Math.ceil((xMax - xMin) / gridSqSize);
    const v = Math.ceil((yMax - yMin) / gridSqSize);

    const array = [];

    for (let i = 0; i < h; i++) {
        for (let j = 0; j <= v; j++) {
            array.push([
                [i, j],
                [i * gridSqSize + xMin, yMin + j * gridSqSize]
            ]);
        }
    }

    return array;
}

// returns array of two element arrays; the first element is std
// coords, the second is scaled coords
function getPtsArrayOld({ quadSize, gridSqSize }) {
    const n = Math.ceil(quadSize / gridSqSize);

    const h = gridSqSize;

    const array = [];

    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++) {
            array.push([
                [i, j],
                [i * gridSqSize, j * gridSqSize]
            ]);
            array.push([
                [-i, j],
                [-i * gridSqSize, j * gridSqSize]
            ]);
            array.push([
                [-i, -j],
                [-i * gridSqSize, -j * gridSqSize]
            ]);
            array.push([
                [i, -j],
                [i * gridSqSize, -j * gridSqSize]
            ]);
        }
    }

    return array;
}
