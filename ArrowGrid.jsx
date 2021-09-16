import { useEffect, useRef } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import ArrowGridGeom from './geometries/ArrowGridGeom.js';

const zeroFuncAtom = atom({ func: (x, y) => 0 });

export default function ArrowGrid({
    threeCBs,
    diffEqAtom,
    boundsAtom,
    arrowGridDataAtom,
    zHeightAtom = zeroFuncAtom
}) {
    const { density, length, thickness, color } = useAtom(arrowGridDataAtom)[0];

    const [func] = useAtom(diffEqAtom);
    const [bounds] = useAtom(boundsAtom);

    const zHeightFunc = useAtom(zHeightAtom)[0].func;

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity: density,
            arrowLength: length,
            arrowThickness: thickness,
            bounds,
            func: func.func, //funcValue.func
            zHeightFunc
        });

        const material = new THREE.MeshBasicMaterial({ color });
        //material.transparent = true;
        //material.opacity = .75;

        const mesh = new THREE.Mesh(geom, material);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
            if (material) material.dispose();
        };
    }, [threeCBs, density, length, thickness, bounds, func, color, zHeightFunc]);

    return null;
}
