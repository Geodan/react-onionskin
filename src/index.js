import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Camera from './Camera';
import registerServiceWorker from './registerServiceWorker';
import overlay from './overlay.jpg';

function photoData(photo)
{
    console.log(photo.length);
}

ReactDOM.render(<Camera channel="0" photo={photoData} overlayURL={overlay}/>, document.getElementById('root'));
registerServiceWorker();
