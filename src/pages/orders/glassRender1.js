import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// --- IGU Dimensions (Constants) ---
const glassWidth = 0.8; // meters
const glassHeight = 1.2; // meters
const glassPaneThickness = 0.004; // 4mm glass
const spacerAirGap = 0.016; // 16mm air gap
const spacerBarCrossSectionWidth = 0.008;
const spacerBarCrossSectionHeight = 0.008;
const sealantOverlapOnGlassFace = 0.012;
const sealantBeadThickness = 0.006;
const epsilon = 0.0001;

const GlassRender = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const iguGroupRef = useRef(null);

  useEffect(() => {
    // --- Capture the current mount point ---
    const currentMount = mountRef.current;
    if (!currentMount) return; // Should not happen if ref is correctly assigned

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    sceneRef.current = scene;

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.useLegacyLights = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
    camera.position.set(glassWidth * 0.7, glassHeight * 0.3 , glassWidth * 2); // Adjusted for better initial view
    cameraRef.current = camera;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // Target the center of the IGU
    controls.enableDamping = true;
    controlsRef.current = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(1, 1.5, 1).normalize();
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight2.position.set(-1, -0.5, -1).normalize();
    scene.add(directionalLight2);

    // --- HDRI Environment ---
    new RGBELoader()
      .setPath(process.env.PUBLIC_URL + '/') // Assuming HDRI is in public folder
      .load('bloem_field_sunrise_4k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        console.log("HDRI loaded.");
      },
        undefined,
        function (err) {
          console.error('Error loading HDRI:', err);
          scene.background = new THREE.Color(0xbbbbcc);
          console.log("Using fallback background color.");
        });

    // --- Materials ---
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.15,
      roughness: 0.01,
      transmission: 1.0,
      transparent: true,
      opacity: 1.0,
      ior: 1.52,
      thickness: glassPaneThickness,
      side: THREE.DoubleSide,
      clearcoat: 0.5,
      clearcoatRoughness: 0.03
    });

    const spacerMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.85,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    const sealantMaterial = new THREE.MeshStandardMaterial({
      color: 0x181818,
      metalness: 0.05,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    // --- Geometries and Meshes ---
    const iguGroup = new THREE.Group();
    iguGroupRef.current = iguGroup;

    const glassGeometry = new THREE.BoxGeometry(glassWidth, glassHeight, glassPaneThickness);
    const glassPane1 = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane1.position.z = (spacerAirGap / 2) + (glassPaneThickness / 2);
    iguGroup.add(glassPane1);

    const glassPane2 = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane2.position.z = -(spacerAirGap / 2) - (glassPaneThickness / 2);
    iguGroup.add(glassPane2);

    const spacerDepth = spacerAirGap - 2 * epsilon;
    const spacerFrameLength = glassWidth - (2 * sealantOverlapOnGlassFace) - (2 * epsilon);
    const spacerFrameHeight = glassHeight - (2 * sealantOverlapOnGlassFace) - (2 * epsilon);

    const spacerHorizGeometry = new THREE.BoxGeometry(spacerFrameLength, spacerBarCrossSectionHeight, spacerDepth);
    const topSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
    topSpacer.position.y = (glassHeight / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionHeight / 2);
    iguGroup.add(topSpacer);

    const bottomSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
    bottomSpacer.position.y = -(glassHeight / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionHeight / 2);
    iguGroup.add(bottomSpacer);

    const spacerVertBarActualHeight = spacerFrameHeight - (2 * spacerBarCrossSectionHeight);
    const spacerVertGeometry = new THREE.BoxGeometry(spacerBarCrossSectionWidth, spacerVertBarActualHeight, spacerDepth);

    const leftSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
    leftSpacer.position.x = -(glassWidth / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionWidth / 2);
    iguGroup.add(leftSpacer);

    const rightSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
    rightSpacer.position.x = (glassWidth / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionWidth / 2);
    iguGroup.add(rightSpacer);

    const sealantUnitDepth = glassPaneThickness * 2 + spacerAirGap + sealantBeadThickness + epsilon;
    const sealantTopGeometry = new THREE.BoxGeometry(glassWidth, sealantOverlapOnGlassFace, sealantUnitDepth);

    const topSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
    topSealant.position.y = (glassHeight / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
    iguGroup.add(topSealant);

    const bottomSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
    bottomSealant.position.y = -(glassHeight / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
    iguGroup.add(bottomSealant);

    const sealantVertBarHeight = glassHeight - (2 * sealantOverlapOnGlassFace);
    const sealantSideGeometry = new THREE.BoxGeometry(sealantOverlapOnGlassFace, sealantVertBarHeight, sealantUnitDepth);

    const leftSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
    leftSealant.position.x = -(glassWidth / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
    iguGroup.add(leftSealant);

    const rightSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
    rightSealant.position.x = (glassWidth / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
    iguGroup.add(rightSealant);

    // The original code centers the IGU group with `iguGroup.position.y = -glassHeight / 2;`
    // This effectively makes the *bottom* of the IGU at y=0 of the group's local space.
    // If you want the IGU to be centered around the world origin (0,0,0) for OrbitControls,
    // you can omit setting iguGroup.position.y or set it to 0, and ensure OrbitControls targets 0,0,0.
    // For this example, let's keep it centered around the origin for simpler camera control.
    // The camera target has already been set to (0,0,0).
    scene.add(iguGroup);

    // --- Handle Window Resize ---
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    // --- Animation Loop ---
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      if (controlsRef.current) controlsRef.current.dispose();

      // Dispose materials
      glassMaterial.dispose();
      spacerMaterial.dispose();
      sealantMaterial.dispose();

      // Dispose geometries
      glassGeometry.dispose();
      spacerHorizGeometry.dispose();
      spacerVertGeometry.dispose();
      sealantTopGeometry.dispose();
      sealantSideGeometry.dispose();

      // Dispose HDRI texture if loaded
      if (sceneRef.current && sceneRef.current.environment) {
          if(sceneRef.current.environment.dispose) sceneRef.current.environment.dispose();
          // If background is the same texture, it's already handled by environment.dispose()
          // otherwise, dispose it separately:
          // if(sceneRef.current.background && sceneRef.current.background !== sceneRef.current.environment && sceneRef.current.background.dispose) {
          //     sceneRef.current.background.dispose();
          // }
      }
      // Fallback background color doesn't need disposal.

      // Remove all children from iguGroup and scene for good measure, though disposing geometries/materials is key
      if (iguGroupRef.current) {
        while (iguGroupRef.current.children.length > 0) {
          iguGroupRef.current.remove(iguGroupRef.current.children[0]);
        }
      }
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
      }


      if (rendererRef.current) {
        rendererRef.current.dispose(); // Dispose renderer resources
        if (rendererRef.current.domElement && currentMount.contains(rendererRef.current.domElement)) {
            currentMount.removeChild(rendererRef.current.domElement); // Remove canvas from DOM
        }
      }

      // Clear refs
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      iguGroupRef.current = null;

      console.log("ThreeScene cleaned up");
    };
  }, []); // Empty dependency array ensures this effect runs only on mount and unmount

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
};

export default GlassRender;
