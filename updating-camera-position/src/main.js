import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import model from './male_full_body_ecorche.glb'

let scene, camera, renderer, container, controls
let gltfLoader, dracoLoader

init()

function init() {

  //Configuração da cena
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F1F1F1')

  //Configuração da camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 0, 5)
  camera.lookAt(0, 0, 0)

  //Configuração do renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  //Adiciona o renderizador a DOM
  container = document.querySelector('#root')
  container.appendChild(renderer.domElement)

  //Configuração do controlador da câmera
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.enableDamping = true

  //Configuração do mapeamento de pré-irradiação
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0).texture

  //Adicionar eventos
  window.addEventListener('resize', onResize)

  animate()

  loadModel(model)
}

function animate() {

  // Solicita o próximo ciclo de animação
  requestAnimationFrame(animate)

  //Atualiza controlador
  controls.update()

  // Renderiza a cena
  renderer.render(scene, camera)
}

function onResize() {

  // Atualiza a proporção da câmera
  camera.aspect = window.innerWidth / window.innerHeight

  // Atualiza a matriz de projeção da câmera
  camera.updateProjectionMatrix()

  //Atualiza o tamanho do renderizador
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Renderiza a cena novamente com a nova resolução
  renderer.render(scene, camera)
}

function loadModel(model) {

  //Configuração do decodificador DRACOLoader
  dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('./node_modules/three/examples/js/libs/draco/')

  //Configuração do carregar GLTFLoader
  gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  gltfLoader.load(model, (gltf) => {
    scene.add(gltf.scene)
  }, xhr => console.log((xhr.loaded / xhr.total * 100).toFixed(1) + '%'),
    error => console.error(error))
}