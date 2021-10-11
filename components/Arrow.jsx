import { useEffect, useRef } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import ArrowGeom from '../geometries/ArrowGeom.js';

const defaultNotVisibleAtom = atom(false);

export default function Arrow({
    threeCBs,
    startPointAtom,
    endPointAtom,
    visibleAtom,
    notVisibleAtom = defaultNotVisibleAtom,
    color = 'rgb(231, 0, 0)'
}) {
    const startPoint = useAtom(startPointAtom)[0];
    const endPoint = useAtom(endPointAtom)[0];

    const visible = visibleAtom ? useAtom(visibleAtom)[0] : !useAtom(notVisibleAtom)[0];

    const v = new THREE.Vector2(startPoint.x - endPoint.x, startPoint.y - endPoint.y);
    const l = v.length();
    const meshRef = useRef(null);

    useEffect(() => {
        let geom;

        if (visible && threeCBs) {
            // the arrow starts parallel to y-axis, is why pi/2 is in there
            geom = ArrowGeom({ length: l }).rotateZ(v.angle() + Math.PI / 2);
            geom.translate(startPoint.x, startPoint.y, 0);

            const material = new THREE.MeshBasicMaterial({ color });

            meshRef.current = new THREE.Mesh(geom, material);

            threeCBs.add(meshRef.current);
        }

        return () => {
            if (meshRef.current) threeCBs.remove(meshRef.current);
            if (geom) geom.dispose();
        };
    }, [threeCBs, color, startPoint, endPoint, visible]);

    return null;
}
