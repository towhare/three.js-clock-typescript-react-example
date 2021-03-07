
import { render } from '@testing-library/react';
import React, { DOMElement, useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import What from './justuse';
import Hand from '../threeclass/clockComponent/hand';
import MiniteHand from '../threeclass/clockComponent/miniteHand';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


function ThreeApplication() {
  /** render Window Container */
  const conntainerRef = useRef<HTMLHeadingElement>(null);

  /** renderer */
  const renderer = useRef<THREE.WebGLRenderer>();

  /** scene */
  const scene = useRef<THREE.Scene>();

  /** camera */
  const camera = useRef<THREE.PerspectiveCamera>();

  /** clock */
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  /** Date */
  const date = useRef<Date>(new Date());

  /** test box */
  const boxRef = useRef<THREE.Object3D>();

  const animationId = useRef<number>();

  const testHand = useRef<Hand>();

  const miniteHand = useRef<MiniteHand>();

  const controls = useRef<OrbitControls>()

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
    camera.current.position.set(0,0,10);
    camera.current.lookAt(scene.current.position);
    
    if(conntainerRef.current){
      conntainerRef.current.appendChild(renderer.current.domElement);
      window.addEventListener('resize',()=>{
        windowResize(window.innerWidth,window.innerHeight);
      })
    }

    const box = initTestItem();
    //scene.current.add(box);
    boxRef.current = box;

    const hand = new Hand({
      angle:180
    });
    testHand.current = hand;
    scene.current.add(hand.renderObj);

    miniteHand.current = new MiniteHand({
      angle:0,
      color:0xffff00
    });
    scene.current.add(miniteHand.current.renderObj);
    miniteHand.current.update();
    

    windowResize(window.innerWidth,window.innerHeight);
    initControls();
    animate();
    return ()=>{
      disposeScene();
    }
  },[]);

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
    if(testHand.current){
      const secAngle = (60-sec)/60 * 360;
      testHand.current.pointAngle = secAngle;
      testHand.current.update();
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
    return BoxMesh;
  }

  const boxUpdate = (delta:number) => {
    if(boxRef.current){
      boxRef.current.rotation.z += delta * 1;
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
