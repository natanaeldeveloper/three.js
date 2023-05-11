import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import './style.css'

import model from './ford_mustang_1965_1k.glb'

let scene,
  camera,
  renderer,
  container,
  controls,
  raycaster,
  mouse,
  intersects,
  colorInput

window.onload = () => {
  const startButton = document.querySelector('#startButton')
  startButton.addEventListener('click', init)
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F7F7F7')
  scene.position.set(0, -0.2, 0)

  camera = new THREE.PerspectiveCamera(20, (window.innerWidth - 300) / window.innerHeight, 1, 1000)
  camera.position.set(2, 1, 4)

  container = document.querySelector('#render')
  container.innerHTML = ''

  renderer = new THREE.WebGLRenderer(scene, camera)
  renderer.setSize((window.innerWidth - 300), window.innerHeight)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 2
  controls.maxDistance = 10
  controls.enablePan = false;
  controls.enableDamping = true;

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0).texture

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./node_modules/three/examples/js/libs/draco/')

  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(model, function (gltf) {
    gltf.scene.castShadow = true
    scene.add(gltf.scene)
    animate()
  }, function (xhr) {
    // console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% carregado')
  },
    function (error) {
      console.error('Erro ao carregar modelo', error)
    }
  )

  animate()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  colorInput = document.querySelector('#color')

  // Adiciona os listeners de eventos
  window.addEventListener('mousemove', onMouseMove, false)
  container.addEventListener('click', onClick, false)
  colorInput.addEventListener('input', onInput)
}

function onMouseMove(event) {
  // Normaliza o mouse, que varia de -1 a 1 em vez de 0 a largura/altura
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function onClick() {
  // Configura o raio do raycaster a partir do ponto do mouse
  raycaster.setFromCamera(mouse, camera)

  // Testa se o raio intersecta com alguma face do modelo
  intersects = raycaster.intersectObjects(scene.children, true)

  const { count, names } = document.forms.form

  count.value = intersects.length
  names.value = intersects.map(obj => obj.object.material.name).join('|')
}

function onInput() {
  intersects.forEach(item => {
    item.object.material.color.set(colorInput.value)
  })
}

function animate() {

  requestAnimationFrame(animate)

  controls.update()
  renderer.render(scene, camera)
}