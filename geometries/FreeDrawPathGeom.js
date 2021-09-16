import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

const defaultRadius = 0.075;
const defaultVertexSize = 2;

export default function LinePathGeom(
    pointArr,
    radius = defaultRadius,
    vertexSize = defaultVertexSize
) {
    // constants for the  geometry
    const tubularSegments = 1024;
    const radialSegments = 16;
    const closed = true;

    const l = pointArr.length;
    const path = new THREE.CurvePath();

    const sphereArr = [];

    let tempSphere;

    for (let i = 0; i < l - 1; i++) {
        path.add(
            new THREE.LineCurve3(
                new THREE.Vector3(...pointArr[i]),
                new THREE.Vector3(...pointArr[i + 1])
            )
        );

        tempSphere = new THREE.SphereBufferGeometry(vertexSize * radius, 32, 32).translate(
            ...pointArr[i + 1]
        );

        sphereArr.push(tempSphere);
    }

    const tubeGeometry = new THREE.TubeBufferGeometry(
        path,
        tubularSegments,
        radius,
        radialSegments,
        closed
    );
    sphereArr.push(tubeGeometry);

    return BufferGeometryUtils.mergeBufferGeometries(sphereArr);
}

export function RegularNgon(n, radius = defaultRadius, vertexSize = defaultVertexSize) {
    return LinePathGeom(RegularNgonPts(n), radius, vertexSize);
}

export function RegularNgonPts(n, size = 1) {
    const pointArr = [];

    for (let i = 0; i <= n; i++) {
        pointArr.push([
            size * Math.cos((i * 2 * Math.PI) / n + Math.PI / 2),
            size * Math.sin((i * 2 * Math.PI) / n + Math.PI / 2),
            0
        ]);
    }

    return pointArr;
}

export function RegularNgonSymmetrySlopes(n) {
    const pointArr = RegularNgonPts(n);

    // x = 0 is always a symmetry
    let slopeArray = [Infinity];

    // if n is even, then lines of symm correspond to first half of vertices, and then midpoints of sides
    if (n % 2 === 0) {
        for (let i = 1; i < n / 2; i++) {
            slopeArray[2 * i] = pointArr[i][1] / pointArr[i][0];
        }

        for (let i = 1; i <= n / 2; i++) {
            const vec = new THREE.Vector3(
                pointArr[i - 1][0],
                pointArr[i - 1][1],
                pointArr[i - 1][2]
            );
            const vec1 = new THREE.Vector3(pointArr[i][0], pointArr[i][1], pointArr[i][2]);

            vec.lerp(vec1, 0.5);

            slopeArray[2 * i - 1] = vec.y / vec.x;
        }
    }

    // if n is odd, then lines of symm correspond to vertices
    else {
        for (let i = 1; i < n; i++) {
            slopeArray[i] = pointArr[i][1] / pointArr[i][0];
        }
    }

    return slopeArray;
}

export function IrregularNgon(
    n,
    randomFactor = 0.5,
    radius = defaultRadius,
    vertexSize = defaultVertexSize
) {
    return LinePathGeom(IrregularNgonPts(n, randomFactor), radius, vertexSize);
}

function IrregularNgonPts(n, randomFactor = 0.5) {
    const pointArr = [[1, 0, 0]];
    let eps1, eps2;

    for (let i = 1; i < n; i++) {
        eps1 = Rando(-randomFactor, randomFactor);
        eps2 = Rando(-randomFactor, randomFactor);
        pointArr.push([
            Math.cos((i * 2 * Math.PI) / n + eps2) + eps1,
            Math.sin((i * 2 * Math.PI) / n + eps1) + eps2,
            0
        ]);
    }

    pointArr.push([1, 0, 0]);

    return pointArr;
}

function Rando(min, max) {
    return (max - min) * Math.random() + min;
}
