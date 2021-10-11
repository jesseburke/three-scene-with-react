import React, { useRef, useEffect } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

const defaultNotVisibleAtom = atom(false);

const defaultColorAtom = atom('#3285ab');

const defaultLabelAtom = atom(null);

export default function Line({
    threeCBs,
    radius = 0.1,
    colorAtom = defaultColorAtom,
    lineDataAtom,
    visibleAtom,
    notVisibleAtom = defaultNotVisibleAtom,
    labelAtom = defaultLabelAtom,
    boundsAtom
}) {
    const meshRef = useRef(null);

    const visible = visibleAtom ? useAtom(visibleAtom)[0] : !useAtom(notVisibleAtom)[0];

    const [color] = useAtom(colorAtom);

    const [labelObj] = useAtom(labelAtom);

    const lineData = useAtom(lineDataAtom)[0];

    const bounds = useAtom(boundsAtom)[0];

    //------------------------------------------------------------------------
    //
    // sets up the mesh
    //

    useEffect(() => {
        if (!threeCBs) {
            return;
        }

        if (!visible || !lineData) {
            if (meshRef.current) threeCBs.remove(meshRef.current);
            meshRef.current = null;
            return;
        }

        const geometry = lineData.makeGeometry({ bounds });
        const material = new THREE.MeshBasicMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material);

        threeCBs.add(mesh);
        meshRef.current = mesh;

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [visible, color, radius, threeCBs, lineData]);

    useEffect(() => {
        if (!threeCBs || !labelObj) return;

        let labelID = threeCBs.addLabel(labelObj);

        threeCBs.drawLabels();
        threeCBs.render();

        return () => {
            if (labelID) {
                threeCBs.removeLabel(labelID);
            }

            //threeCBs.drawLabels();
        };
    }, [threeCBs, labelObj]);

    return null;
}
