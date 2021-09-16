import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import FunctionGraph3DGeom from './geometries/FunctionGraph3DGeom.js';

export default function FunctionGraph3D({
    threeCBs,
    funcAtom,
    boundsAtom,
    color = '#E53935',
    meshNormal = false
}) {
    const func = useAtom(funcAtom)[0];
    const bounds = useAtom(boundsAtom)[0];

    useEffect(() => {
        if (!threeCBs) return;

        const geometry = FunctionGraph3DGeom({
            func: func.func,
            bounds,
            meshSize: 200
        });

        let material;

        if (meshNormal)
            material = new THREE.MeshNormalMaterial({
                side: THREE.DoubleSide
            });
        else
            material = new THREE.MeshPhongMaterial({
                color,
                side: THREE.DoubleSide
            });
        //material.shininess = 0;
        //material.transparent = true;
        //material.opacity = .6;
        //material.wireframe = true;

        BufferGeometryUtils.computeTangents(geometry);

        const mesh = new THREE.Mesh(geometry, material);
        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, func, color, bounds]);

    return null;
}
