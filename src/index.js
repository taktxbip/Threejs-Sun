'strict';

import RunThreeJs from './js/modules/class-runthreejs';

import * as THREE from 'three';

import './scss/main.scss';
import './js/assets';


(function () {
    window.addEventListener('DOMContentLoaded', (event) => {

        new RunThreeJs({
            dom: document.getElementById('container')
        });

    });
})();
