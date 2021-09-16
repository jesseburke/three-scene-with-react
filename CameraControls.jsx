import React, { useEffect, useRef } from 'react';
import { useAtom, atom } from 'jotai';

export default function CameraControls({ cameraDataAtom, threeCBs }) {
    const [cameraData, setCameraData] = useAtom(cameraDataAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const target = cameraData.target;
        //console.log('cameraData.center = ', center);

        threeCBs.setControlsTarget(target);
    }, [threeCBs, cameraData.target]);

    useEffect(() => {
        if (!threeCBs) return;

        const zoom = cameraData.zoom;
        //console.log('cameraData.zoom = ', zoom);

        threeCBs.setCameraZoom(zoom);
    }, [threeCBs, cameraData.zoom]);

    useEffect(() => {
        if (!threeCBs) return;

        const position = cameraData.position;
        //console.log('cameraData.position = ', position);

        threeCBs.setCameraPosition(position);
    }, [threeCBs, cameraData.position]);

    useEffect(() => {
        if (!threeCBs) return;

        threeCBs.controlsPubSub.subscribe((newData) => {
            //console.log('subscribe funtion called with newData = ', newData);
            setCameraData(newData);
        });
    }, [threeCBs]);

    return null;
}
