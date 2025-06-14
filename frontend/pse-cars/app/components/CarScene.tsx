'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {DRACOLoader, GLTFLoader, RGBELoader} from 'three/examples/jsm/Addons.js';

interface ObjectWithMaterial {
  material: object;
}

const lights = [
  "/configurator/light/blouberg_sunrise_2_1k.hdr",
  "/configurator/light/lobe.hdr",
  "/configurator/light/moonless_golf_1k.hdr", // cool
  "/configurator/light/pedestrian_overpass_1k.hdr",
  "/configurator/light/quarry_01_1k.hdr",
  "/configurator/light/royal_esplanade_1k.hdr", // cool autohaus
  "/configurator/light/san_giuseppe_bridge_2k.hdr",
  "/configurator/light/spot1Lux.hdr", // ziemlich dunkel aber cool
  "/configurator/light/spruit_sunrise_1k.hdr",
  "/configurator/light/venice_sunset_1k.hdr",
]

export default function CarScene({
  color,
  detailsColor,
  glassColor,
}: {
  color: string;
  detailsColor: string;
  glassColor: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const detailsMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const glassMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    if (!containerRef.current) return

    const canvasHeight = window.innerHeight / 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, canvasHeight)
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setAnimationLoop(animate)
    containerRef.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / canvasHeight, 0.1, 100);
    renderer.setSize(window.innerWidth, canvasHeight);
    // camera.position.set(4.25, 1.4, -4.5)
    camera.position.set(-4, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxDistance = 5
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90)
    controls.target.set(0, 0.5, 0)
    controls.update()

    const wheels: THREE.Object3D[] = []

    new RGBELoader()
      .load(lights[9], (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.environment = texture
      })
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);



    const bodyMaterial = new THREE.MeshPhysicalMaterial({color: color, metalness: 1, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.03,})
    bodyMaterialRef.current = bodyMaterial;
    const detailsMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.5 })
    detailsMaterialRef.current = detailsMaterial;
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1 })
    glassMaterialRef.current = glassMaterial;

    const shadowTex = new THREE.TextureLoader().load('/configurator/ferrari_ao.png')

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    loader.load('/configurator/ferrari.glb', (gltf) => {
      const car = gltf.scene.children[0];


      (car.getObjectByName('body') as unknown as ObjectWithMaterial).material = bodyMaterial

      for (const name of ['rim_fl', 'rim_fr', 'rim_rr', 'rim_rl', 'trim']) {
        (car.getObjectByName(name) as unknown as ObjectWithMaterial).material = detailsMaterial
      }

      (car.getObjectByName('glass') as unknown as ObjectWithMaterial).material = glassMaterial

      wheels.push(
        car.getObjectByName('wheel_fl')!,
        car.getObjectByName('wheel_fr')!,
        car.getObjectByName('wheel_rl')!,
        car.getObjectByName('wheel_rr')!
      )

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({ map: shadowTex, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true })
      )
      mesh.rotation.x = -Math.PI / 2
      mesh.renderOrder = 2
      car.add(mesh)

      scene.add(car)
    })

    window.addEventListener('resize', () => {
      const newCanvasHeight = window.innerHeight / 2;

      camera.aspect = window.innerWidth / newCanvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, newCanvasHeight);
    })

    function animate() {
      const time = -performance.now() / 1000
      wheels.forEach((wheel) => {
        wheel.rotation.x = time * Math.PI * 2 / 100
      })
      renderer.render(scene, camera)
    }

    return () => {
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.color.set(color);
    }
  }, [color]);

  useEffect(() => {
    if (detailsMaterialRef.current) {
      detailsMaterialRef.current.color.set(detailsColor);
    }
  }, [detailsColor]);

  useEffect(() => {
    if (glassMaterialRef.current) {
      glassMaterialRef.current.color.set(glassColor);
    }
  }, [glassColor]);

  return <div ref={containerRef}
              style={{height: "50vh", width: "100vw"}}
              // className="w-full h-screen"
  />
}
