import React from 'react';
import ReactDOM from 'react-dom';

import { Provider as JotaiProvider } from 'jotai';

import { Helmet } from 'react-helmet';

import App from './App';
const title = '3d function grapher';

function main() {
    const element = document.createElement('div');

    // disables scrolling from touch actions
    element.style.touchAction = 'none';
    ReactDOM.render(
        <>
            <Helmet>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
                <title>{title}</title>
            </Helmet>
            <JotaiProvider>
                <App />
            </JotaiProvider>
        </>,
        element
    );

    return element;
}

document.body.appendChild(main());
document.addEventListener(
    'wheel',
    function (e) {
        e.preventDefault();
        //console.log('wheel event fired on document');
    },
    { passive: false, capture: false }
);
