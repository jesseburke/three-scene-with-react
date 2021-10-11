import React, { memo, useEffect } from 'react';

import { useAtom, atom } from 'jotai';

import * as THREE from 'three';
import { mergeBufferGeometries } from '../geometries/MergeGeometries';

const defaultLabelAtom = atom({ x: 'x', y: 'y', z: 'z' });

const defaultAxesDataAtom = atom({
    radius: 0.01,
    color: '#0A2C3C',
    showLabels: true,
    tickDistance: 1,
    tickRadiusMultiple: 10,
    tickLabelDistance: 2
});

export default memo(function Axes3D({
    threeCBs,
    boundsAtom,
    axesDataAtom = defaultAxesDataAtom,
    tickLabelDistanceFromEnds = 1,
    show = true,
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

    const { xMin, xMax, yMin, yMax, zMin, zMax } = useAtom(boundsAtom)[0];

    const { x: xLabel, y: yLabel, z: zLabel } = useAtom(labelAtom)[0];

    useEffect(() => {
        if (!threeCBs) return;

        // this will hold axes and all adornments
        const axesGroup = new THREE.Group();

        if (show) {
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

            const za = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                zMax - zMin,
                radialSegments,
                heightSegments,
                openEnded
            );
            //za.translate(0, 0, (zMax + zMin) / 2);
            za.rotateX(Math.PI / 2);

            const axesMaterial = new THREE.MeshBasicMaterial({ color: color });
            axesGroup.add(new THREE.Mesh(xa, axesMaterial));
            axesGroup.add(new THREE.Mesh(ya, axesMaterial));
            axesGroup.add(new THREE.Mesh(za, axesMaterial));

            // make ticks now
            let tickGeomArray = [];

            for (let i = xMin; i <= xMax; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadiusMultiple).translate(i, 0, 0));
            }

            for (let i = yMin; i <= yMax; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadiusMultiple).translate(0, i, 0));
            }

            for (let i = zMin; i <= zMax; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadiusMultiple).translate(0, 0, i));
            }

            // am not using tickColor for now
            const tickGeom = mergeBufferGeometries(tickGeomArray);
            const tickMaterial = new THREE.MeshBasicMaterial({ color: color });
            axesGroup.add(new THREE.Mesh(tickGeom, tickMaterial));

            threeCBs.add(axesGroup);
        }

        return () => {
            if (axesGroup) {
                threeCBs.remove(axesGroup);
            }
        };
    }, [threeCBs, show, xMax, xMin, yMax, yMin, zMax, zMin, radius, tickRadiusMultiple, color]);

    useEffect(() => {
        if (!threeCBs || !show || !showLabels) return;

        let xLabelID;
        let yLabelID;
        let zLabelID;

        if (showLabels) {
            xLabelID = threeCBs.addLabel({
                pos: [xMax, 0, 0],
                text: xLabel,
                //anchor: 'lr',
                style: labelStyle
            });

            yLabelID = threeCBs.addLabel({
                pos: [0, yMax, 0],
                text: yLabel,
                //anchor: 'lr',
                style: labelStyle
            });

            zLabelID = threeCBs.addLabel({
                pos: [0, 0, zMax],
                text: zLabel,
                //anchor: 'lr',
                style: labelStyle
            });

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

            if (zLabelID) {
                threeCBs.removeLabel(zLabelID);
                zLabelID = null;
            }

            threeCBs.drawLabels();
        };
    }, [threeCBs, show, showLabels, xMax, yMax, zMax, labelStyle, xLabel, yLabel, zLabel]);

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

        //z labels
        const noTickZLabels = (zMax - zMin - 2 * tickLabelDistanceFromEnds) / tickLabelDistance;

        for (let i = 0; i <= noTickZLabels; i++) {
            labelArr.push(
                threeCBs.addLabel({
                    pos: [0, 0, zMin + i * tickLabelDistance + tickLabelDistanceFromEnds],
                    text: zMin + i * tickLabelDistance + tickLabelDistanceFromEnds,
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
        yMax,
        zMin,
        zMax
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
