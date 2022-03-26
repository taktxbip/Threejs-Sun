import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import imagesLoaded from 'imagesloaded';
import ASScroll from '@ashthornton/asscroll';

// Shaders
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

import fragmentSun from '../shaders/fragment-sun.glsl';
import vertexSun from '../shaders/vertex-sun.glsl';

import simplexNoise from '../shaders/simplex-noise.glsl';
import fresnel from '../shaders/fresnel.glsl';

class RunThreeJs {
    constructor(options) {
        this.time = 0;
        this.dom = options.dom;

        this.width = this.dom.offsetWidth;
        this.height = this.dom.offsetHeight;
        this.segments = 200;

        // setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 100, 2000);
        this.camera.position.z = 600;
        // this.updateCameraFOV();

        // renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);

        this.dom.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.addTexture();
        this.addGlow();
        this.addObjects();
        this.resize();
        this.events();
        this.render();
    }

    addGlow() {
        this.materialSun = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uPerlin: { value: null }
            },
            side: THREE.DoubleSide,
            vertexShader: vertexSun,
            fragmentShader: fresnel + ' ' + fragmentSun
        });

        this.geometrySun = new THREE.SphereBufferGeometry(1, this.segments, this.segments);
        this.meshSun = new THREE.Mesh(this.geometrySun, this.materialSun);
        this.meshSun.scale.set(300, 300, 300);
        this.scene.add(this.meshSun);
    }

    updateCameraFOV() {
        this.camera.fov = 2 * Math.atan((this.height / 2) / this.camera.position.z) * (180 / Math.PI);
    }

    addTexture() {
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget);
        this.scene.add(this.cubeCamera);
    }

    addObjects() {
        // with generic noise
        this.materialPerlin = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            side: THREE.DoubleSide,
            vertexShader: vertex,
            fragmentShader: simplexNoise + fragment
        });

        this.geometryPerlin = new THREE.SphereBufferGeometry(1, this.segments, this.segments);
        const meshPerlin = new THREE.Mesh(this.geometryPerlin, this.materialPerlin);
        meshPerlin.scale.set(1, 1, 1);
        this.scene.add(meshPerlin);

        // with generic sun
        this.materialSun = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uPerlin: { value: null }
            },
            side: THREE.DoubleSide,
            vertexShader: vertexSun,
            fragmentShader: fresnel + ' ' + fragmentSun
        });

        this.geometrySun = new THREE.SphereBufferGeometry(1, this.segments, this.segments);
        this.meshSun = new THREE.Mesh(this.geometrySun, this.materialSun);
        this.meshSun.scale.set(300, 300, 300);
        this.scene.add(this.meshSun);
    }

    events() {
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
        this.width = this.dom.offsetWidth;
        this.height = this.dom.offsetHeight;

        // Update camera
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(this.width, this.height);

        // this.updateCameraFOV();
    }

    render() {
        this.time += 0.05;

        // this.meshSun.rotation.x = this.time * 0.001;
        // this.meshSun.rotation.y = this.time * 0.005;
        // this.meshSun.rotation.z = this.time * 0.002;

        this.materialPerlin.uniforms.time.value = this.time;
        this.materialSun.uniforms.time.value = this.time;

        this.cubeCamera.update(this.renderer, this.scene);
        this.materialSun.uniforms.uPerlin.value = this.cubeRenderTarget.texture;

        this.renderer.render(this.scene, this.camera);

        // For postprocess use
        // this.composer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

export default RunThreeJs;