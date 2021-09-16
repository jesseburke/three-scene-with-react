import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import Delaunator from 'delaunator';

export default function DelaunayGeometry(triangulation, pointRadius = 0.075, lineRadius = 0.01) {
    const ptArray = triangulation.getPoints();

    const d = triangulation.getD();

    if (ptArray.length < 2) {
        console.log(
            'DelaunayGeometry called with argument triangulation such that triangulation.getPoints() has less than 2 elements; returned null'
        );

        return null;
    } else if (ptArray.length === 2) {
        return new THREE.TubeBufferGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(ptArray[0][0], ptArray[0][1], 0),
                new THREE.Vector3(ptArray[1][0], ptArray[1][1], 0)
            ),
            64,
            lineRadius,
            32,
            false
        );
    }

    const pointGeomArray = ptArray.map((p) =>
        new THREE.SphereBufferGeometry(pointRadius, 32, 32).translate(p[0], p[1], 0)
    );

    //const pointGeom = BufferGeometryUtils.mergeBufferGeometries(pointGeomArray);

    let trianglePath;

    const triangleGeomArray = [];

    const pts = ptArray.map(([x, y]) => new THREE.Vector3(x, y, 0));

    for (let i = 0; i < d.triangles.length; i += 3) {
        trianglePath = new THREE.CurvePath();

        trianglePath.add(new THREE.LineCurve3(pts[d.triangles[i]], pts[d.triangles[i + 1]]));
        trianglePath.add(new THREE.LineCurve3(pts[d.triangles[i + 1]], pts[d.triangles[i + 2]]));
        trianglePath.add(new THREE.LineCurve3(pts[d.triangles[i + 2]], pts[d.triangles[i]]));
        triangleGeomArray.push(
            new THREE.TubeBufferGeometry(trianglePath, 64, lineRadius, 32, false)
        );
    }

    return BufferGeometryUtils.mergeBufferGeometries(triangleGeomArray.concat(pointGeomArray));
}
