import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

const defaultPausedAtom = atom(false);

export default function ClickablePlaneComp({
    threeCBs,
    clickPointAtom,
    pausedAtom = defaultPausedAtom,
    xSize = 1000,
    ySize = 1000,
    mesh
}) {
    const [clickPlane, setClickPlane] = useState(null);
    const [clickPoint, setClickPoint] = useAtom(clickPointAtom);

    const paused = useAtom(pausedAtom)[0];

    useEffect(() => {
        let cp;

        if (!threeCBs) setClickPlane(null);
        else {
            cp = ClickPlane({ threeCBs, clickCB: setClickPoint, mesh, xSize, ySize });
            setClickPlane(cp);
        }

        return () => {
            if (cp) {
                cp.dispose();
            }
        };
    }, [threeCBs, clickPoint, mesh, xSize, ySize]);

    useEffect(() => {
        if (!clickPlane) {
            return;
        }

        if (!paused) {
            clickPlane.play();
            return;
        } else {
            clickPlane.pause();
        }
    }, [clickPlane, paused]);

    return null;
}

function ClickPlane({ threeCBs, clickCB, mesh = null, xSize, ySize }) {
    if (!threeCBs) return;

    const { getCanvas, add, remove, getMouseCoords } = threeCBs;
    const canvas = getCanvas();

    let areChoosing = true;
    let endPt;

    //------------------------------------------------------------------------
    //
    // this is a transparent plane, used for mouse picking

    const planeGeom = new THREE.PlaneBufferGeometry(xSize, ySize, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 'rgba(0, 0, 0, 1)' });

    mat.transparent = true;
    mat.opacity = 0.0;
    mat.side = THREE.DoubleSide;
    //planeGeom.rotateX(Math.PI);

    let planeMesh;

    if (!mesh) planeMesh = new THREE.Mesh(planeGeom, mat);
    else planeMesh = mesh;

    add(planeMesh);
    //------------------------------------------------------------------------

    function handleClick(e) {
        if (!areChoosing) return;

        //areChoosing = false;

        endPt = getMouseCoords(e, planeMesh);

        clickCB(endPt);
    }

    canvas.addEventListener('pointerdown', handleClick);

    function dispose() {
        canvas.removeEventListener('pointerdown', handleClick);

        if (planeGeom) planeGeom.dispose();

        if (mat) mat.dispose();

        if (planeMesh && threeCBs) remove(planeMesh);
    }

    function reset() {}

    function getPt() {
        return endPt;
    }

    function pause() {
        areChoosing = false;
    }

    function play() {
        areChoosing = true;
    }

    return { dispose, reset, getPt, pause, play };
}
