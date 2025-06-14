// src/pages/Homepage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './Homepage.css';



const Homepage = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Create Earth with enhanced geometry for better lighting
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    
    // Load Earth textures
    const textureLoader = new THREE.TextureLoader();
    
    // Main earth texture
    const earthTexture = textureLoader.load(
      '/public/images/8k_earth_daymap.jpg',
      () => {
        console.log('Earth texture loaded successfully');
      },
      undefined,
      (error) => {
        console.warn('Earth texture failed to load:', error);
      }
    );
    
    // Optional: Add normal map for surface detail (if you have one)
    // const normalTexture = textureLoader.load('/public/images/earth_normal.jpg');
    
    // Enhanced material with proper lighting response
    const material = new THREE.MeshPhongMaterial({ 
      map: earthTexture,
      // normalMap: normalTexture, // Uncomment if you have a normal map
      shininess: 1,
      transparent: false
    });
    
    // Fallback material
    const fallbackMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      shininess: 10
    });
    
    const earth = new THREE.Mesh(geometry, material);
    earth.castShadow = true;
    earth.receiveShadow = true;
    
    // Handle texture loading error
    earthTexture.addEventListener('error', () => {
      earth.material = fallbackMaterial;
    });

    scene.add(earth);

    // Add atmospheric glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Enhanced lighting setup
    
    // 1. Directional light (Sun) - Main light source
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // 2. Ambient light - Soft fill light from space
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // 3. Rim light - Creates a subtle glow on the dark side
    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.5);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);

    // 4. Point light for additional warmth
    const pointLight = new THREE.PointLight(0xffa500, 0.8, 100);
    pointLight.position.set(3, 2, 4);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Declare star geometry and material in the main scope
    let starGeometry, starMaterial, stars;

    // Add enhanced stars with varying sizes and brightness
    const createStarField = () => {
      starGeometry = new THREE.BufferGeometry();
      starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 1,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.8
      });
      
      const starVertices = [];
      const starSizes = [];
      
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
        starSizes.push(Math.random() * 3 + 0.5);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
      
      stars = new THREE.Points(starGeometry, starMaterial);
      return stars;
    };

    const starsObject = createStarField();
    scene.add(starsObject);

    // Add subtle nebula-like background
    const nebulaGeometry = new THREE.SphereGeometry(500, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a0033,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    camera.position.z = 6;

    // Enhanced animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Earth rotation
      earth.rotation.y += 0.005;
      atmosphere.rotation.y += 0.005;
      
      // Subtle star movement
      starsObject.rotation.y += 0.0001;
      starsObject.rotation.x += 0.00005;
      
      // Animate the sun light to create day/night cycle effect
      const time = Date.now() * 0.001;
      sunLight.position.x = Math.cos(time * 0.1) * 8;
      sunLight.position.z = Math.sin(time * 0.1) * 8;
      
      // Subtle nebula movement
      nebula.rotation.y += 0.00005;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store references for transition
    sceneRef.current = { scene, camera, renderer, earth, sunLight };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      
      // Proper cleanup
      geometry.dispose();
      material.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      
      // Safe disposal of star resources
      if (starGeometry) starGeometry.dispose();
      if (starMaterial) starMaterial.dispose();
      
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/global-view');
  };

  return (
     <motion.div
      initial={{ opacity: 0, }}
      animate={{ opacity: 1}}
      exit={{ opacity: 0,}}
      transition={{ duration: 0.3 }}
    >

    <div className="homepage">
      <div ref={mountRef} className="three-canvas" />
      
      <motion.div 
        className="homepage-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 1 }}
      >
        <motion.h1 
          className="homepage-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          SENTRY.
        </motion.h1>
        
        <motion.h2 
          className="homepage-subtitle"
          data-text="Filtering the Noise.Exposing the Unseen."
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Filtering the Noise.<br />Exposing the Unseen.<br />
        </motion.h2>
        
        <motion.p 
          className="homepage-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          SentryAI is a surveillance-driven AI platform that scans public social media for explicit content, exposing patterns, origins, and accounts behind them — 
          empowering users and systems to take action in real time.
        </motion.p>
        
        <motion.button
          className="homepage-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
        >
          LET'S GET STARTED
        </motion.button>
      </motion.div>
    </div>
    </motion.div>
  );
};

export default Homepage;
