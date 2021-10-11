import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

export default function Plane({
    threeCBs,
    color = '#82BFCD',
    heightAndWidthAtom,
    centerAtom,
    meshRef
}) {
    const [planeMesh, setPlaneMesh] = useState(null);

    const { width, height } = useAtom(heightAndWidthAtom)[0];
    const [centerX, centerY] = useAtom(centerAtom)[0];

    useEffect(() => {
        if (!threeCBs) return;

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            side: THREE.DoubleSide
        });

        material.transparent = true;
        material.opacity = 0.6;
        material.shininess = 0;
        const geometry = new THREE.PlaneGeometry(width, height);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(centerX, centerY, 0);

        const mesh = new THREE.Mesh(geometry, material);
        threeCBs.add(mesh);
        setPlaneMesh(mesh);

        return () => {
            threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, color, width, height, centerX, centerY]);

    useEffect(() => {
        if (!meshRef) return;

        meshRef.current = planeMesh;
    }, [meshRef, planeMesh]);

    return null;
}
