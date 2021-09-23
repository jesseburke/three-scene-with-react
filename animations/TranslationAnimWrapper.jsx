import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import gsapTranslate from './gsapTranslate.jsx';

const defaultTranslationDuration = 0.4;

export default function TranslateAnimWrapper({
    threeCBs,
    translationAtom,
    animatingAtom,
    translationDuration = defaultTranslationDuration,
    children
}) {
    const meshRef = useRef(null);
    const setAnimating = useAtom(animatingAtom)[1];

    const [translation, setTranslation] = useAtom(translationAtom);

    useEffect(() => {
        if (!threeCBs || !meshRef.current) {
            return;
        }

        gsapTranslate({
            mesh: meshRef.current.mainMesh,
            delay: 0,
            duration: translationDuration,
            toVec: new THREE.Vector3(translation.x, translation.y, 0),
            //translateVec: new THREE.Vector3(newVal,yTotalTranslation,0),
            renderFunc: threeCBs.render,
            clampToEnd: false,
            onStart: () => setAnimating(true),
            onComplete: () => setAnimating(false)
        });
    }, [threeCBs, translation]);

    return (
        <React.Fragment>
            {React.Children.map(children, (el) =>
                React.cloneElement(el, { threeCBs, ref: meshRef })
            )}
        </React.Fragment>
    );
}
