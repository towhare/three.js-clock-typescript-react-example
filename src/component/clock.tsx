import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Clock from '../threeclass/clock'

function ThreeApplication() {
  /** render Window Container */
  const conntainerRef = useRef<HTMLHeadingElement>(null);

  /** renderer */
  const renderer = useRef<THREE.WebGLRenderer>();

  /** scene */
  const scene = useRef<THREE.Scene>();

  /** camera */
  const camera = useRef<THREE.PerspectiveCamera>();

  /** clock used for countting delta time */
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  /** Date */
  const date = useRef<Date>(new Date());

  /** test box */
  const boxRef = useRef<THREE.Object3D>();

  const animationId = useRef<number>();

  const controls = useRef<OrbitControls>();

  const clockRenderObj = useRef<Clock>();

  /** */
  // init a three.js renderer camera and scene
  useEffect(()=>{
    // init renderer
    const renderertemp = new THREE.WebGLRenderer({
      antialias:true
    })

    renderer.current = renderertemp;

    // init scene

    scene.current = new THREE.Scene();

    // init camera;
    camera.current = new THREE.PerspectiveCamera(45,(window.innerWidth/window.innerHeight),0.1, 1000);
    camera.current.position.set(0,0,40);
    camera.current.lookAt(scene.current.position);
    
    if(conntainerRef.current){
      conntainerRef.current.appendChild(renderer.current.domElement);
      window.addEventListener('resize',()=>{
        windowResize(window.innerWidth,window.innerHeight);
      })
    }

    const box = initTestItem();
    boxRef.current = box;

    clockRenderObj.current = new Clock();
    scene.current.add(clockRenderObj.current.renderObj)


    windowResize(window.innerWidth,window.innerHeight);
    initControls();
    animate();
    return ()=>{
      disposeScene();
    }
  });

  // init orbit controller
  const initControls = () => {
    if(camera.current && renderer.current){
      controls.current = new OrbitControls(camera.current,renderer.current.domElement);
    }
  }

  // animation
  const animate = () => {
    if(clock.current){
      const delta = clock.current.getDelta();
      update(delta);
    }
    render();
    animationId.current = requestAnimationFrame(animate)
  }

  // render scene function
  const render = () => {
    if(renderer.current && camera.current && scene.current){
      renderer.current.render(scene.current, camera.current);
    }
  }

  // logic update
  const update = (delta:number) => {
    boxUpdate(delta)
    clockUpdate();
  }

  // disposeScene when component unmount
  function disposeScene(){
    if(renderer.current){
      if(!!animationId.current){
        // stop rendering
        cancelAnimationFrame(animationId.current);
      }
      // remove domelement
      if(conntainerRef.current) {
        conntainerRef.current.removeChild(renderer.current.domElement);
      }
      //
      renderer.current.dispose();
      renderer.current.forceContextLoss();
    }
  }

  /* update clock*/ 
  const clockUpdate = () => {
    date.current = new Date();
    const sec = date.current.getSeconds();
    const minute = date.current.getMinutes();
    const hour = date.current.getHours();

    if(clockRenderObj.current){
      clockRenderObj.current.update(hour,minute,sec);
    }
  }

  // reset renderer size and canvas size
  function windowResize(width:number,height:number){
    if(conntainerRef.current &&  renderer.current){
      renderer.current.domElement.width = width;
      renderer.current.domElement.height = height;

      renderer.current.setSize(width,height);

      renderer.current.domElement.width = width;
      renderer.current.domElement.height = height;

      renderer.current.domElement.style.width = '100%';
      renderer.current.domElement.style.height = '100%';

      // update camera
      if(camera.current){
        camera.current.aspect = width/height;
        camera.current.updateProjectionMatrix();
      }

    }
  }

  const initTestItem = () => {
    const boxGeometry = new THREE.BoxBufferGeometry();
    const boxMeshBasicRedMaterial = new THREE.MeshBasicMaterial({
      color:0xff0000
    })

    const BoxMesh = new THREE.Mesh(boxGeometry,boxMeshBasicRedMaterial);
    BoxMesh.position.x = 2;
    BoxMesh.position.y = 2;
    BoxMesh.rotateX(Math.PI/8);
    return BoxMesh;
  }

  const boxUpdate = (delta:number) => {
    if(boxRef.current){
      boxRef.current.rotation.x += delta * 1;
    }
  }

  return (
    <div className="renderContainer" style={
      {
        width:'100%',
        height:'100%',
        position:'fixed',
        top:0,
        left:0,
      }
    } 
    ref={conntainerRef}
    >
    </div>
  );
}

export default ThreeApplication;
