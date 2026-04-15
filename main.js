import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { createConstructionPole, createReticle } from './pole-generator.js';

let container;
let camera, scene, renderer;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;

let poles = [];
const uiOverlay = document.getElementById('ui-overlay');
const startBtnContainer = document.getElementById('ar-start-container');
const startBtn = document.getElementById('start-ar-btn');
const resetBtn = document.getElementById('reset-btn');
const undoBtn = document.getElementById('undo-btn');
const captureBtn = document.getElementById('capture-btn');
const instructionText = document.getElementById('instruction-text');

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true // Crucial for screenshot functionality
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Custom AR Button Logic
    const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: uiOverlay }
    });
    
    // Replace standard button with our custom styled one
    startBtn.addEventListener('click', () => {
        arButton.click();
    });

    renderer.xr.addEventListener('sessionstart', () => {
        uiOverlay.classList.add('active');
        startBtnContainer.style.display = 'none';
        instructionText.innerText = '床を探してタップしてください';
    });

    renderer.xr.addEventListener('sessionend', () => {
        uiOverlay.classList.remove('active');
        startBtnContainer.style.display = 'block';
    });

    // Reticle for hit testing
    reticle = createReticle();
    scene.add(reticle);

    // Interaction
    renderer.xr.getController(0).addEventListener('select', onSelect);

    // UI Listeners
    resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        poles.forEach(p => scene.remove(p));
        poles = [];
        instructionText.innerText = 'ポールをすべて消去しました';
    });

    resetBtn.addEventListener('beforexrselect', (e) => {
        e.preventDefault();
    });

    undoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (poles.length > 0) {
            const lastPole = poles.pop();
            scene.remove(lastPole);
            instructionText.innerText = '最後の1本を取り消しました';
        }
    });

    undoBtn.addEventListener('beforexrselect', (e) => {
        e.preventDefault();
    });

    captureBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        takeScreenshot();
    });

    captureBtn.addEventListener('beforexrselect', (e) => {
        e.preventDefault();
    });

    window.addEventListener('resize', onWindowResize);
}

function onSelect() {
    if (reticle.visible) {
        const pole = createConstructionPole();
        reticle.matrix.decompose(pole.position, pole.quaternion, pole.scale);
        scene.add(pole);
        poles.push(pole);
        
        instructionText.innerText = 'ポールを配置しました';
        setTimeout(() => {
            if (poles.length > 0) instructionText.innerText = 'タップしてさらに配置';
        }, 2000);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    hitTestSource = source;
                });
            });

            session.addEventListener('end', () => {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });

            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {
                const hit = hitTestResults[0];
                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
                
                if (poles.length === 0) {
                    instructionText.innerText = 'タップしてポールを配置';
                }
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);
}

function takeScreenshot() {
    // Note: This captures the WebGL canvas. 
    // In many WebXR environments, the camera feed is handled by the browser 
    // and is not directly readable in the main GL context.
    // However, this will capture all placed 3D poles.
    
    try {
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `ar-pole-photo-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        
        instructionText.innerText = '写真を保存しました';
        setTimeout(() => {
            instructionText.innerText = 'タップしてさらに配置';
        }, 2000);
    } catch (err) {
        console.error('Screenshot failed:', err);
        alert('撮影に失敗しました');
    }
}
