import React, {
    useState,
    useRef,
    useEffect,
    Fragment,
    FunctionComponent,
    Children,
    cloneElement
} from 'react';
import * as THREE from 'three';
import { atom, useAtom } from 'jotai';

import ThreeSceneFactory from './ThreeSceneFactory';
import { ArrayPoint3 } from '../../src/my-types';

import './styles.css';

//------------------------------------------------------------------------
//

export interface ThreeSceneProps {
    controlsCB: (pt: ArrayPoint3) => null;
    fixedCameraData: null;
    controlsData: null;
    clearColor: null;
    aspectRatio: null;
    photoButton: boolean;
    photoButtonClassStr: string;
    children: null;
}

export const ThreeCBsContext = React.createContext({});

const ThreeScene: FunctionComponent = (
    {
        controlsCB = null,
        fixedCameraData,
        controlsData = {
            mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
            touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.PAN, THREE: THREE.MOUSE.DOLLY },
            enableRotate: true,
            enableKeys: true,
            enabled: false,
            keyPanSpeed: 50
        },
        clearColor = '#f0f0f0',
        aspectRatio = 1,
        photoButton = false,
        photoBtnClassStr = 'absolute left-6 bottom-6 p-1 border rounded-sm border-solid cursor-pointer text-xl',
        cameraDebug = false,
        halfWidth = false,
        children
    },
    ref
) => {
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    //------------------------------------------------------------------------
    //
    // make sure that canvas height and width are same as the html element

    const [initialHeightPxs, setInitialHeightPxs] = useState(0);
    const [initialWidthPxs, setInitialWidthPxs] = useState(0);

    useEffect(() => {
        if (threeCanvasRef && threeCanvasRef.current) {
            const height = threeCanvasRef.current.offsetHeight;
            const width = threeCanvasRef.current.offsetWidth;
            const pixelRatio = window.devicePixelRatio;

            if (height === 0 || width === 0) {
                requestAnimationFrame(() => {
                    setInitialHeightPxs(threeCanvasRef.current.offsetHeight);
                    setInitialWidthPxs(threeCanvasRef.current.offsetWidth);
                });
            } else {
                setInitialHeightPxs(height * pixelRatio);
                setInitialWidthPxs(width * pixelRatio);
            }
        }
    }, [threeCanvasRef]);

    //------------------------------------------------------------------------
    //
    // effect to put threeScene in state

    const debugDiv1Ref = useRef<HTMLDivElement>(null);
    const debugDiv2Ref = useRef<HTMLDivElement>(null);

    const [threeSceneCBs, setThreeSceneCBs] = useState(null);

    useEffect(() => {
        if (!threeCanvasRef.current) {
            setThreeSceneCBs(null);
            return;
        }

        if (initialHeightPxs === 0 || initialWidthPxs === 0) {
            setThreeSceneCBs(null);
            return;
        }

        if (cameraDebug) {
            setThreeSceneCBs(
                ThreeSceneFactory({
                    drawCanvas: threeCanvasRef.current,
                    labelContainerDiv: labelContainerRef.current,
                    fixedCameraData,
                    controlsData,
                    clearColor,
                    cameraDebug,
                    debugDiv1: debugDiv1Ref.current,
                    debugDiv2: debugDiv2Ref.current
                })
            );
        } else {
            setThreeSceneCBs(
                ThreeSceneFactory({
                    drawCanvas: threeCanvasRef.current,
                    labelContainerDiv: labelContainerRef.current,
                    fixedCameraData,
                    controlsData,
                    clearColor
                })
            );
        }
    }, [
        threeCanvasRef,
        labelContainerRef,
        controlsData,
        clearColor,
        cameraDebug,
        debugDiv1Ref,
        debugDiv2Ref,
        initialHeightPxs,
        initialWidthPxs
    ]);

    React.useImperativeHandle(
        ref,
        () => ({
            add: (mesh) => {
                //console.log('threeCBs.add called with mesh = ', mesh);
                threeSceneCBs.add(mesh);
                threeSceneCBs.render();
            },

            remove: (mesh) => {
                threeSceneCBs.remove(mesh);
                threeSceneCBs.render();
            },

            render: () => threeSceneCBs.render(),

            getCamera: () => threeSceneCBs.getCamera(),

            // pos and up are three entry arrays, each representing a point
            setCameraPosition: (pos, up) => {
                //console.log('threeCBs.setcameraposition called with pos = ', pos);
                threeSceneCBs.setCameraPosition(pos, up);
            },

            // pos is a three entry array representing a point
            setCameraLookAt: (pos) => {
                threeSceneCBs.setCameraLookAt(pos);
            },

            getCanvas: () => threeCanvasRef.current,

            getMouseCoords: (e, mesh) => threeSceneCBs.getMouseCoords(e, mesh),

            screenToWorldCoords: (screenX, screenY) =>
                threeSceneCBs.screenToWorldCoords(screenX, screenY),

            resetControls: () => threeSceneCBs.resetControls(),

            changeControls: (newControlsData) => threeSceneCBs.changeControls(newControlsData),

            getControlsTarget: () => threeSceneCBs.getControlsTarget(),

            downloadGLTF: (fileName) => threeSceneCBs.downloadGLTF(fileName),

            // labelObj = {pos, text, style}
            // pos = array of three numbers
            // test = string
            // style = axesLabelStyle
            //
            // returns id to remove later
            addLabel: (labelObj) => threeSceneCBs.addLabel(labelObj),

            removeLabel: (id) => threeSceneCBs.removeLabel(id),

            drawLabels: () => threeSceneCBs.drawLabels(),

            // dragendCB is called with the object that is being dragged as argument
            addDragControls: ({ meshArray, dragCB, dragendCB }) =>
                threeSceneCBs.addDragControls({ meshArray, dragCB, dragendCB })
        }),
        [threeSceneCBs]
    );

    //----------------------------------------
    //
    // setup resize observer

    useEffect(() => {
        if (!threeSceneCBs || !threeSceneCBs.handleResize || !threeCanvasRef.current) return;

        const resizeObserver = new ResizeObserver(threeSceneCBs.handleResize);
        resizeObserver.observe(threeCanvasRef.current, { box: 'content-box' });

        return () => {
            if (resizeObserver && threeCanvasRef.current)
                resizeObserver.unobserve(threeCanvasRef.current);
        };
    }, [threeSceneCBs, threeCanvasRef]);

    //----------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeSceneCBs) return;

        threeSceneCBs.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeSceneCBs]);

    //----------------------------------------
    //
    // set width class string

    const widthStr = halfWidth ? ' w-1/2' : ' w-full';

    //----------------------------------------
    //
    // component used for camera debugging (showing two screens, with
    // the left one the usual scene and the right one a second camera
    // and camera help on the first camera)

    const cameraDebugComp = useState(
        <div className='absolute top-0 left-0 h-full w-full outline-none flex'>
            <div
                className='h-full w-full'
                tabIndex='1'
                ref={(elt) => (debugDiv1Ref.current = elt)}
            ></div>
            <div
                className='h-full w-full'
                tabIndex='2'
                ref={(elt) => (debugDiv2Ref.current = elt)}
            ></div>
        </div>
    )[0];

    return (
        <ThreeCBsContext.Provider value={threeSceneCBs}>
            <div className={'absolute h-full bg-gray' + widthStr}>
                <canvas
                    className='h-full w-full block outline-none'
                    ref={(elt) => (threeCanvasRef.current = elt)}
                    width={initialWidthPxs}
                    height={initialHeightPxs}
                />
                {cameraDebug ? cameraDebugComp : null}
                <Fragment>
                    {Children.map(children, (el) => cloneElement(el, { threeCBs: threeSceneCBs }))}
                </Fragment>
                <div ref={(elt) => (labelContainerRef.current = elt)} />
                {photoButton ? (
                    <div onClick={threeSceneCBs ? threeSceneCBs.downloadPicture : null}>
                        <button className={photoBtnClassStr}>Photo</button>
                    </div>
                ) : null}
            </div>
        </ThreeCBsContext.Provider>
    );
};

