import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

import starsImg from '../imgs/stars.jpg'
import nebulaImg from '../imgs/nebula.jpg'

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
// scene.background = textureLoader.load(textureLoader)

const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
  starsImg,
  starsImg,
  nebulaImg,
  nebulaImg,
  nebulaImg,
  nebulaImg,
])

const box2MultMesh = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaImg) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaImg) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsImg) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(starsImg) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaImg) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebulaImg) }),
]

const box2Geometry = new THREE.BoxGeometry(4, 4, 4)

// const box2Material = new THREE.MeshStandardMaterial({
//   color: 0x00FF00,
//   map: textureLoader.load(nebulaImg)
// })

// const box2 = new THREE.Mesh(box2Geometry, box2Material)

const box2 = new THREE.Mesh(box2Geometry, box2MultMesh)

scene.add(box2)
box2.position.set(-7, 5, 0)
box2.name = 'box2'

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

let mousePosition = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1
})

const sphereId = 12

const rayCaster = new THREE.Raycaster()

const plane2Geometry = new THREE.PlaneGeometry(20, 20, 10, 10)
const plane2Material = new THREE.MeshBasicMaterial({
  wireframe: true
})
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material)
scene.add(plane2)
plane2.position.set(10, 20, 0)

const lastPointZ = plane2.geometry.attributes.position.array.length - 1

function animate(time) {

  box.rotation.x = time / 1000
  box.rotation.y = time / 1000

  step += options.speed

  sphere.position.x = 10 * Math.abs(Math.sin(step))
  sphere.position.y = 10 * Math.abs(Math.sin(step))

  spotLight.angle = options.angle
  spotLight.penumbra = options.penumbra
  spotLight.intensity = options.intensity
  sLightHelper.update()

  rayCaster.setFromCamera(mousePosition, camera)
  const intersects = rayCaster.intersectObjects(scene.children)
  console.log(intersects)

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id == sphereId) {
      intersects[i].object.material.color.set('#D42EF2')
    }

    if (intersects[i].object.name == 'box2') {
      box2.rotation.x = time / 1000
      box2.rotation.y = time / 1000
    }
  }

  plane2.geometry.attributes.position.array[0] = 10 * Math.random()
  plane2.geometry.attributes.position.array[1] = 10 * Math.random()
  plane2.geometry.attributes.position.array[2] = 10 * Math.random()

  plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random()
  plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random()
  plane2.geometry.attributes.position.array[lastPointZ] = 10 * Math.random()

  plane2.geometry.attributes.position.needsUpdate = true


  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)
