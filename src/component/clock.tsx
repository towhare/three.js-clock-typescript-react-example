import { useEffect, useRef } from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Clock from '../threeclass/clock';
import FatLine from '../threeclass/MeshLine';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import  NormalMapGenerator from '../renderTool/NormalmapGenerator'
const level = 7.3;
const Strength = 0.14
let dzValue = 1.0 / Strength * (1.0 + Math.pow(2.0, level))
let NormalMapShader = {

	uniforms: {

		// 'tDiffuse': { value: null },
		// 'resolution': { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
		// 'scale': { value: new THREE.Vector2( 2., 2.) },
		// 'height': { value: 0.05 },
    "type": 		{type: "1i", value: 0},// 0 sobel 1 Scharr
    "invertR": 		{type: "1f", value: 1},
    "invertG": 		{type: "1f", value: 1},
    "invertH": 		{type: "1f", value: 1},
    "dz":           {type: "1f", value:dzValue},
    "dimensions": 	{type: "fv", value: [window.innerWidth, window.innerHeight, 0]},
    "tDiffuse": 	{type: "t", value: null }
	},

  vertexShader: [
		"precision mediump float;",
        "varying vec2 vUv;",
		"varying vec2 step;",
        "uniform vec3 dimensions;",
        "void main() {",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"step = vec2(-1.0 / dimensions.x, -1.0 / dimensions.y);", // - to switch from glsl orientation to my orientation :D
			"vUv = uv;",
		"}"
	].join("\n"),

	fragmentShader: [
		"precision mediump float;",
        "uniform vec3 dimensions;",
        "varying vec2 vUv;",
        "varying vec2 step;",
        "uniform float dz;",
        "uniform float invertR;",
        "uniform float invertG;",
        "uniform float invertH;",
        "uniform int type;",
		"uniform sampler2D tDiffuse;",
        
		"void main(void) {",
		"	vec2 tlv = vec2(vUv.x - step.x, vUv.y + step.y );", 
		"	vec2 lv  = vec2(vUv.x - step.x, vUv.y 		   );",
		"	vec2 blv = vec2(vUv.x - step.x, vUv.y - step.y);",	
		"	vec2 tv  = vec2(vUv.x 		  , vUv.y + step.y );", 
		"	vec2 bv  = vec2(vUv.x 		  , vUv.y - step.y);",
		"	vec2 trv = vec2(vUv.x + step.x, vUv.y + step.y );", 
		"	vec2 rv  = vec2(vUv.x + step.x, vUv.y 		   );",
		"	vec2 brv = vec2(vUv.x + step.x, vUv.y - step.y);",
		"	tlv = vec2(tlv.x >= 0.0 ? tlv.x : (1.0 + tlv.x), 	tlv.y >= 0.0	? tlv.y : (1.0  + tlv.y));",
		"	tlv = vec2(tlv.x < 1.0  ? tlv.x : (tlv.x - 1.0 ), 	tlv.y < 1.0   	? tlv.y : (tlv.y - 1.0 ));",
		"	lv  = vec2( lv.x >= 0.0 ?  lv.x : (1.0 + lv.x),  	lv.y  >= 0.0 	?  lv.y : (1.0  +  lv.y));",
		"	lv  = vec2( lv.x < 1.0  ?  lv.x : ( lv.x - 1.0 ),   lv.y  < 1.0  	?  lv.y : ( lv.y - 1.0 ));",
		"	blv = vec2(blv.x >= 0.0 ? blv.x : (1.0 + blv.x), 	blv.y >= 0.0 	? blv.y : (1.0  + blv.y));",
		"	blv = vec2(blv.x < 1.0  ? blv.x : (blv.x - 1.0 ), 	blv.y < 1.0 	? blv.y : (blv.y - 1.0 ));",
		"	tv  = vec2( tv.x >= 0.0 ?  tv.x : (1.0 + tv.x),  	tv.y  >= 0.0 	?  tv.y : (1.0  +  tv.y));",
		"	tv  = vec2( tv.x < 1.0  ?  tv.x : ( tv.x - 1.0 ),   tv.y  < 1.0 	?  tv.y : ( tv.y - 1.0 ));",
		"	bv  = vec2( bv.x >= 0.0 ?  bv.x : (1.0 + bv.x),  	bv.y  >= 0.0 	?  bv.y : (1.0  +  bv.y));",
		"	bv  = vec2( bv.x < 1.0  ?  bv.x : ( bv.x - 1.0 ),   bv.y  < 1.0 	?  bv.y : ( bv.y - 1.0 ));",
		"	trv = vec2(trv.x >= 0.0 ? trv.x : (1.0 + trv.x), 	trv.y >= 0.0 	? trv.y : (1.0  + trv.y));",
		"	trv = vec2(trv.x < 1.0  ? trv.x : (trv.x - 1.0 ), 	trv.y < 1.0   	? trv.y : (trv.y - 1.0 ));",
		"	rv  = vec2( rv.x >= 0.0 ?  rv.x : (1.0 + rv.x),  	rv.y  >= 0.0 	?  rv.y : (1.0  +  rv.y));",
		"	rv  = vec2( rv.x < 1.0  ?  rv.x : ( rv.x - 1.0 ),   rv.y  < 1.0   	?  rv.y : ( rv.y - 1.0 ));",
		"	brv = vec2(brv.x >= 0.0 ? brv.x : (1.0 + brv.x), 	brv.y >= 0.0 	? brv.y : (1.0  + brv.y));",
		"	brv = vec2(brv.x < 1.0  ? brv.x : (brv.x - 1.0 ), 	brv.y < 1.0   	? brv.y : (brv.y - 1.0 ));",
		/*"	tlv = vec2(tlv.x >= 0.0 		 ? tlv.x : (dimensions.x - tlv.x), 	tlv.y >= 0.0			? tlv.y : (dimensions.y - tlv.y));",
		"	tlv = vec2(tlv.x < dimensions.x  ? tlv.x : (tlv.x - dimensions.x ), tlv.y <= dimensions.y   ? tlv.y : (tlv.y - dimensions.y  ));",
		"	lv  = vec2( lv.x >= 0.0  		 ?  lv.x : (dimensions.x - lv.x),  	lv.y >= 0.0 			?  lv.y : (dimensions.y - lv.y));",
		"	lv  = vec2( lv.x < dimensions.x  ?  lv.x : ( lv.x - dimensions.x ), lv.y <= dimensions.y   	?  lv.y : ( lv.y - dimensions.y  ));",
		"	blv = vec2(blv.x >= 0.0  		 ? blv.x : (dimensions.x - blv.x), 	blv.y >= 0.0 			? blv.y : (dimensions.y - blv.y));",
		"	blv = vec2(blv.x < dimensions.x  ? blv.x : (blv.x - dimensions.x ), blv.y <= dimensions.y  	? blv.y : (blv.y - dimensions.y  ));",
		"	tv  = vec2( tv.x >= 0.0  		 ?  tv.x : (dimensions.x - tv.x),  	tv.y >= 0.0 			?  tv.y : (dimensions.y - tv.y));",
		"	tv  = vec2( tv.x < dimensions.x  ?  tv.x : ( tv.x - dimensions.x ), tv.y <= dimensions.y  	?  tv.y : ( tv.y - dimensions.y  ));",
		"	bv  = vec2( bv.x >= 0.0  		 ?  bv.x : (dimensions.x - bv.x),  	bv.y >= 0.0 			?  bv.y : (dimensions.y - bv.y));",
		"	bv  = vec2( bv.x < dimensions.x  ?  bv.x : ( bv.x - dimensions.x ), bv.y <= dimensions.y  	?  bv.y : ( bv.y - dimensions.y  ));",
		"	trv = vec2(trv.x >= 0.0  		 ? trv.x : (dimensions.x - trv.x), 	trv.y >= 0.0 			? trv.y : (dimensions.y - trv.y));",
		"	trv = vec2(trv.x < dimensions.x  ? trv.x : (trv.x - dimensions.x ), trv.y <= dimensions.y   ? trv.y : (trv.y - dimensions.y  ));",
		"	rv  = vec2( rv.x >= 0.0 		 ?  rv.x : (dimensions.x - rv.x),  	rv.y >= 0.0 			?  rv.y : (dimensions.y - rv.y));",
		"	rv  = vec2( rv.x < dimensions.x  ?  rv.x : ( rv.x - dimensions.x ), rv.y <= dimensions.y    ?  rv.y : ( rv.y - dimensions.y  ));",
		"	brv = vec2(brv.x >= 0.0 		 ? brv.x : (dimensions.x - brv.x), 	brv.y >= 0.0 			? brv.y : (dimensions.y - brv.y));",
		"	brv = vec2(brv.x < dimensions.x  ? brv.x : (brv.x - dimensions.x ), brv.y <= dimensions.y    ? brv.y : (brv.y - dimensions.y  ));",*/
		"	float tl = abs(texture2D(tDiffuse, tlv).r);", 
		"	float l  = abs(texture2D(tDiffuse, lv ).r);",
		"	float bl = abs(texture2D(tDiffuse, blv).r);",	
		"	float t  = abs(texture2D(tDiffuse, tv ).r);", 
		"	float b  = abs(texture2D(tDiffuse, bv ).r);",
		"	float tr = abs(texture2D(tDiffuse, trv).r);", 
		"	float r  = abs(texture2D(tDiffuse, rv ).r);",
		"	float br = abs(texture2D(tDiffuse, brv).r);",
		"   float dx = 0.0, dy = 0.0;",
		"   if(type == 0){",	// Sobel
		"		dx = tl + l*2.0 + bl - tr - r*2.0 - br;",
		"		dy = tl + t*2.0 + tr - bl - b*2.0 - br;",
		"   }",
		"   else{",				// Scharr
		"		dx = tl*3.0 + l*10.0 + bl*3.0 - tr*3.0 - r*10.0 - br*3.0;",
		"		dy = tl*3.0 + t*10.0 + tr*3.0 - bl*3.0 - b*10.0 - br*3.0;",
		"   }",
		"	vec4 normal = vec4(normalize(vec3(dx * invertR * invertH * 255.0, dy * invertG * invertH * 255.0, dz)), texture2D(tDiffuse, vUv).a);",
		"	gl_FragColor = vec4(normal.xy * 0.5 + 0.5, normal.zw);",
		//"	gl_FragColor = texture2D(tDiffuse, vec2(1.0,1.0));",
		//"	gl_FragColor = texture2D(tDiffuse, vec2(0.0,0.0));",
		//"	gl_FragColor = texture2D(tDiffuse, tlv);",
		//"	gl_FragColor = vec4(texture2D(tDiffuse, vUv.xy).rgba);",
		"}"
	].join("\n")


};
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

  const composer = useRef<EffectComposer>();

  const normalCreator = useRef<NormalMapGenerator>();

  /** */
  // init a three.js renderer camera and scene
  useEffect(()=>{
    // init renderer
    const renderertemp = new THREE.WebGLRenderer({
      antialias:true
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
    camera.current = new THREE.PerspectiveCamera(60,height,1,100);
    camera.current.position.set(0,0,50);
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
    //console.log('uniforms', normalmapEffect.uniforms['resolution'].value);
    //normalmapEffect.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth,window.innerHeight);
    composer.current.addPass(normalmapEffect);

    //scene.current.add(line);
    //scene.current.add(clockRenderObj.current.renderObj);

    const tube = new FatLine(new Float32Array([0,0,0,2,0,0,2,8,0]));
    scene.current.add(tube.renderObj);
    // addAtestFile();
    // addNormalMap();

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
    if(normalCreator.current){
      normalCreator.current.update();
    }
    if(renderer.current && camera.current && scene.current){
      renderer.current.render(scene.current, camera.current);
      if( composer.current ) {
        // composer.current.render();
      }
    }
  }

  function addAtestFile(){
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('/alert.png');
    const geometry = new THREE.PlaneBufferGeometry(225,225);
    const material = new THREE.MeshBasicMaterial({
      map:map
    })
    const mesh = new THREE.Mesh(geometry,material);
    if(scene.current){
      scene.current.add(mesh);
    }
  }

  function addNormalMap(){
    const normalCreator2 = new NormalMapGenerator({
      renderer:renderer.current,
      width:512,
      height:512
    });
    normalCreator2.update();
    const texture = normalCreator2.getTexture();

    const planeGeometry = new THREE.PlaneBufferGeometry(225,225);
    const material = new THREE.MeshBasicMaterial({
      map:texture
    })
    const planeMesh = new THREE.Mesh(planeGeometry,material);

    planeMesh.position.set(225,0,0);
    if(scene.current){
      scene.current.add(planeMesh);
    }
    normalCreator2.addATexture('/alert.png',()=>{
      normalCreator2.update();
    })
    normalCreator.current = normalCreator2;
    
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

        // camera.current.bottom = -height/2;
        // camera.current.top = height/2;
        // camera.current.left = -width/2;
        // camera.current.right = width/2;

        camera.current.aspect = window.innerWidth/window.innerHeight;
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