export default React.memo(React.forwardRef(ThreeScene));

// should get rid of this as soon as possible
export function useThreeCBs(threeRef) {
    const [threeCBs, setThreeCBs] = useState(null);

    useEffect(() => {
        if (!threeRef.current) return;

        const getCanvas = threeRef.current.getCanvas;

        const getCamera = threeRef.current.getCamera;

        const setCameraPosition = threeRef.current.setCameraPosition;

        const setCameraLookAt = threeRef.current.setCameraLookAt;

        const getMouseCoords = threeRef.current.getMouseCoords;

        // calculates where ray into the screen at (screenX, screenY) intersects mesh
        const screenToWorldCoords = threeRef.current.screenToWorldCoords;

        const add = threeRef.current.add;

        const remove = threeRef.current.remove;

        const render = () => threeRef.current.render();

        const resetControls = threeRef.current.resetControls;

        const changeControls = threeRef.current.changeControls;

        const getControlsTarget = threeRef.current.getControlsTarget;

        const addLabel = threeRef.current.addLabel;

        const removeLabel = threeRef.current.removeLabel;

        const drawLabels = threeRef.current.drawLabels;

        const addDragControls = threeRef.current.addDragControls;

        setThreeCBs({
            getCanvas,
            getCamera,
            setCameraPosition,
            setCameraLookAt,
            getMouseCoords,
            add,
            remove,
            render,
            resetControls,
            changeControls,
            getControlsTarget,
            screenToWorldCoords,
            addLabel,
            removeLabel,
            drawLabels,
            addDragControls
        });
    }, [threeRef]);

    return threeCBs;
}
