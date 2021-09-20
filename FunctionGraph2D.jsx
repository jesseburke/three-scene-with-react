import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import FunctionGraph2DGeom from './geometries/FunctionGraph2DGeom.js';

export default function FunctionGraph2D({ threeCBs, funcAtom, boundsAtom, curveOptionsAtom }) {
    const func = useAtom(funcAtom)[0];
    const bounds = useAtom(boundsAtom)[0];
    const { color, approxH, width, visible } = useAtom(curveOptionsAtom)[0];

    useLayoutEffect(() => {
        if (!threeCBs || !visible || !func) return;

        const geom = FunctionGraph2DGeom({
            func: func.func,
            approxH,
            radius: width,
            bounds
        });

        if (!geom) return;

        const mat = funcMaterial(color);
        const mesh = new THREE.Mesh(geom, mat);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
            if (mat) mat.dispose();
        };
    }, [threeCBs, func, bounds, color, visible, width, approxH]);

    return null;
}

const funcMaterial = function (color) {
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        side: THREE.FrontSide
    });
    mat.transparent = true;
    mat.opacity = 0.6;

    return mat;
};
