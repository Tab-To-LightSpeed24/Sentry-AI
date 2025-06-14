// src/pages/GlobalView.jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './GlobalView.css';

// Mock data for surveillance entities
const mockData = [
  { id: 1, name: '@surveillance_tech', location: 'New York, USA', lat: 40.7128, lng: -74.0060, type: 'Tech Company' },
  { id: 2, name: '@data_brokers_inc', location: 'London, UK', lat: 51.5074, lng: -0.1278, type: 'Data Broker' },
  { id: 3, name: '@global_security', location: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, type: 'Security Firm' },
  { id: 4, name: '@privacy_invaders', location: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, type: 'Analytics' },
  { id: 5, name: '@track_everything', location: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, type: 'Tracking' },
  { id: 6, name: '@social_monitor', location: 'San Francisco, USA', lat: 37.7749, lng: -122.4194, type: 'Social Media' },
  { id: 7, name: '@cyber_watchers', location: 'Tel Aviv, Israel', lat: 32.0853, lng: 34.7818, type: 'Cyber Security' },
  { id: 8, name: '@digital_footprint', location: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, type: 'Digital Forensics' }
];

const GlobalView = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [markers, setMarkers] = useState([]);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const earthRef = useRef(null);
  const cameraRef = useRef(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

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
    const geometry = new THREE.SphereGeometry(1.2, 128, 128);
    
    // Create a loading material with proper lighting
    const loadingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.8,
      shininess: 5
    });
    
    const earth = new THREE.Mesh(geometry, loadingMaterial);
    earth.position.set(0, 0, 0);
    earth.castShadow = true;
    earth.receiveShadow = true;
    scene.add(earth);
    earthRef.current = earth;

    // Add atmospheric glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.25, 64, 64);
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
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(3, 2, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // 2. Ambient light - Soft fill light from space
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);


    // 4. Point light for marker illumination
    const markerLight = new THREE.PointLight(0xffa500, 1, 50);
    markerLight.position.set(2, 1, 2);
    markerLight.castShadow = true;
    scene.add(markerLight);

    // Load texture with better error handling and smooth transition
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/public/images/8k_earth_daymap.jpg',
      (texture) => {
        // Texture loaded successfully
        const earthMaterial = new THREE.MeshPhongMaterial({ 
          map: texture,
          transparent: true,
          opacity: 0,
          shininess: 1
        });
        
        earth.material = earthMaterial;
        setTextureLoaded(true);
        
        // Animate texture fade-in
        const fadeInTexture = () => {
          const startTime = Date.now();
          const duration = 1000;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            earthMaterial.opacity = progress;
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        };
        
        fadeInTexture();
      },
      (progress) => {
        // Loading progress
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        // Error loading texture - keep the enhanced blue material
        console.warn('Could not load Earth texture, using fallback color');
        setTextureLoaded(true);
      }
    );

    // ONE-TIME entrance animation for Earth (zoom in and slight pan right)
    const animateEntrance = () => {
      const startTime = Date.now();
      const duration = 2000;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        // Scale from 1.2 to 2.5 (zoom in)
        const scale = 1.2 + (1.3 * easedProgress);
        earth.scale.set(scale / 1.2, scale / 1.2, scale / 1.2);
        atmosphere.scale.set(scale / 1.2, scale / 1.2, scale / 1.2);
        
        // Slight move to right (from 0 to 0.3)
        const posX = 0.3 * easedProgress;
        earth.position.x = posX;
        atmosphere.position.x = posX;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    };
    
    // Start entrance animation after texture starts loading
    setTimeout(animateEntrance, 300);

    // Add markers for surveillance entities with enhanced materials
    const markerObjects = [];

    mockData.forEach((entity, index) => {
      // Create marker group
      const markerGroup = new THREE.Group();
      
      // Main marker sphere with enhanced material
      const markerGeometry = new THREE.SphereGeometry(0.025, 32, 32);
      const markerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4444,
        transparent: true,
        opacity: 1,
        shininess: 100,
        emissive: 0x440000
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.castShadow = true;
      marker.receiveShadow = true;
      
      // Outer ring with enhanced material
      const ringGeometry = new THREE.RingGeometry(0.035, 0.055, 32);
      const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        shininess: 50,
        emissive: 0x002200
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.castShadow = true;
      ring.receiveShadow = true;
      
      // Shining effect ring (for animation) with enhanced material
      const shineRingGeometry = new THREE.RingGeometry(0.055, 0.08, 32);
      const shineRingMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        shininess: 200,
        emissive: 0x222222
      });
      const shineRing = new THREE.Mesh(shineRingGeometry, shineRingMaterial);
      shineRing.castShadow = true;
      shineRing.receiveShadow = true;
      
      // Add parts to the group
      markerGroup.add(marker);
      markerGroup.add(ring);
      markerGroup.add(shineRing);
      
      // Convert lat/lng to 3D coordinates
      const phi = (90 - entity.lat) * (Math.PI / 180);
      const theta = (entity.lng + 180) * (Math.PI / 180);
      const radius = 1.22;
      
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      markerGroup.position.set(x, y, z);
      
      const normal = new THREE.Vector3(x, y, z).normalize();
      markerGroup.lookAt(normal.multiplyScalar(10));
      
      markerGroup.userData = entity;
      markerGroup.isAnimating = false;
      earth.add(markerGroup);
      markerObjects.push(markerGroup);
    });

    setMarkers(markerObjects);

    // Enhanced stars with varying sizes and brightness - moved to main scope
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 1,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8
    });
    
    const starVertices = [];
    const starSizes = [];
    
    for (let i = 0; i < 1500; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
      starSizes.push(Math.random() * 2 + 0.5);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Add subtle nebula-like background
    const nebulaGeometry = new THREE.SphereGeometry(300, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a0033,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // Position camera
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Mouse drag controls
    const handleMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const handleMouseMove = (event) => {
      if (isDragging.current) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.current.x,
          y: event.clientY - previousMousePosition.current.y
        };

        const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
            deltaMove.y * 0.005,
            deltaMove.x * 0.005,
            0,
            'XYZ'
          ));

        earth.quaternion.multiplyQuaternions(deltaRotationQuaternion, earth.quaternion);
        atmosphere.quaternion.multiplyQuaternions(deltaRotationQuaternion, atmosphere.quaternion);

        previousMousePosition.current = {
          x: event.clientX,
          y: event.clientY
        };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Add event listeners
    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Enhanced animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate shining markers with enhanced effects
      markerObjects.forEach(markerGroup => {
        if (markerGroup.isAnimating) {
          const shineRing = markerGroup.children[2]; // The shine ring
          if (shineRing) {
            const animationTime = time * 4; // Faster animation
            const pulse = (Math.sin(animationTime) + 1) * 0.5;
            shineRing.material.opacity = 0.3 + pulse * 0.7;
            shineRing.scale.setScalar(1 + pulse * 0.8);
            
            // Add subtle color animation
            const colorIntensity = 0.5 + pulse * 0.5;
            shineRing.material.emissive.setRGB(colorIntensity * 0.2, colorIntensity * 0.2, colorIntensity * 0.2);
          }
        }
        
        // Subtle marker glow animation
        const marker = markerGroup.children[0];
        const ring = markerGroup.children[1];
        if (marker && ring) {
          const glowPulse = (Math.sin(time * 2 + markerGroup.userData.id) + 1) * 0.5;
          marker.material.emissive.setRGB(0.1 + glowPulse * 0.1, 0, 0);
          ring.material.emissive.setRGB(0, 0.05 + glowPulse * 0.05, 0);
        }
      });
      
      // Animate the sun light to create dynamic lighting
      sunLight.position.x = Math.cos(time * 0.1) * 5;
      sunLight.position.z = Math.sin(time * 0.1) * 5;
      
      // Subtle star movement
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      
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

    sceneRef.current = { scene, camera, renderer, earth, markers: markerObjects, atmosphere, sunLight };

    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      
      // Enhanced cleanup - now all variables are in scope
      geometry.dispose();
      loadingMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();
      renderer.dispose();
    };
  }, []); // Removed selectedEntity dependency to prevent re-initialization

  // FIXED Function to rotate globe to center a location with proper Earth orientation
  const rotateGlobeToLocation = (entity) => {
    if (!earthRef.current || !sceneRef.current) return;

    const earth = earthRef.current;
    const atmosphere = sceneRef.current.atmosphere;
    const camera = cameraRef.current;
    
    // Find the marker for this entity
    const targetMarker = sceneRef.current.markers.find(marker => 
      marker.userData.id === entity.id
    );
    
    if (!targetMarker) return;
    
    // Step 1: Calculate rotation to center the marker
    // Get the marker's current world position
    const markerWorldPosition = new THREE.Vector3();
    targetMarker.getWorldPosition(markerWorldPosition);
    
    // Calculate what the marker position should be to face the camera
    const targetPosition = new THREE.Vector3(0, 0, 1.22); // Same radius as marker, facing camera
    
    // Get the current marker position relative to earth center
    const currentMarkerPos = markerWorldPosition.clone().sub(earth.position);
    
    // Calculate the rotation needed to move current position to target position
    const rotationAxis = new THREE.Vector3().crossVectors(currentMarkerPos.normalize(), targetPosition.normalize());
    const rotationAngle = currentMarkerPos.angleTo(targetPosition);
    
    // Handle edge case where vectors are parallel (no rotation needed for centering)
    if (rotationAxis.length() < 0.001) {
      // Marker is already centered, but we still might need to fix orientation
      rotationAxis.set(0, 1, 0); // Use Y-axis as default
    } else {
      rotationAxis.normalize();
    }
    
    // Create rotation quaternion for centering
    const centeringRotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
    
    // Apply centering rotation to current earth rotation
    const afterCenteringQuaternion = new THREE.Quaternion().multiplyQuaternions(centeringRotation, earth.quaternion);
    
    // Step 2: Calculate additional rotation to ensure proper Earth orientation
    // We want the North Pole (0, 1, 0) to generally point upward in screen space
    // Create a temporary earth with the centering rotation applied
    const tempEarth = earth.clone();
    tempEarth.quaternion.copy(afterCenteringQuaternion);
    tempEarth.updateMatrixWorld();
    
    // Get the North Pole position after centering rotation
    const northPole = new THREE.Vector3(0, 1.2, 0); // North pole at radius 1.2
    northPole.applyQuaternion(afterCenteringQuaternion);
    
    // Project North Pole onto the screen plane (remove Z component for screen alignment)
    const northPoleScreen = new THREE.Vector3(northPole.x, northPole.y, 0).normalize();
    const upVector = new THREE.Vector3(0, 1, 0); // Screen up direction
    
    // Calculate angle between projected north pole and screen up
    const orientationAngle = northPoleScreen.angleTo(upVector);
    
    // Determine rotation direction using cross product
    const orientationAxis = new THREE.Vector3().crossVectors(northPoleScreen, upVector);
    const rotationDirection = orientationAxis.z > 0 ? 1 : -1;
    
    // Create orientation correction rotation (around Z-axis to rotate in screen plane)
    const orientationRotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1), 
      orientationAngle * rotationDirection
    );
    
    // Combine both rotations: first centering, then orientation correction
    const finalTargetQuaternion = new THREE.Quaternion().multiplyQuaternions(
      orientationRotation, 
      afterCenteringQuaternion
    );
    
    // Get starting rotation for animation
    const startQuaternion = earth.quaternion.clone();
    
    // Animate rotation
    const animationDuration = 1500; // ms
    const startTime = Date.now();
    
    const animateRotation = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);
      
      // Interpolate quaternions
      earth.quaternion.slerpQuaternions(startQuaternion, finalTargetQuaternion, easedProgress);
      atmosphere.quaternion.slerpQuaternions(startQuaternion, finalTargetQuaternion, easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      }
    };
    
    animateRotation();
  };

  // Entity selection with marker highlighting and globe rotation
  const handleEntityClick = (entity) => {
    setSelectedEntity(entity);
    
    // Stop all current shine animations
    if (sceneRef.current && sceneRef.current.markers) {
      sceneRef.current.markers.forEach(markerGroup => {
        markerGroup.isAnimating = false;
        const shineRing = markerGroup.children[2];
        if (shineRing) {
          shineRing.material.opacity = 0;
          shineRing.scale.setScalar(1);
        }
      });
    }
    
    // Highlight the corresponding marker and start animation
    if (sceneRef.current && sceneRef.current.markers) {
      sceneRef.current.markers.forEach(markerGroup => {
        const mainSphere = markerGroup.children[0];
        const ring = markerGroup.children[1];
        
        if (markerGroup.userData.id === entity.id) {
          // Highlight selected marker
          mainSphere.material.color.setHex(0x00ff88);
          mainSphere.material.emissive.setHex(0x004400);
          ring.material.color.setHex(0xffffff);
          ring.material.emissive.setHex(0x444444);
          markerGroup.scale.set(1.8, 1.8, 1.8);
          
          // Start shining animation
          markerGroup.isAnimating = true;
        } else {
          // Reset other markers
          mainSphere.material.color.setHex(0xff4444);
          mainSphere.material.emissive.setHex(0x440000);
          ring.material.color.setHex(0x00ff88);
          ring.material.emissive.setHex(0x002200);
          markerGroup.scale.set(1, 1, 1);
        }
      });
    }

    // Rotate globe to show the location
    rotateGlobeToLocation(entity);
  };

  return (
    <motion.div
      initial={{ opacity: 0,  }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >

    <div className="globalview">
      <div ref={mountRef} className="three-canvas-global" />
      
      <motion.div 
        className="entity-sidebar"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <h2 className="sidebar-title" style={{ color: 'white' }}>Surveillance Entities</h2>
        <div className="entity-list">
          {mockData.map((entity) => (
            <motion.div
              key={entity.id}
              className={`entity-item ${selectedEntity?.id === entity.id ? 'selected' : ''}`}
              onClick={() => handleEntityClick(entity)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: selectedEntity?.id === entity.id 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                margin: '8px 0',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <div className="entity-name" style={{ fontWeight: 'bold' }}>{entity.name}</div>
              <div className="entity-location" style={{ opacity: 0.8 }}>{entity.location}</div>
              <div className="entity-type" style={{ opacity: 0.6, fontSize: '0.9em' }}>{entity.type}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {selectedEntity && (
        <motion.div
          className="entity-details"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            minWidth: '300px'
          }}
        >
          <h3 style={{ margin: '0 0 15px 0' }}>{selectedEntity.name}</h3>
          <p style={{ margin: '8px 0' }}><strong>Location:</strong> {selectedEntity.location}</p>
          <p style={{ margin: '8px 0' }}><strong>Type:</strong> {selectedEntity.type}</p>
          <p style={{ margin: '8px 0' }}><strong>Coordinates:</strong> {selectedEntity.lat.toFixed(4)}, {selectedEntity.lng.toFixed(4)}</p>
          <button 
            className="close-details"
            onClick={() => setSelectedEntity(null)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </div>
    </motion.div>
  );
};

export default GlobalView;
