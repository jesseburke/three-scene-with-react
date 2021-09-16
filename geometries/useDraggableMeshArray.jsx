import { useEffect } from 'react';

export default function useDraggableMeshArray({ threeCBs, meshArray, dragendCB, dragCB }) {
    useEffect(() => {
        if (!threeCBs || !meshArray) return;

        const nonNullMeshArray = meshArray.filter((m) => m);

        if (nonNullMeshArray.length === 0) return;

        const controlsDisposeFunc = threeCBs.addDragControls({ meshArray, dragCB, dragendCB });
        return () => {
            if (controlsDisposeFunc) controlsDisposeFunc();
        };
    }, [threeCBs, meshArray, dragendCB, dragCB]);
}
