
/**
 * this class is used for generate normal map using path or pixel texture
 * functions:
 * 
 * 1. input a path(related points array) then generate a heightmap using path
 * 2. input a svg file and export with a exturde geometry or a shape geometry and draw it with color
 * 3. path get several inputs including path width, inside or outside , min height, max height
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';


interface NormalMapGeneratorInput{
    width?:number,
    height?:number,
    renderer:any
}
export default class NormalMapGenerator{

    scene:any;
    /**
     * a plane camera
     */
    camera:any;

    /**
     * renderer
     */
    renderer:any;

    /**
     * therender target used in this render scene
     */
    renderTarget:any;

    textureLoader:any;
    composer:any;
    /**
     * @param {{renderer:any,width?:number:}} renderer renderer should send from outside
     */
    constructor(
        {
            renderer = null,
            width = 256,
            height = 256
        }:NormalMapGeneratorInput={
        renderer:null
    }){
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1,1,1,-1,0.1,2);
        this.initCamera();
        this.initScene();
        this.renderTarget = new THREE.WebGLRenderTarget(width,height);
        this.composer = new EffectComposer( this.renderer, this.renderTarget );
        // add the basic scene
        const renderPass = new RenderPass(this.scene, this.camera);
        // console.log('THREE.renderPass',THREE.RenderPass);
        // renderPass.clearColor = new THREE.Color(1,1,1);
        const shaderPass = new ShaderPass(this.getNormalMapShader());
        console.log('normal shaderPass', shaderPass);
        this.composer.renderToScreen = false;
        console.log('composer',this.composer)
        this.composer.addPass(renderPass);
        this.composer.addPass(shaderPass);
        this.textureLoader = new THREE.TextureLoader();
        
    }

    addATexture(mapUrl:string,callback?:Function){
        const geometry = new THREE.PlaneBufferGeometry(2,2);
        const material = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geometry,material);
        this.scene.add(mesh);
        this.textureLoader.load(mapUrl,(texture:any)=>{
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
            texture.needsUpdate = true;
            if(this.composer) {
                console.log('texture loaded and update')
                // this.update();
            }
            if(callback){
                callback(texture);
            }
        })
    }

    initCamera(){
        if(this.camera){
            this.camera.position.z = 1;
        }
    }

    initScene(){
        const geometry = new THREE.PlaneBufferGeometry( 2, 2 );
        const material = new THREE.MeshBasicMaterial({
            color:0x222222
        });
        const mesh = new THREE.Mesh(geometry,material);
        this.scene.add(mesh);
    }

    /** update the render scene and render a frame */
    update(){
        if(this.composer){
            this.composer.setSize(1024,1024);
            this.composer.render();
            
            // this.renderer.setRenderTarget(this.renderTarget);
            // this.renderer.render(this.scene,this.camera);
            // this.renderer.setRenderTarget(null);
            // console.log('composer render')
            
        }
    }

    getTexture(){
        if(this.composer){
            return this.composer.renderTarget2.texture;
        }
    }

    updateSize(width:number, height:number){
        if(this.renderTarget){
            this.renderTarget.setSize(width,height);
        }
    }

    getNormalMapShader(){
        const level = 7.3;
        const Strength = 0.14;
        let dzValue = 1.0 / Strength * (1.0 + Math.pow(2.0, level));
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
                // "  gl_FragColor = vec4(0.9,0.1,0.9,1.);",
                //"	gl_FragColor = texture2D(tDiffuse, vec2(1.0,1.0));",
                //"	gl_FragColor = texture2D(tDiffuse, vec2(0.0,0.0));",
                //"	gl_FragColor = texture2D(tDiffuse, tlv);",
                //"	gl_FragColor = vec4(texture2D(tDiffuse, vUv.xy).rgba);",
                "}"
            ].join("\n")
        
        
        };
        return NormalMapShader;
    }
}
