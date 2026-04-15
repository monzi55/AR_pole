import * as THREE from 'three';

/**
 * Generates a realistic construction pole (Red and White striped)
 * @returns {THREE.Group} - The constructed pole group
 */
export function createConstructionPole() {
    const poleGroup = new THREE.Group();
    
    const totalHeight = 1.2; // 1.2 meters high (6 segments of 20cm)
    const radius = 0.0125;  // 1.25cm radius (half of previous 2.5cm)
    const segments = 6;     // 6 bands of color (3 red, 3 white)
    const segmentHeight = totalHeight / segments;

    // Standard materials
    const redMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff3b30, 
        roughness: 0.3, 
        metalness: 0.2 
    });
    const whiteMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.5, 
        metalness: 0.0 
    });

    // Add a sharp metal tip at the bottom
    const tipHeight = 0.075; // 7.5cm sharp tip (half of previous 15cm)
    const tipGeo = new THREE.ConeGeometry(radius, tipHeight, 16);
    const tipMat = new THREE.MeshStandardMaterial({ 
        color: 0x555555, 
        metalness: 0.8, 
        roughness: 0.2 
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    // Point the cone downwards
    tip.rotation.x = Math.PI;
    tip.position.y = tipHeight / 2;
    poleGroup.add(tip);

    for (let i = 0; i < segments; i++) {
        const geometry = new THREE.CylinderGeometry(radius, radius, segmentHeight, 16);
        const material = (i % 2 === 0) ? redMaterial : whiteMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position each segment above the tip
        mesh.position.y = tipHeight + (i * segmentHeight) + (segmentHeight / 2);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        poleGroup.add(mesh);
    }

    // Optional: Add a small black cap at the top
    const capGeo = new THREE.CylinderGeometry(radius, radius, 0.02, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = tipHeight + totalHeight;
    poleGroup.add(cap);

    return poleGroup;
}

/**
 * Creates a circular reticle for hit-testing
 */
export function createReticle() {
    const reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.1, 0.11, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    return reticle;
}
