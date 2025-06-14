// src/pages/About.jsx
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './About.css';

const About = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.3); // Semi-transparent background
    mount.appendChild(renderer.domElement);

    // Create Earth
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      '/images/8k_earth_daymap.jpg',
      () => {
        // Texture loaded successfully
      },
      undefined,
      () => {
        // Fallback to a simple material if texture fails to load
        earth.material = new THREE.MeshBasicMaterial({ color: 0x00ff88, opacity: 0.6, transparent: true });
      }
    );
    
    const material = new THREE.MeshBasicMaterial({ 
      map: earthTexture, 
      opacity: 0.6, 
      transparent: true 
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Add stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
      color: 0x00ff88, 
      size: 1.5, 
      opacity: 0.7, 
      transparent: true 
    });
    
    const starVertices = [];
    for (let i = 0; i < 800; i++) {
      const x = (Math.random() - 0.5) * 3000;
      const y = (Math.random() - 0.5) * 3000;
      const z = (Math.random() - 0.5) * 3000;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    camera.position.z = 8; // Moved camera back for better view

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.003; // Slightly slower rotation
      stars.rotation.y += 0.0001;
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0}}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, }}
      transition={{ duration: 0.3 }}
    >
      <div className="about-page">
        <div ref={mountRef} className="about-background" />
        
        <div className="about-container">
          <div className="about-content">
            <h1 className="about-title">
              About SENTRY
            </h1>

            <section className="about-section">
              <h2>Our Mission</h2>
              <p>
                SentryAI is revolutionizing digital content monitoring through advanced artificial intelligence. 
                We're dedicated to creating safer online environments by identifying, analyzing, and exposing 
                explicit content across public social media platforms in real-time.
              </p>
            </section>

            <section className="about-section">
              <h2>What We Do</h2>
              <p>
                Our sophisticated surveillance-driven AI platform continuously scans public social media 
                channels, filtering through the noise to identify problematic content. We analyze patterns, 
                trace origins, and provide comprehensive insights about accounts and networks involved in 
                distributing explicit material.
              </p>
            </section>

            <section className="about-section">
              <h2>Our Technology</h2>
              <p>
                Powered by cutting-edge machine learning algorithms and computer vision technology, 
                SentryAI processes millions of posts, images, and videos daily. Our system learns 
                and adapts continuously, becoming more accurate and efficient in detecting and 
                categorizing content that violates platform policies or social standards.
              </p>
            </section>

            <section className="about-section">
              <h2>Empowering Action</h2>
              <p>
                We don't just identify problems – we enable solutions. SentryAI provides users and 
                systems with actionable intelligence, comprehensive reports, and real-time alerts 
                that facilitate immediate response and intervention. Our platform bridges the gap 
                between detection and action.
              </p>
            </section>

            <section className="about-section">
              <h2>Privacy & Ethics</h2>
              <p>
                SentryAI operates exclusively within public domains, respecting privacy boundaries 
                while maintaining the highest ethical standards. We're committed to transparency, 
                responsible AI development, and creating tools that serve the greater good of 
                digital communities worldwide.
              </p>
            </section>

            <div className="about-cta">
              <h3>Join Us in Making the Internet Safer</h3>
              <p>
                Together, we can create a more secure and responsible digital landscape for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;