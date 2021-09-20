import { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { mergeBufferGeometries } from './MergeGeometries';

export default function OriginLine({
    vec,
    tubularSegments = 64,
    radius = 0.02,
    radialSegments = 4,
    closed = false,
    length = 100
}) {
    const newVec = new THREE.Vector3().copy(vec);
    newVec.multiplyScalar(length);

    // make the line geometry; goes two directions from origin
    const geometry = mergeBufferGeometries([
        new THREE.TubeBufferGeometry(
            new THREE.LineCurve3(newVec, new THREE.Vector3(0, 0, 0)),
            tubularSegments,
            radius,
            radialSegments,
            closed
        ),
        new THREE.TubeBufferGeometry(
            new THREE.LineCurve3(newVec.multiplyScalar(-1), new THREE.Vector3(0, 0, 0)),
            tubularSegments,
            radius,
            radialSegments,
            closed
        )
    ]);

    return geometry;
}
