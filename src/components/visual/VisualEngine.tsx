import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { ColorManager } from './ColorManager';
import { FlowField } from './FlowField';
import { ParticleSystem } from './ParticleSystem';
import { PerspectiveCamera as ThreePerspectiveCamera } from 'three';

interface VisualEngineProps {
  className?: string;
}

function Scene() {
  console.log('Scene component mounting...');
  const { camera, viewport, size, gl } = useThree();
  const colorManager = useRef(new ColorManager()).current;
  const [isLoaded, setIsLoaded] = useState(false);

  // Force camera position and settings
  useEffect(() => {
    if (camera instanceof ThreePerspectiveCamera) {
      camera.position.set(0, 0, 30);
      camera.fov = 60;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      console.log('Camera manually updated:', {
        position: camera.position.toArray(),
        fov: camera.fov,
        aspect: camera.aspect
      });
    }
  }, [camera]);

  // Check canvas element size
  useEffect(() => {
    const canvas = gl.domElement;
    console.log('Canvas actual size:', {
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      style: {
        width: canvas.style.width,
        height: canvas.style.height
      }
    });
  }, [gl]);

  // Add camera settings logging
  useEffect(() => {
    const isPerspective = camera instanceof ThreePerspectiveCamera;
    console.log('Camera settings:', {
      position: camera.position.toArray(),
      fov: isPerspective ? camera.fov : null,
      aspect: isPerspective ? camera.aspect : null,
      near: camera.near,
      far: camera.far,
      isPerspectiveCamera: isPerspective
    });
  }, [camera]);

  // Debug logging for canvas and viewport
  useEffect(() => {
    console.log('Scene component mounted and initialized');
    const perspectiveCamera = camera as ThreePerspectiveCamera;
    console.log('Canvas Debug Info:', {
      canvas: {
        width: gl.domElement.width,
        height: gl.domElement.height,
        clientWidth: gl.domElement.clientWidth,
        clientHeight: gl.domElement.clientHeight,
        style: {
          width: gl.domElement.style.width,
          height: gl.domElement.style.height,
          position: gl.domElement.style.position
        }
      },
      viewport: {
        width: viewport.width,
        height: viewport.height,
        factor: viewport.factor,
        aspect: viewport.aspect
      },
      size: {
        width: size.width,
        height: size.height
      },
      camera: {
        position: camera.position.toArray(),
        isPerspectiveCamera: camera instanceof ThreePerspectiveCamera,
        near: camera.near,
        far: camera.far,
        fov: camera instanceof ThreePerspectiveCamera ? camera.fov : null
      }
    });
  }, [camera, viewport, size, gl]);

  useEffect(() => {
    // Set up camera with better initial position and settings
    const distance = Math.max(viewport.width, viewport.height) * 0.6; // Reduced distance for better visibility
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    if (camera instanceof ThreePerspectiveCamera) {
      camera.fov = 45; // Narrower field of view for better vertical space utilization
      camera.near = 0.1;
      camera.far = 2000;
      camera.updateProjectionMatrix();
    }
    setIsLoaded(true);
  }, [camera, viewport]);

  if (!isLoaded) return null;

  return (
    <>
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        minDistance={10}  // Adjusted for new camera distance
        maxDistance={40}  // Adjusted for new camera distance
        minPolarAngle={Math.PI / 6} // Limit vertical rotation
        maxPolarAngle={Math.PI * 5/6}
        target={[0, 0, 0]}
      />
      
      {/* Debug Grid */}
      <Grid
        args={[viewport.width * 2, viewport.height * 2]}
        position={[0, 0, -10]}
        cellSize={viewport.width * 0.1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={viewport.width * 0.5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={viewport.width}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color={colorManager.getAmbientLight()} />
      <directionalLight
        position={[viewport.width * 0.5, viewport.height * 0.5, viewport.width * 0.5]}
        intensity={1.0}
        color={colorManager.getDirectionalLight()}
      />

      {/* Visual Components */}
      <FlowField colorManager={colorManager} count={30} length={viewport.width} />
      <ParticleSystem 
        colorManager={colorManager} 
        count={5000}
        size={0.2}
      />
    </>
  );
}

export function VisualEngine({ className = '' }: VisualEngineProps) {
  console.log('VisualEngine component mounting...');
  
  useEffect(() => {
    console.log('VisualEngine component mounted and initialized');
  }, []);

  // Add canvas size logging
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    console.log('Actual canvas DOM size:', {
      offsetWidth: canvas?.offsetWidth,
      offsetHeight: canvas?.offsetHeight,
      clientWidth: canvas?.clientWidth,
      clientHeight: canvas?.clientHeight,
      boundingRect: canvas?.getBoundingClientRect()
    });
  }, []);

  return (
    <div 
      className={`fixed inset-0 w-screen h-screen bg-black ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Canvas
        dpr={[1, 2]}
        onCreated={({ camera, gl }) => {
          camera.position.set(0, 0, 25);
          if (camera instanceof ThreePerspectiveCamera) {
            camera.fov = 75;
            camera.updateProjectionMatrix();
          }
          console.log('Camera forced on creation:', camera.position);
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
} 