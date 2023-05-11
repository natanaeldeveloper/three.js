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
  intersect,
  colorInput

window.onload = () => {
  const startButton = document.querySelector('#startButton')
  startButton.addEventListener('click', init)
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#F7F7F7')
  // scene.position.set(0, -0.2, 0)

  camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 300) / window.innerHeight, 1, 1000)
  // camera.position.set(2, 1, 4)

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
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {

    // O clique intersectou um objeto na cena
    // Obtenha a face que foi clicada
    const face = intersects[0].face;

    // Obtenha a posição da face clicada em relação ao objeto
    const position = new THREE.Vector3();
    position.copy(face.normal).applyQuaternion(intersects[0].object.quaternion);
    position.multiplyScalar(0); // Defina a distância desejada da câmera em relação ao objeto

    // Defina a posição da câmera para a posição da face clicada mais a distância definida acima
    camera.position.copy(intersects[0].point).add(position);

    // Faça a câmera apontar para a face clicada
    camera.lookAt(intersects[0].point);

    const { name } = document.forms.form
    name.value = intersect.object.material.name
  }
}

function updatePosition(intersect) {
  // Obter a face selecionada
  let mesh = intersect.object
  let selectedFaceIndex = intersect.faceIndex;
  let positionAttribute = mesh.geometry.getAttribute('position');
  let normalAttribute = mesh.geometry.getAttribute('normal');
  let indexAttribute = mesh.geometry.index;

  // Obter a posição média da face selecionada
  let faceCentroid = new THREE.Vector3();
  let vA = indexAttribute.getX(selectedFaceIndex * 3);
  let vB = indexAttribute.getX(selectedFaceIndex * 3 + 1);
  let vC = indexAttribute.getX(selectedFaceIndex * 3 + 2);
  faceCentroid.fromBufferAttribute(positionAttribute, vA);
  faceCentroid.addScaledVector(faceCentroid.fromBufferAttribute(positionAttribute, vB), 1 / 3);
  faceCentroid.addScaledVector(faceCentroid.fromBufferAttribute(positionAttribute, vC), 1 / 3);

  // Converter a posição da face do espaço local para o espaço global
  faceCentroid.applyMatrix4(mesh.matrixWorld);

  // Calcular o vetor da câmera em relação à posição da face selecionada
  let cameraVector = new THREE.Vector3();
  camera.getWorldPosition(cameraVector);
  cameraVector.sub(faceCentroid);

  // Definir a nova posição da câmera para que aponte para a posição da face selecionada
  camera.position.copy(cameraVector.add(faceCentroid));

  // console.log(cameraVector.add(faceCentroid))
  // console.log(faceCentroid)

  // Apontar a câmera para a posição da face selecionada
  camera.lookAt(faceCentroid);

}

function onInput() {
  intersect.material.color.set(colorInput.value)
}

function animate() {

  requestAnimationFrame(animate)

  controls.update()
  renderer.render(scene, camera)
}