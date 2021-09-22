import { css } from 'emotion';

import { OrthoCamera, LabelStyle, LabelProps, ArrayPoint3 } from '../../src/my-types';

export default function LabelMaker(labelContainerDiv, initCoordFunc, width, height) {
    //----------------------------------------
    //
    // set up labels

    let threeLabelData: (LabelProps | null)[] = [];
    let labelCounter = 0;

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
        threeLabelData[labelCounter] = { pos, text, style, anchor };
        labelCounter++;
        return labelCounter;
    }

    function removeLabel(id: number) {
        threeLabelData[id - 1] = null;
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

        const htmlLabelData: (LabelProps | null)[] = [];

        // following converts all coordinates of labels to html coordinates;
        // if they are in the window, they are added to htmlLabelData
        let x, y;

        for (let key in threeLabelData) {
            if (!threeLabelData[key] || !threeLabelData[key]!.pos) {
                continue;
            }

            [x, y] = coordFunc(threeLabelData[key].pos);

            if (0 < x && x < width && 0 < y && y < height) {
                htmlLabelData[key] = { ...threeLabelData[key] };
                htmlLabelData[key].pos = [x, y];
            }
        }

        let workingDiv;
        let labelClass;
        let curStyleString;
        let anchor;

        for (let key in htmlLabelData) {
            workingDiv = document.createElement('div');
            workingDiv.textContent = htmlLabelData[key].text;

            curStyleString = htmlLabelData[key].style;
            anchor = htmlLabelData[key].anchor;

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
                        left: ${htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        bottom: ${height - htmlLabelData[key].pos[1]}px;
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
                        left: ${htmlLabelData[key].pos[0]}px;
                        bottom: ${htmlLabelData[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;
            }

            workingDiv.classList.add(labelClass);

            labelContainerDiv.appendChild(workingDiv);
        }
    }

    function changeCoordFunc(newFunc) {
        coordFunc = newFunc.bind({});
        drawLabels();
    }

    return { addLabel, removeLabel, drawLabels, changeCoordFunc };
}
