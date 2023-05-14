import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

import starsImg from '../imgs/stars.jpg'

const renderer = new THREE.WebGLRenderer()

renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 20, 40)

const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 })
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)
box.receiveShadow = true

const sphereGeometry = new THREE.SphereGeometry(5, 30, 30)
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#6AC0D8'),
  wireframe: false,
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
sphere.position.set(-10, 10, 0)
sphere.castShadow = true

const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFFFFF,
  side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI
plane.receiveShadow = true

const gridHelper = new THREE.GridHelper(30)
scene.add(gridHelper)

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
// scene.add(directionalLight)
// directionalLight.position.set(-20, 20, 0)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.top = 10
// directionalLight.shadow.camera.bottom = -10

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add(dLightHelper)

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dLightShadowHelper)

const spotLight = new THREE.SpotLight(0xFFFFFF, 0.5)
scene.add(spotLight)
spotLight.position.set(-100, 100, 0)
spotLight.castShadow = true
spotLight.penumbra = 0

const sLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(sLightHelper)

//adicionar névoa
// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200) // cor|mínimo|máximo
// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01) // cor|valor exponencial

// renderer.setClearColor('#DCFF00')

const textureLoader = new THREE.TextureLoader()
scene.background = textureLoader.load(starsImg)

const gui = new dat.GUI()

const options = {
  sphereColor: '#6AC0D8',
  wireframe: false,
  speed: 0.01,
  angle: 0.2,
  penumbra: 0,
  intensity: 1,
}

gui.addColor(options, 'sphereColor').onChange(e => {
  sphere.material.color.set(e)
})

gui.add(options, 'wireframe').onChange(e => {
  sphere.material.wireframe = e
})

gui.add(options, 'speed', 0.01, 0.1)

gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 0, 1)

let step = 0
let speed = 0.01

function animate(time) {

  box.rotation.x = time / 1000
  box.rotation.y = time / 1000

  step += options.speed

  console.log(sphere.position.y)

  sphere.position.x = 10 * Math.abs(Math.sin(step))
  sphere.position.y = 10 * Math.abs(Math.sin(step))

  if (sphere.position.y <= 4) {

  } else {
    // sphere.position.x = 10 * Math.abs(Math.sin(step))
    // sphere.position.y = 10 * Math.abs(Math.sin(step))
  }

  spotLight.angle = options.angle
  spotLight.penumbra = options.penumbra
  spotLight.intensity = options.intensity
  sLightHelper.update()

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)
