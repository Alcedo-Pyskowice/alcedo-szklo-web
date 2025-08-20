import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// --- IGU Dimensions (Constants) ---
//const glassWidth = 1; // meters
//const glassHeight = 1; // meters
let glassPaneThickness = 0.004; // 4mm glass
let spacerAirGap = 0.016; // 16mm air gap
let spacerBarCrossSectionWidth = 0.008;
let spacerBarCrossSectionHeight = 0.008;
let sealantOverlapOnGlassFace = 0.012;
let sealantBeadThickness = 0.006;
const epsilon = 0.0001;

const GlassRender = ({ scale, symbol }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const iguGroupRef = useRef(null);

  useEffect(() => {

    const glassWidth = scale.x * 0.001
    const glassHeight = scale.y * 0.001

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
    camera.position.set(glassWidth * 0.7, glassHeight * 0.3, glassWidth * 2); // Adjusted for better initial view
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
      .load('bloem_field_sunrise_4k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        console.log("HDRI loaded.");
      },
        undefined,
        function(err) {
          console.error('Error loading HDRI:', err);
          scene.background = new THREE.Color(0xbbbbcc);
          console.log("Using fallback background color.");
        });

    // --- Materials ---
    //
    const textureLoader = new TextureLoader();

    const colorMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_COL_1K.jpg')
    const normalMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_NRM_1K.jpg')
    const glossMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_GLOSS_1K.jpg')
    const refMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_REFL_1K.jpg')
    const alphaMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_ALPHAMASKED_1K.png')
    const envMap = textureLoader.load(process.env.PUBLIC_URL + '/glassMaterialTextures/DirtWindowStains005_Sphere.png')

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughnessMap: glossMap,
      metalnessMap: refMap,
      alphaMap: alphaMap,
      envMap: envMap,
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

    /*  @TODO
     * +1h 06.07
     * +2h 07.07
     * +2h 08.07
     * zrobic dynamiczne generowanie szyb z symbolu
     *      if (symbolSplit.length % 2 !== 0 && symbolSplit.length > 1 && symbolSplit.length < 10) {
              if (v.value.match(/^(\d{1,2})(?:\/(\d{1,2})\/\1)*(?:\/\2\/\1)?$/)) {
                //dodac do sceny nowe szyby zeby sie zgadzalo
                //
                // ilosc szyb
                const symbolLength = Math.round(symbolSplit.length / 2)
                if (symbolLength >= 2) {

     */


    const glassGeometry = new THREE.BoxGeometry(glassWidth, glassHeight, glassPaneThickness);

    const iguGroup = new THREE.Group();
    iguGroupRef.current = iguGroup;

    const glassPane1 = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane1.position.z = (spacerAirGap / 2) + (glassPaneThickness / 2);

    const glassPane2 = new THREE.Mesh(glassGeometry, glassMaterial);
    glassPane2.position.z = -(spacerAirGap / 2) - (glassPaneThickness / 2);


    // The original code centers the IGU group with `iguGroup.position.y = -glassHeight / 2;`
    // This effectively makes the *bottom* of the IGU at y=0 of the group's local space.
    // If you want the IGU to be centered around the world origin (0,0,0) for OrbitControls,
    // you can omit setting iguGroup.position.y or set it to 0, and ensure OrbitControls targets 0,0,0.
    // For this example, let's keep it centered around the origin for simpler camera control.
    // The camera target has already been set to (0,0,0).

    const symbolSplit = symbol.split('/');

    if (symbolSplit.length % 2 !== 0 && symbolSplit.length > 1 && symbolSplit.length < 10) {
      if (symbol.match(/^(\d{1,2})(?:\/(\d{1,2})\/\1)*(?:\/\2\/\1)?$/)) {
        const symbolLength = Math.round(symbolSplit.length / 2)
        if (symbolLength >= 2) {
          glassPaneThickness = symbolSplit[0] * 0.001
          spacerAirGap = symbolSplit[1] * 0.001 + glassPaneThickness
          const spacerDepth = spacerAirGap - 2 * epsilon;
          const spacerFrameLength = glassWidth - (2 * sealantOverlapOnGlassFace) - (2 * epsilon);
          const spacerFrameHeight = glassHeight - (2 * sealantOverlapOnGlassFace) - (2 * epsilon);
          const sealantVertBarHeight = glassHeight - (2 * sealantOverlapOnGlassFace);
          const sealantUnitDepth = spacerAirGap * (symbolLength - 1) + epsilon;
          const spacerVertBarActualHeight = spacerFrameHeight - (2 * spacerBarCrossSectionHeight);

          // parzysta ilosc szyb
          if (symbolLength % 2 == 0) {
            let firstPane = (spacerAirGap * (symbolLength - 1)) / 2
            for (let i = 0; i < symbolSplit.length; i++) {
              if (i % 2 == 0) {
                const gp = new THREE.Mesh(glassGeometry, glassMaterial);
                gp.position.z = firstPane
                iguGroup.add(gp);
                firstPane -= spacerAirGap
                console.log(gp)
              } else {
                const spacerHorizGeometry = new THREE.BoxGeometry(spacerFrameLength, spacerBarCrossSectionHeight, spacerDepth);
                const topSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
                topSpacer.position.y = (glassHeight / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionHeight / 2);
                topSpacer.position.z = firstPane + 0.008
                iguGroup.add(topSpacer);

                const bottomSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
                bottomSpacer.position.y = -(glassHeight / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionHeight / 2);
                bottomSpacer.position.z = firstPane + 0.008
                iguGroup.add(bottomSpacer);

                const spacerVertGeometry = new THREE.BoxGeometry(spacerBarCrossSectionWidth, spacerVertBarActualHeight, spacerDepth);

                const leftSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
                leftSpacer.position.x = -(glassWidth / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionWidth / 2);
                leftSpacer.position.z = firstPane + 0.008
                iguGroup.add(leftSpacer);

                const rightSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
                rightSpacer.position.x = (glassWidth / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionWidth / 2);
                rightSpacer.position.z = firstPane + 0.008
                iguGroup.add(rightSpacer);

                const sealantTopGeometry = new THREE.BoxGeometry(glassWidth, sealantOverlapOnGlassFace, sealantUnitDepth);

                const topSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
                topSealant.position.y = (glassHeight / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
                iguGroup.add(topSealant);

                const bottomSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
                bottomSealant.position.y = -(glassHeight / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
                iguGroup.add(bottomSealant);

                const sealantSideGeometry = new THREE.BoxGeometry(sealantOverlapOnGlassFace, sealantVertBarHeight, sealantUnitDepth);

                const leftSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
                leftSealant.position.x = -(glassWidth / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
                iguGroup.add(leftSealant);

                const rightSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
                rightSealant.position.x = (glassWidth / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
                iguGroup.add(rightSealant);
              }
            }

//          nieparzysta ilosc szyb
          } else {
            let firstPane = (spacerAirGap * (symbolLength - 2))
            for (let i = 0; i < symbolSplit.length; i++) {
              if (i % 2 == 0) {
                const gp = new THREE.Mesh(glassGeometry, glassMaterial);
                gp.position.z = firstPane
                iguGroup.add(gp);
                firstPane -= spacerAirGap
                console.log(gp)
              } else {
                const spacerHorizGeometry = new THREE.BoxGeometry(spacerFrameLength, spacerBarCrossSectionHeight, spacerDepth);
                const topSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
                topSpacer.position.y = (glassHeight / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionHeight / 2);
                topSpacer.position.z = firstPane + 0.008
                iguGroup.add(topSpacer);

                const bottomSpacer = new THREE.Mesh(spacerHorizGeometry, spacerMaterial);
                bottomSpacer.position.y = -(glassHeight / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionHeight / 2);
                bottomSpacer.position.z = firstPane + 0.008
                iguGroup.add(bottomSpacer);

                const spacerVertGeometry = new THREE.BoxGeometry(spacerBarCrossSectionWidth, spacerVertBarActualHeight, spacerDepth);

                const leftSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
                leftSpacer.position.x = -(glassWidth / 2) + sealantOverlapOnGlassFace + (spacerBarCrossSectionWidth / 2);
                leftSpacer.position.z = firstPane + 0.008
                iguGroup.add(leftSpacer);

                const rightSpacer = new THREE.Mesh(spacerVertGeometry, spacerMaterial);
                rightSpacer.position.x = (glassWidth / 2) - sealantOverlapOnGlassFace - (spacerBarCrossSectionWidth / 2);
                rightSpacer.position.z = firstPane + 0.008
                iguGroup.add(rightSpacer);

                const sealantTopGeometry = new THREE.BoxGeometry(glassWidth, sealantOverlapOnGlassFace, sealantUnitDepth);

                const topSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
                topSealant.position.y = (glassHeight / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
                iguGroup.add(topSealant);

                const bottomSealant = new THREE.Mesh(sealantTopGeometry, sealantMaterial);
                bottomSealant.position.y = -(glassHeight / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
                iguGroup.add(bottomSealant);

                const sealantSideGeometry = new THREE.BoxGeometry(sealantOverlapOnGlassFace, sealantVertBarHeight, sealantUnitDepth);

                const leftSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
                leftSealant.position.x = -(glassWidth / 2) + (sealantOverlapOnGlassFace / 2) - epsilon;
                iguGroup.add(leftSealant);

                const rightSealant = new THREE.Mesh(sealantSideGeometry, sealantMaterial);
                rightSealant.position.x = (glassWidth / 2) - (sealantOverlapOnGlassFace / 2) + epsilon;
                iguGroup.add(rightSealant);
              }

            }
          }

          // szyba moze byc nieregularna: np. 4/16/6/20/4
          // poki co bedzie na regularne
          scene.add(iguGroup);
        }
      }
    } else {
      glassPane1.position.z = 0;
      scene.add(glassPane1)
    }


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
      setTimeout(function() {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }, 1000 / 30);
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
      //  glassMaterial.dispose();
      //  spacerMaterial.dispose();
      //  sealantMaterial.dispose();

      //  // Dispose geometries
      //  glassGeometry.dispose();
      //  spacerHorizGeometry.dispose();
      //  spacerVertGeometry.dispose();
      //  sealantTopGeometry.dispose();
      //  sealantSideGeometry.dispose();

      // Dispose HDRI texture if loaded
      if (sceneRef.current && sceneRef.current.environment) {
        if (sceneRef.current.environment.dispose) sceneRef.current.environment.dispose();
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
  }, [scale, symbol]); // Empty dependency array ensures this effect runs only on mount and unmount

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
};

export default GlassRender;
