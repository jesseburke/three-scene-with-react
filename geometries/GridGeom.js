import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// llc = lower left corner

export default function GridGeom({ length, width, llc = [0, 0], divisionLength = 1 }) {
    if (length <= 0 || width <= 0) return null;

    if (length > width) {
        const geom = GridGeom({ length: width, width: length, llc: [0, 0] });

        geom.rotateZ(Math.PI / 2);
        geom.translateY(-width); // not sure, but works

        // now have llc at origin, put it in correct place and return
        geom.translateX(llc[1]); // again, not sure why these work
        geom.translateY(-llc[0]); // same

        return geom;
    }

    const k = integerDivision(length, width);
    const group = new THREE.Group();
    let tempGrid;

    for (let i = 0; i < k; i++) {
        tempGrid = OriginGrid(length, length / divisionLength);
        tempGrid.translateX(i * length);
        group.add(tempGrid);
    }

    if (width - k * length > 0)
        group.add(GridGeom({ length, width: width - k * length, llc: [k * length, 0] }));

    group.translateX(llc[0]);
    group.translateY(llc[1]);

    return group;
}

function OriginGrid(size, divisions) {
    const grid = new THREE.GridHelper(size, divisions);

    grid.rotateX(Math.PI / 2)
        .translateX(size / 2)
        .translateZ(-size / 2); // not quite sure why this way, but works

    grid.material.opacity = 0.4;
    grid.material.transparent = true;

    return grid;
}

function integerDivision(m, n) {
    // assumes 0 < m < n;
    // returns k such that k*m \leq n < (k+1)*m

    if (n < m) return 0;

    return integerDivision(m, n - m) + 1;
}

//console.log('integerDivision(3, 13) is ', integerDivision(3, 13));
