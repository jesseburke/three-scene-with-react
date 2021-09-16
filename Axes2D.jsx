import React, { memo, useEffect } from 'react';

import { useAtom, atom } from 'jotai';

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const defaultLabelAtom = atom({ x: 'x', y: 'y' });

const defaultAxesDataAtom = atom({
    radius: 0.01,
    color: '#0A2C3C',
    showLabels: true,
    tickDistance: 1,
    tickRadiusMultiple: 10,
    tickLabelDistance: 2
});

export default memo(function Axes2D({
    threeCBs,
    boundsAtom,
    axesDataAtom = defaultAxesDataAtom,
    show = true,
    tickLabelDistanceFromEnds = 1,
    labelAtom = defaultLabelAtom
}) {
    const {
        radius,
        color,
        showLabels,
        labelStyle,
        tickDistance,
        tickRadiusMultiple,
        tickLabelDistance,
        tickLabelStyle
    } = useAtom(axesDataAtom)[0];

    const { xMin, xMax, yMin, yMax } = useAtom(boundsAtom)[0];

    const { x: xLabel, y: yLabel } = useAtom(labelAtom)[0];

    useEffect(() => {
        if (!threeCBs) return;

        // this will hold axes and all adornments
        const axesGroup = new THREE.Group();

        if (show) {
            // make two axes first

            const radiusTop = radius;
            const radiusBottom = radius;
            let radialSegments = 8;
            let heightSegments = 40;
            let openEnded = true;

            const xa = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                xMax - xMin,
                radialSegments,
                heightSegments,
                openEnded
            );
            xa.rotateZ(Math.PI / 2);
            xa.translate((xMax + xMin) / 2, 0, 0);

            const ya = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                yMax - yMin,
                radialSegments,
                heightSegments,
                openEnded
            );
            ya.translate(0, (yMax + yMin) / 2, 0);

            const axesMaterial = new THREE.MeshBasicMaterial({ color: color });
            //axesMaterial.transparent = true;
            //axesMaterial.opacity = .5;

            axesGroup.add(new THREE.Mesh(xa, axesMaterial));
            axesGroup.add(new THREE.Mesh(ya, axesMaterial));

            // make ticks now

            let tickGeomArray = [];

            for (let i = xMin; i <= xMax; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadiusMultiple).translate(i, 0, 0));
            }

            for (let i = yMin; i <= yMax; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadiusMultiple).translate(0, i, 0));
            }

            const tickGeom = BufferGeometryUtils.mergeBufferGeometries(tickGeomArray);
            const tickMaterial = new THREE.MeshBasicMaterial({ color: color });
            axesGroup.add(new THREE.Mesh(tickGeom, tickMaterial));

            threeCBs.add(axesGroup);
        }

        return () => {
            if (axesGroup) {
                threeCBs.remove(axesGroup);
            }
        };
    }, [threeCBs, show, xMin, xMax, yMin, yMax, radius, tickRadiusMultiple, color]);

    useEffect(() => {
        if (!threeCBs || !show) return;

        let xLabelID;
        let yLabelID;

        if (showLabels) {
            xLabelID = threeCBs.addLabel({
                pos: [xMax - 1, 0, 0],
                text: xLabel,
                style: labelStyle
            });

            yLabelID = threeCBs.addLabel({ pos: [0, yMax, 0], text: yLabel, style: labelStyle });

            threeCBs.drawLabels();
            threeCBs.render();
        }

        return () => {
            if (xLabelID) {
                threeCBs.removeLabel(xLabelID);
                xLabelID = null;
            }

            if (yLabelID) {
                threeCBs.removeLabel(yLabelID);
                yLabelID = null;
            }

            threeCBs.drawLabels();
        };
    }, [threeCBs, show, showLabels, xMax, yMax, labelStyle, xLabel, yLabel]);

    // tick labeling
    useEffect(() => {
        if (!threeCBs) return;

        // following means no tick labels
        if (tickLabelDistance === 0) return;

        const labelArr = [];

        //x labels
        const noTickXLabels = (xMax - xMin - 2 * tickLabelDistanceFromEnds) / tickLabelDistance;

        for (let i = 0; i <= noTickXLabels; i++) {
            labelArr.push(
                threeCBs.addLabel({
                    pos: [xMin + i * tickLabelDistance + tickLabelDistanceFromEnds, 0, 0],
                    text: xMin + i * tickLabelDistance + tickLabelDistanceFromEnds,
                    style: tickLabelStyle
                })
            );
        }

        //y labels
        const noTickYLabels = (yMax - yMin - 2 * tickLabelDistanceFromEnds) / tickLabelDistance;

        for (let i = 0; i <= noTickYLabels; i++) {
            labelArr.push(
                threeCBs.addLabel({
                    pos: [0, yMin + i * tickLabelDistance + tickLabelDistanceFromEnds, 0],
                    text: yMin + i * tickLabelDistance + tickLabelDistanceFromEnds,
                    style: tickLabelStyle
                })
            );
        }

        threeCBs.drawLabels();

        return () => {
            if (threeCBs || labelArr)
                labelArr.forEach((l) => {
                    threeCBs.removeLabel(l);
                });

            threeCBs.drawLabels();
            threeCBs.render();
        };
    }, [
        threeCBs,
        tickLabelDistance,
        tickLabelDistanceFromEnds,
        tickLabelStyle,
        xMin,
        xMax,
        yMin,
        yMax
    ]);

    return null;
});
function RawTickGeometry(tickRadius) {
    const domeRadius = tickRadius;
    const domeWidthSubdivisions = 12;
    const domeHeightSubdivisions = 12;
    const domePhiStart = 0;
    const domePhiEnd = Math.PI * 2;
    const domeThetaStart = 0;
    const domeThetaEnd = Math.PI;

    return new THREE.SphereBufferGeometry(
        domeRadius,
        domeWidthSubdivisions,
        domeHeightSubdivisions,
        domePhiStart,
        domePhiEnd,
        domeThetaStart,
        domeThetaEnd
    );
}
