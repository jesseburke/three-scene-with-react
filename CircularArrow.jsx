import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import { circularArrowGeom } from './geometries/CircularArrowGeom.jsx';

//------------------------------------------------------------------------
//
// constants

const defaultColorAtom = atom('rgb(231, 71, 41)');
const defaultNotVisibleAtom = atom(false);

export default function CircularArrow({
    threeCBs,
    radius = 0.1,
    colorAtom = defaultColorAtom,
    visibleAtom,
    notVisibleAtom = defaultNotVisibleAtom,
    angleAtom,
    pointAtom
}) {
    const meshRef = useRef(null);
    const angle = useAtom(angleAtom)[0];
    const point = useAtom(pointAtom)[0];
    const visible = visibleAtom ? useAtom(visibleAtom)[0] : !useAtom(notVisibleAtom)[0];
    const [color] = useAtom(colorAtom);

    // this sets up and displays the orange rotation arrow
    useEffect(() => {
        let geom;

        if (visible && angle !== 0 && threeCBs) {
            geom = circularArrowGeom({
                x: point.x,
                y: point.y,
                angle,
                meshRadius: radius,
                reversed: angle < 0
            });

            const material = new THREE.MeshBasicMaterial({ color, opacity: 1 });
            material.transparent = false;

            meshRef.current = new THREE.Mesh(geom, material);
            threeCBs.add(meshRef.current);
        }

        return () => {
            if (meshRef.current) threeCBs.remove(meshRef.current);
            if (geom) geom.dispose();
        };
    }, [angle, threeCBs, point, visible]);

    return null;
}
