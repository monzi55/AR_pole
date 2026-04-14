import * as THREE from 'three';

/**
 * Generates a realistic construction pole (Red and White striped)
 * @returns {THREE.Group} - The constructed pole group
 */
export function createConstructionPole() {
    const poleGroup = new THREE.Group();
    
    const totalHeight = 2.0; // 2 meters high
    const radius = 0.025;   // 2.5cm radius
    const segments = 10;    // 10 bands of color
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

    for (let i = 0; i < segments; i++) {
        const geometry = new THREE.CylinderGeometry(radius, radius, segmentHeight, 16);
        const material = (i % 2 === 0) ? redMaterial : whiteMaterial;
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position each segment vertically
        // CylinderGeometry centered at Y, so we shift it
        mesh.position.y = (i * segmentHeight) + (segmentHeight / 2);
        
        // Cast shadow for realism in AR
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        poleGroup.add(mesh);
    }

    // Optional: Add a small black cap at the top
    const capGeo = new THREE.CylinderGeometry(radius + 0.002, radius + 0.002, 0.02, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = totalHeight;
    poleGroup.add(cap);

    // Optional: Add a base plate for stability feel
    const baseGeo = new THREE.CylinderGeometry(radius * 3, radius * 3, 0.01, 24);
    const base = new THREE.Mesh(baseGeo, capMat);
    base.position.y = 0.005;
    poleGroup.add(base);

    // Scale down a bit if it feels too tall in AR (optional)
    // poleGroup.scale.set(1, 1, 1);

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
