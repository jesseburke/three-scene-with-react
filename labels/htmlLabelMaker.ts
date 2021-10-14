import { css } from 'emotion';

import { OrthoCamera, LabelStyle, LabelProps, ArrayPoint3 } from '../../src/my-types';

// what are the props for initCoordFunc?
// why is it init?
// threeToHtmlCoordFunc is an example of initCoordFunc argument

export default function LabelMaker(labelContainerDiv, initCoordFunc, width, height) {
    //----------------------------------------
    //
    // set up labels

    // should threeLabelData be renamed?
    // maybe, labelArray?

    // labelData is {pos, text, style, anchor}

    let labelStore = {};
    let labelCounter = 0;

    // what is bind doing?
    let coordFunc = initCoordFunc.bind({});

    function addLabel({
        pos,
        text,
        style = {
            backgroundColor: 'white',
            border: 0,
            color: 'black',
            padding: 0,
            margin: 0,
            fontSize: '1em'
        },
        anchor = 'ul'
    }: LabelProps) {
        labelStore[labelCounter] = { pos, text, style, anchor };
        labelCounter++;
        return labelCounter;
    }

    // following two should also remove the divs
    function removeLabel(id) {
        if (labelStore[id]) {
            labelContainerDiv.removeChild(labelStore[id].div);
            delete labelStore[id];
        }
    }

    function removeAllLabels() {
        Object.keys(labelStore).forEach((key) => {
            if (labelStore[key] && labelStore[key].div)
                labelContainerDiv.removeChild(labelStore[key].div);
        });

        labelStore = {};
    }

    function drawLabels() {
        if (!labelContainerDiv) {
            console.log('tried to draw labels in useThree with null labelContainerRef');
            return;
        }

        // remove all previous labels
        while (labelContainerDiv.firstChild) {
            labelContainerDiv.removeChild(labelContainerDiv.firstChild);
        }

        const htmlLabelStore = {};

        // converts coordinates of labels to html coordinates;
        // if they are in the window, they are added to htmlLabelStore
        let x, y;

        Object.keys(labelStore).forEach((key) => {
            if (!labelStore[key] || !labelStore[key]!.pos) {
                return;
            }

            [x, y] = coordFunc(labelStore[key].pos);

            if (0 < x && x < width && 0 < y && y < height) {
                // make copy of labelStore[key]
                htmlLabelStore[key] = { ...labelStore[key] };
                // and change position to html
                htmlLabelStore[key].pos = [x, y];
            }
        });

        let workingDiv;
        let labelClass;
        let curStyleString;
        let anchor;

        Object.keys(htmlLabelStore).forEach((key) => {
            workingDiv = document.createElement('div');
            workingDiv.textContent = htmlLabelStore[key].text;

            curStyleString = htmlLabelStore[key].style;
            anchor = htmlLabelStore[key].anchor;

            switch (anchor) {
                case 'ul':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        left: ${htmlLabelStore[key].pos[0]}px;
                        top: ${htmlLabelStore[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                        pointer-events: none;
                    `;
                    break;

                case 'ur':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width - htmlLabelStore[key].pos[0]}px;
                        top: ${htmlLabelStore[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'mr':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width - htmlLabelStore[key].pos[0]}px;
                        top: ${htmlLabelStore[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'lr':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width - htmlLabelStore[key].pos[0]}px;
                        bottom: ${height - htmlLabelStore[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'll':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        left: ${htmlLabelStore[key].pos[0]}px;
                        bottom: ${htmlLabelStore[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;
            }

            workingDiv.classList.add(labelClass);

            labelContainerDiv.appendChild(workingDiv);
            htmlLabelStore[key].div = workingDiv;
        });
    }

    function changeCoordFunc(newFunc) {
        coordFunc = newFunc.bind({});
        drawLabels();
    }

    return { addLabel, removeLabel, removeAllLabels, drawLabels, changeCoordFunc };
}
