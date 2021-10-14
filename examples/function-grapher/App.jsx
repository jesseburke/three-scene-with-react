import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider, atom, useAtom } from 'jotai';

import * as THREE from 'three';

import {
    ThreeSceneComp,
    Grid,
    Axes3D,
    FunctionGraph3D,
    CameraControls
} from '@jesseburke/three-scene-with-react';

import { Input } from '@jesseburke/components';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 20,
    show: true,
    tickLabelDistance: 0,
    color: '#0A2C3C'
};

const initBounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10, zMin: -10, zMax: 10 };

const initCameraData = {
    target: [0, 0, 0],
    position: [9, 24, 16]
};

const funcColor = '#E53935';

const funcAtom = atom((_) => {
    const func = (x, y) => Math.sin(x + y) - Math.cos(x - y);
    return { func };
});

const boundsAtom = atom(initBounds);

const cameraDataAtom = atom(initCameraData);

const axesDataAtom = atom(initAxesData);

const showSecCameraAtom = atom(false);

//------------------------------------------------------------------------

export default function App() {
    const showSecCamera = useAtom(showSecCameraAtom)[0];

    return (
        <div className='full-screen-base'>
            <main className='flex-grow relative p-0'>
                <ThreeSceneComp cameraDebug={showSecCamera}>
                    <Axes3D boundsAtom={boundsAtom} axesDataAtom={axesDataAtom} />
                    <Grid boundsAtom={boundsAtom} />
                    <FunctionGraph3D
                        funcAtom={funcAtom}
                        boundsAtom={boundsAtom}
                        color={funcColor}
                    />
                    <CameraControls cameraDataAtom={cameraDataAtom} />
                </ThreeSceneComp>
                <CameraInputComp />
            </main>
        </div>
    );
}

function CameraInputComp({}) {
    const [cameraData, setData] = useAtom(cameraDataAtom);

    const [showSecCamera, setShowSecCamera] = useAtom(showSecCameraAtom);

    let { target, position } = cameraData;
    target = target.map((x) => round(x));

    const targetXCB = useCallback(
        (inputStr) =>
            setData((oldData) => ({
                ...oldData,
                target: [Number(inputStr), oldData.target[1], oldData.target[2]]
            })),
        [setData]
    );

    const targetYCB = useCallback(
        (inputStr) =>
            setData((oldData) => ({
                ...oldData,
                target: [oldData.target[0], Number(inputStr), oldData.target[2]]
            })),
        [setData]
    );

    const targetZCB = useCallback(
        (inputStr) =>
            setData((oldData) => ({
                ...oldData,
                target: [oldData.target[0], oldData.target[1], Number(inputStr)]
            })),
        [setData]
    );

    const toggleSecCameraCB = useCallback(
        () =>
            setShowSecCamera((oldVal) => {
                return !oldVal;
            }),
        [setShowSecCamera]
    );

    return (
        <div
            className='flex flex-col justify-center content-center
		items-center absolute left-10 top-10 border-black border-2 rounded-md py-4 px-8'
        >
            <div className='py-2'>
                <span className='text-center'>Camera target: </span>
                <Input initValue={target[0]} size={4} onC={targetXCB} />
                <span> , </span>
                <Input initValue={target[1]} size={4} onC={targetYCB} />
                <span> , </span>
                <Input initValue={target[2]} size={4} onC={targetZCB} />
            </div>
            <div className='py-2 w-full flex justify-apart relative'>
                <span className='text-center'>Camera position: </span>
                <span className='flex justify-apart'>
                    <span className='px-1'>{round(position[0])},</span>
                    <span className='px-1'>{round(position[1])},</span>
                    <span className='px-1'>{round(position[2])}</span>
                </span>
            </div>
            <div className='flex items-baseline'>
                <input
                    type='checkbox'
                    id='showSC'
                    name='showSC'
                    value='show solution curve'
                    checked={showSecCamera}
                    onChange={toggleSecCameraCB}
                    className='px-2'
                />
                <label htmlFor='showSC' className='px-2'>
                    Show second camera and window.
                </label>
            </div>
        </div>
    );
}

export function round(x, n = 2) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}
