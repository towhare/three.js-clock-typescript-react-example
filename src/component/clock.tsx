import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Clock from '../threeclass/clock';
import FatLine from '../threeclass/tube';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


let NormalMapShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'resolution': { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
		'scale': { value: new THREE.Vector2( 2., 2.) },
		'height': { value: 0.05 }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform float height;',
		'uniform vec2 resolution;',
		'uniform sampler2D tDiffuse;',

		'varying vec2 vUv;',

		'void main() {',

		'	float val = texture2D( tDiffuse, vUv ).x;',

		'	float valU = texture2D( tDiffuse, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;',
		'	float valV = texture2D( tDiffuse, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;',

		'	gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );',

		'}'

	].join( '\n' )

};
function ThreeApplication() {
  /** render Window Container */
  const conntainerRef = useRef<HTMLHeadingElement>(null);

  /** renderer */
  const renderer = useRef<THREE.WebGLRenderer>();

  /** scene */
  const scene = useRef<THREE.Scene>();

  /** camera */
  const camera = useRef<THREE.OrthographicCamera>();

  /** clock used for countting delta time */
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  /** Date */
  const date = useRef<Date>(new Date());

  /** test box */
  const boxRef = useRef<THREE.Object3D>();

  const animationId = useRef<number>();

  const controls = useRef<OrbitControls>();

  const clockRenderObj = useRef<Clock>();

  const composer = useRef<EffectComposer>();

  /** */
  // init a three.js renderer camera and scene
  useEffect(()=>{
    // init renderer
    const renderertemp = new THREE.WebGLRenderer({
      antialias:false
    })

    renderer.current = renderertemp;

    renderer.current.setPixelRatio( window.devicePixelRatio );
    renderer.current.setSize(window.innerWidth, window.innerHeight);
    // init scene

    scene.current = new THREE.Scene();

    // init camera;
    //camera.current = new THREE.PerspectiveCamera(45,(window.innerWidth/window.innerHeight),0.1, 1000);
    const width = 1 ;
    const height = window.innerHeight/window.innerWidth * width;
    camera.current = new THREE.OrthographicCamera(-width,width,height,-height)
    camera.current.position.set(0,0,80);
    camera.current.lookAt(scene.current.position);
    
    if(conntainerRef.current){
      conntainerRef.current.appendChild(renderer.current.domElement);
      window.addEventListener('resize',()=>{
        windowResize(window.innerWidth,window.innerHeight);
      })
    }

    clockRenderObj.current = new Clock();
    const line = initFatLine();

    composer.current = new EffectComposer( renderer.current, new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight));
    composer.current.addPass( new RenderPass(scene.current, camera.current));

    const normalmapEffect = new ShaderPass(NormalMapShader);
    console.log('uniforms', normalmapEffect.uniforms['resolution'].value);
    //normalmapEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth,window.innerHeight);
    composer.current.addPass(normalmapEffect);

    //scene.current.add(line);
    //scene.current.add(clockRenderObj.current.renderObj);

    const tube = new FatLine([]);
    scene.current.add(tube.renderObj);


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
      if( composer.current ) {
        //composer.current.render();
      }
    }
  }

  

  // logic update
  const update = (delta:number) => {
    boxUpdate(delta)
    //clockUpdate();
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
    let hour = date.current.getHours();
    hour += (minute/60)

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
        //camera.current.aspect = width/height;
        const width = window.innerWidth ;
        const height = window.innerHeight/window.innerWidth * width;

        camera.current.bottom = -height/2;
        camera.current.top = height/2;
        camera.current.left = -width/2;
        camera.current.right = width/2;
        camera.current.updateProjectionMatrix();
      }

    }
  }

  function initFatLine(){
    const geometry = new LineGeometry();
    geometry.setPositions([
      0,0,0,
      0,10,0,
      0,10,10,
      0,10,15
    ]);
    const material = new LineMaterial({
      color:0xffffff,
      linewidth:100,
    })
    const line = new Line2( geometry, material );
    material.resolution.set(window.innerWidth, window.innerHeight);
    return line;
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
