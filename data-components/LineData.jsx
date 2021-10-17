import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

import { atom, useAtom } from 'jotai';

import { Input } from '@jesseburke/components';

import Line2dFactory from './Line2DFactory.jsx';

// pt1 and pt2 are Three.Vector3's, with z component assumed to be 0
//
// the line has direction: from pt2 to pt1
//

const defaultPt1 = new THREE.Vector3(1, 1, 0);
const defaultPt2 = new THREE.Vector3(0, 0, 0);
const defaultPt1Atom = atom(defaultPt1);
const defaultPt2Atom = atom(defaultPt2);

export default function LineData({ pt1Atom = defaultPt1Atom, pt2Atom = defaultPt2Atom } = {}) {
    //const pt1Atom = atom(initPt1);
    //const pt2Atom = atom(initPt2);

    const lineDataAtom = atom((get) => {
        const pt1 = get(pt1Atom);
        const pt2 = get(pt2Atom);

        if (!pt1 || !pt2) return null;

        return Line2dFactory(pt1, pt2);
    });

    const setEqAtom = atom(null, (_, set, { x, y, c }) => {
        if (y === 0) {
            if (x === 0) {
                console.log('tried to set eqAtom to a null line');
                return;
            }

            set(pt1Atom, new THREE.Vector3(-c / x, 0, 0));
            set(pt2Atom, new THREE.Vector3(-c / x, 1, 0));
            return;
        }

        if (x === 0) {
            set(pt1Atom, new THREE.Vector3(0, c / y, 0));
            set(pt2Atom, new THREE.Vector3(1, c / x, 1));
            return;
        }
        if (c === 0) {
            set(pt1Atom, new THREE.Vector3(1, x / y, 0));
            set(pt2Atom, new THREE.Vector3(0, 0, 0));
            return;
        }
        set(pt1Atom, new THREE.Vector3(0, c / y, 0));
        set(pt2Atom, new THREE.Vector3(-c / x, 0, 0));
        return;
    });

    function component({ originLineP = false }) {
        const eq = useAtom(lineDataAtom)[0].getEquation();
        const setEq = useAtom(setEqAtom)[1];

        const { x, y, c } = eq;

        const xCB = useCallback(
            (xValStr) => {
                const xVal = Number(xValStr);

                setEq({ y, c, x: xVal });
            },
            [setEq, y, c]
        );

        const yCB = useCallback(
            (yValStr) => {
                const yVal = Number(yValStr);

                setEq({ x, c, y: yVal });
            },
            [setEq, x, c]
        );

        const cCB = useCallback(
            (cValStr) => {
                const cVal = Number(cValStr);

                setEq({ x, y, c: cVal });
            },
            [setEq, x, y]
        );

        return (
            <div className='absolute top-16 left-12 border-2 p-4 select-none'>
                <div className='p-4 flex justify-around items-baseline'>
                    <span className='m-2'>Reflecting about</span>
                    <Input size={4} onC={yCB} initValue={y} />
                    <span className='m-2'> y = </span>
                    <Input size={4} onC={xCB} initValue={x} />
                    <span className='m-2'>x</span>
                    {originLineP ? null : (
                        <span>
                            {' '}
                            +
                            <Input size={4} onC={cCB} initValue={c} />
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return { pt1Atom, pt2Atom, lineDataAtom, setEqAtom, component };
}
