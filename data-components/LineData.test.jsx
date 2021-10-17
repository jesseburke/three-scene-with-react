import React from 'react';

import { atom, useAtom } from 'jotai';

import { render } from '@testing-library/react';
import { renderHook, act, cleanup } from '@testing-library/react-hooks';

import * as THREE from 'three';

import LineDataComp, { Line2dFactory } from './LineData';

test('intercepts', () => {
    const testPt1 = new THREE.Vector3(1, 1, 0);

    // with only 1 arg, gives line through origin
    const testLine = Line2dFactory(testPt1);

    expect(testLine.xIntercept()).toBe(0);
    expect(testLine.xIntercept(3)).toBe(3);

    expect(testLine.yIntercept()).toBe(0);
    expect(testLine.yIntercept(-2)).toBe(-2);

    const testPt2 = new THREE.Vector3(1, 2, 0);
    const vertLine = Line2dFactory(testPt1, testPt2);
    expect(vertLine.xIntercept()).toBe(1);
    expect(vertLine.xIntercept(-10)).toBe(1);
    expect(vertLine.yIntercept(1)).toBe(0);
    expect(vertLine.yIntercept(0)).toBe(null);

    const testPt3 = new THREE.Vector3(0, 1, 0);
    const horizLine = Line2dFactory(testPt1, testPt3);
    expect(horizLine.yIntercept()).toBe(1);
    expect(horizLine.yIntercept(-10)).toBe(1);
    expect(horizLine.xIntercept(1)).toBe(0);
    expect(horizLine.xIntercept(0)).toBe(null);
});
