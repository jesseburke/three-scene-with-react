import React, { useEffect, useLayoutEffect, useState } from 'react';

import { atom, useAtom, PrimitiveAtom } from 'jotai';

import * as THREE from 'three';

import IntegralCurveGeom from '../geometries/IntegralCurveGeom';
import DraggableSphere from './interactive-components/DraggableSphere';

import { ArrayPoint2, Bounds, CurveData2 } from '../../src/my-types';

export interface DirectionFieldApproxProps {
    threeCBs?: Function;
    diffEqAtom: PrimitiveAtom<Function>;
    initialPointAtom: PrimitiveAtom<ArrayPoint2>;
    boundsAtom: PrimitiveAtom<Bounds>;
    curveDataAtom: PrimitiveAtom<CurveData2>;
    radius: number;
}

const zeroFuncAtom = atom({ func: (x, y) => 0 });

export default function IntegralCurve({
    threeCBs,
    diffEqAtom,
    initialPointAtom = null,
    boundsAtom,
    curveDataAtom,
    zHeightAtom = zeroFuncAtom,
    radius = 0.05
}) {
    const [mat, setMat] = useState();

    const [meshState, setMeshState] = useState();

    const initialPt = useAtom(initialPointAtom)[0];

    const func = useAtom(diffEqAtom)[0];

    const bounds = useAtom(boundsAtom)[0];

    const { visible, color, approxH, width } = useAtom(curveDataAtom)[0];

    const sphereColor = useAtom(curveDataAtom)[0].color;

    const zHeightFunc = useAtom(zHeightAtom)[0].func;

    useEffect(() => {
        setMat(
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(color),
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.6
            })
        );

        return () => {
            if (mat) mat.dispose();
        };
    }, [color]);

    useEffect(() => {
        if (!threeCBs) {
            setMeshState((s) => s);
            return;
        }

        if (!visible) {
            threeCBs.remove(meshState);
            setMeshState(null);
            return;
        }

        const dfag = IntegralCurveGeom({
            func: func.func,
            initialPt: [initialPt.x, initialPt.y],
            bounds,
            h: approxH,
            radius: width,
            zHeightFunc
        });

        const mesh = new THREE.Mesh(dfag, mat);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
            if (mat) mat.dispose();
        };
    }, [threeCBs, initialPt, bounds, func, width, approxH, mat, radius, visible, zHeightFunc]);

    return visible ? (
        <DraggableSphere
            threeCBs={threeCBs}
            color={sphereColor}
            dragPositionAtom={initialPointAtom}
            radius={(0.25 * width) / 0.1}
            funcAtom={diffEqAtom}
            zHeightAtom={zHeightAtom}
        />
    ) : null;
}
