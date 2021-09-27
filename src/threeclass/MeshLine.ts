
import {
  CurvePath,
  Curve,
  LineCurve3,
  Vector3,
  TubeGeometry,
  MeshBasicMaterial,
  EllipseCurve,
  Mesh,
  BufferGeometry,
  InstancedBufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Matrix4,
  Group,
  MinEquation,
  MaxEquation,
  CustomBlending,
  InstancedBufferAttribute,
  Vector2,
  Object3D,
  Color,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export default class FatLine{
  renderObj:Mesh
  constructor(points:Array<number>|Float32Array){
    this.renderObj = this.initLineRoundCap(points);
  }

  initCurve(){
    const curve1 = new LineCurve3(new Vector3(0,1,0),new Vector3(1,1,0));
    const curve2 = new LineCurve3(new Vector3(1,1,0), new Vector3(1,2,0));

    const newCurvePath = new CurvePath();
    newCurvePath.add(curve1);
    newCurvePath.add(curve2);

    const curve = new EllipseCurve(0,0,10,10,0,2*Math.PI,false,0)

    const tubeGeometry = new TubeGeometry(curve1,20,4,8,false);
    const material = new MeshBasicMaterial({
      color:0xffff00
    })
    const mesh = new Mesh(tubeGeometry,material);
    return mesh
  }
  initLine(){
    // 思路 在线段上，取(1-y) 作为颜色的深度 重叠的部分也是求最大值，将材质的渲染方式变为混合 取最大值
    let positionInstance = [
      0, -0.5,0,
      1, -0.5,0,
      1, 0.5,0,
      0, -0.5,0,
      1, 0.5,0,
      0, 0.5,0
    ]
    const positions = initPoisitions(1);// 意味着几段

    function initEndPoint(array:Array<number>){
      const pointAArray = [];
      for(let i = 0; i < array.length; i+=2) {
        for(let j = 0; j < 6; j++){
          pointAArray.push(array[i], array[i+1])
        }
      }
      return new Float32Array(pointAArray);
    }

    function initSingleInstanceEndPoint(array:Array<number>){

    }

    const rawPositionData = [
      -6, 3, 0,
      -4, -3, 0,
      -4, -3, 5,
      4, 3, 5
    ]

    const pointARaw = [
      -6,0,
      6,3,
      6,6
    ];

    const pointA3DRaw = [
      -6, 3, 0,
      -4, -3, 0,
      -4, -3, 5,
    ]

    

    const pointA = initEndPoint(pointARaw);

    const pointBRaw = [
      6,3,
      6,6,
      16,12
    ];

    const pointB3DRaw = [
      -4, -3, 0,
      -4,-3, 5,
      4, 3, 5
    ]


    const pointB = initEndPoint(pointBRaw);

    const pointAMiterJoin = initEndPoint([
      -6,0,
      6,3
    ])

    const pointBMiterJoin = initEndPoint([
      6,3,
      6,6
    ])

    const pointCMiterJoin = initEndPoint([
      6,6,
      16,12
    ])

    const miterJoinInstance = [
      0,0,0,
      1,0,0,
      0,1,0,
      0,0,0,
      0,1,0,
      0,0,1
    ]

    function initMiterPositions(length:number){
      const positionArray = [];
      for(let i = 0; i < length; i++){
        positionArray.push(...miterJoinInstance)
      }
      return new Float32Array(positionArray);
    }

    // 中间的补充 由两个组成

    function initPoisitions(length:number){
      const positionArray = [];
      for(let i = 0; i < length;i++){
        positionArray.push(...positionInstance);
      }
      return new Float32Array(positionArray)
    }
    const geometry = new BufferGeometry();
    const instancedGeometry = new InstancedBufferGeometry();
    const positionInstanceArray = new Float32Array(positionInstance)

    const newInstancedPositionAttribute = new InstancedBufferAttribute(positions,3);
    const positionAttribute = new BufferAttribute(positions,3);
    const instancedPointA = new Float32Array(pointA3DRaw);
    const instancedPointB = new Float32Array(pointB3DRaw);

    instancedGeometry.setAttribute('position',positionAttribute);
    instancedGeometry.setAttribute('pointA', new InstancedBufferAttribute(instancedPointA,3));
    instancedGeometry.setAttribute('pointB', new InstancedBufferAttribute(instancedPointB,3));
    instancedGeometry.instanceCount = 3;



    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('pointA', new BufferAttribute(pointA,2));
    geometry.setAttribute('pointB', new BufferAttribute(pointB,2));


    const vertexShader = `
    varying vec2 vUv;
    attribute vec3 pointA,pointB,pointC;
    uniform mat4 projection;
    uniform float width;
    varying vec3 glposition;
    uniform vec2 resolution;
    void main(){
      vec2 xBasis = pointB - pointA;
      mat4 p;
      vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
      vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
      vec3 newPosition = vec3(point,0.0);
      vUv = position.xy*2.;
      vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
      glposition = gl_Position.xyz;
    }
    `

    const instancedBufferGeometry3D = new InstancedBufferGeometry();
    const positions3D = new Float32Array(this.roundCapJoinGeometry(16));
    instancedBufferGeometry3D.setAttribute('position',new BufferAttribute(positions3D,4));
    // instancedBufferGeometry3D.setAttribute('position2',new BufferAttribute(positions3D,4));
    instancedBufferGeometry3D.setAttribute('pointA', new InstancedBufferAttribute(instancedPointA,3))
    instancedBufferGeometry3D.setAttribute('pointB', new InstancedBufferAttribute(instancedPointB,3))
    

    const vertexShader3D = `
    varying vec2 vUv;
    attribute vec3 pointA,pointB,pointC;
    uniform mat4 projection;
    uniform float width;
    varying vec3 glposition;
    attribute vec4 position2;
    uniform vec2 resolution;
    void main(){
      vec4 clip0 = projectionMatrix * modelViewMatrix * vec4( pointA, 1. );
      vec4 clip1 = projectionMatrix * modelViewMatrix * vec4( pointB, 1. );

      vec2 screen0 = resolution * ( 0.5 * clip0.xy/clip0.w + 0.5 );
      vec2 screen1 = resolution * ( 0.5 * clip1.xy/clip1.w + 0.5 );

      vec2 xBasis = normalize( screen1 - screen0 );
      vec2 yBasis = vec2( -xBasis.y, xBasis.x );
      
      vec2 pt0 = screen0 + width * ( position.x * xBasis + position.y * yBasis );
      vec2 pt1 = screen1 + width * ( position.x * xBasis + position.y * yBasis );
      
      vec2 pt = mix( pt0, pt1, position.z );
      vec4 clip = mix( clip0, clip1, position.z );
      vUv = vec2( 0., position2.w );// 0., position2.w
      gl_Position = vec4(clip.w * ( 2.0 * pt/resolution - 1.0 ), clip.z, clip.w );
    }
    `
    let uniforms = {
      time:{value:1.0},
      projection:{value: new Matrix4()},
      color:{value:new Vector3(1,1,1)},
      width:{value: 6},
      resolution:{value: new Vector2(window.innerWidth,window.innerHeight)}
    }
    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 positionx;
      uniform float time;
      uniform vec3 color;
      varying vec3 glposition;
      uniform vec2 resolution;
      void main(){
        //vec2 st = - 1.0 + 2.0 * vUv;
        vec2 st = - 1.0 + 2.0 * (gl_FragCoord.xy/resolution);
        vec2 st1 = st + vec2(1.0/resolution.x, 0.0);
        vec2 st2 = st + vec2(0.0, 1.0/resolution.y);
        float height = abs( abs( vUv.y ) - 1.0 );
        //float valueU = height + st;
        gl_FragColor = vec4(color, 1. );//abs(vUv.y)
        //gl_FragColor = vec4(color,1.);
      }
    `

    const miterVertex = `
    varying vec2 vUv;
    attribute vec2 pointA,pointB,pointC;
    uniform float width;
    uniform mat4 projection;
    varying vec3 glposition;
    uniform vec2 resolution;
    void main(){

      vec2 tangent = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
      vec2 miter = vec2(-tangent.y, tangent.x);
      vec2 ab = pointB - pointA;
      vec2 cb = pointB - pointC;
      vec2 abNorm = normalize(vec2(-ab.y,ab.x));
      vec2 cbNorm = - normalize(vec2(-cb.y, cb.x));
      float sigma = sign(dot(ab+cb,miter));

      vec2 p0 = 0.5 * width * sigma * ( sigma < 0.0 ? abNorm : cbNorm );
      vec2 p1 = 0.5 * width * sigma * miter / dot(miter, abNorm);
      vec2 p2 = 0.5 * width * sigma * ( sigma < 0.0 ? cbNorm : abNorm );

      vec2 point = pointB + position.x * p0 + position.y * p1 + position.z * p2;
      vUv = vec2(0., max(max(position.x, position.y),position.z) );
      vec3 newPosition = vec3(point,position.y);
      vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
    `

    const material = new ShaderMaterial({
      uniforms:uniforms,
      vertexShader:vertexShader,
      fragmentShader:fragmentShader,
      transparent:true,
      blendEquation:MaxEquation,
      blending:CustomBlending,
      depthWrite:false
    })
    const basicMaterial = new MeshBasicMaterial({
      color:0xff0000
    })

    let uniforms2 = {
      time:{value:1.0},
      projection:{value: new Matrix4()},
      color:{value:new Vector3(1,1,1)},
      width:{value: 6}
    }
    const miterMaterial = new ShaderMaterial({
      uniforms:uniforms2,
      vertexShader:miterVertex,
      fragmentShader:fragmentShader,
      transparent:true,
      blendEquation:MaxEquation,
      blending:CustomBlending,
      depthWrite:false
    })

    const miterGeometry = new BufferGeometry();
    const miterPositions = initMiterPositions(2);
    miterGeometry.setAttribute('position',new BufferAttribute(miterPositions,3));
    miterGeometry.setAttribute('pointA', new BufferAttribute(pointAMiterJoin,2));
    miterGeometry.setAttribute('pointB', new BufferAttribute(pointBMiterJoin,2));
    // pointC can be used in miter mesh
    miterGeometry.setAttribute('pointC', new BufferAttribute(pointCMiterJoin,2));

    //const mesh = new Mesh(geometry,material);
    const mesh = new Mesh(instancedGeometry,material);

    const THREEDmaterial = new ShaderMaterial({
      uniforms:uniforms,
      vertexShader:vertexShader3D,
      fragmentShader:fragmentShader,
      transparent:true,
      blendEquation:MaxEquation,
      blending:CustomBlending,
      depthWrite:false
    })
    const meshIn3D = new Mesh(instancedBufferGeometry3D,THREEDmaterial);

    const miterMesh = new Mesh(miterGeometry,miterMaterial);

    const group = new Group();
    group.add(meshIn3D);


    // group.add(miterMesh);
    return group;
  }

  // generate height using vector2 points;
  initHeightMap2D(points:Array<number>,width:number){// [1,1, 2,2, 3,3, 5,6]
    const vertexShader = `
      varying vec2 vUv;
      varying float height;
      attribute vec2 pointA, pointB, pointC;
      uniform float width;
      varying vec3 glposition;
      uniform vec2 resolution;
      void main(){
        vec2 xBasis = pointB - pointA;
        mat4 p;
        vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
        vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
        vec3 newPosition = vec3(point,0.0);
        vUv = position.xy*2.;
        vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
        glposition = gl_Position.xyz;
      }
    `
    
    const miterVertex = `
    varying vec2 vUv;
    attribute vec2 pointA,pointB,pointC;
    uniform float width;
    uniform mat4 projection;
    varying vec3 glposition;
    uniform vec2 resolution;
    void main(){

      vec2 tangent = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
      vec2 miter = vec2(-tangent.y, tangent.x);
      vec2 ab = pointB - pointA;
      vec2 cb = pointB - pointC;
      vec2 abNorm = normalize(vec2(-ab.y,ab.x));
      vec2 cbNorm = - normalize(vec2(-cb.y, cb.x));
      float sigma = sign(dot(ab+cb,miter));

      vec2 p0 = 0.5 * width * sigma * ( sigma < 0.0 ? abNorm : cbNorm );
      vec2 p1 = 0.5 * width * sigma * miter / dot(miter, abNorm);
      vec2 p2 = 0.5 * width * sigma * ( sigma < 0.0 ? cbNorm : abNorm );

      vec2 point = pointB + position.x * p0 + position.y * p1 + position.z * p2;
      vUv = vec2(0., max(max(position.x, position.y),position.z) );
      vec3 newPosition = vec3(point,position.y);
      vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
    `

    const fragmentShader = `
      varying vec2 vUv;
      uniform vec3 color;
      varying vec3 glposition;
      varying float height;
      void main(){
        vec2 st = - 1.0 + 2.0 * gl_FragCoord;
        float height = ( color * abs ( abs, vUv.y ) - 1. );
        gl_FragColor = vec4(color * abs( abs( vUv.y ) - 1. ) , 1. );
      }
    `
    // basic line geometry
    const positionInstance = [
      0, -0.5, 0,
      1, -0.5, 0,
      1, 0.5, 0,
      0, -0.5, 0,
      1, 0.5, 0,
      0, 0.5, 0
    ]
    const basicLineGeometry = new InstancedBufferGeometry();
    const basicPositions = new Float32Array(positionInstance);
    basicLineGeometry.setAttribute('position', new BufferAttribute(basicPositions,3));


    // pointA attribute and pointB attribute
    let pointA = [];
    let pointB = [];
    for( let i = 0; i < ( points.length - 2 ); i+=2 ){
      pointA.push( points[i], points[i+1] );
      pointB.push( points[i+2], points[i+3] )
    }


    basicLineGeometry.setAttribute( 'pointA', new InstancedBufferAttribute( new Float32Array( pointA ), 2 ) );
    basicLineGeometry.setAttribute( 'pointB', new InstancedBufferAttribute( new Float32Array( pointB ), 2 ) );
    basicLineGeometry.instanceCount = Math.floor(points.length/2-1);

    // uniform
    const uniforms = {
      color:{value:new Vector3(1,1,1)},
      width:{value:width}
    }

    const material = new ShaderMaterial({
      uniforms,
      vertexShader:vertexShader,
      fragmentShader:fragmentShader,
      transparent:true,
      blendEquation:MaxEquation,
      blending:CustomBlending,
      depthWrite:false
    })

  }

  initMiterLine2D(points:Array<number>){
    let positionInsance = [
      0, -0.5, 0,
      1, -0.5, 0,
      1, 0.5, 0,
      0, -0.5, 0,
      1, 0.5, 0,
      0, 0.5, 0
    ]
    
    // 创建前后的节点或者前中后的节点，* 6倍
    function initEndPoint(array:Array<number>){
      const pointLength = Math.floor(array.length/2);
      const pointAArray = [];
      for(let i = 0; i < array.length; i+=2) {
        for(let j = 0; j < 6; j++){
          pointAArray.push(array[i], array[i+1])
        }
      }
      return new Float32Array(pointAArray);
    }
    
    const baseLineGeometry = new BufferGeometry();
    
  }

  roundCapJoinGeometry(resolution:number) {
    const instanceRoundRound = [
      0, -0.5, 0, -1,
      0, -0.5, 1, -1,
      0, 0.5, 1, 1,
      0, -0.5, 0, -1,
      0, 0.5, 1, 1,
      0, 0.5, 0, 1
    ];
    // Add the left cap.
    for (let step = 0; step < resolution; step++) {
      const theta0 = Math.PI / 2 + ((step + 0) * 1 * Math.PI) / resolution;
      const theta1 = Math.PI / 2 + ((step + 1) * 1 * Math.PI) / resolution;
      instanceRoundRound.push(0, 0, 0, 0);
      instanceRoundRound.push(
        0.5 * Math.cos(theta0),
        0.5 * Math.sin(theta0),
        0,
        1
      );
      instanceRoundRound.push(
        0.5 * Math.cos(theta1),
        0.5 * Math.sin(theta1),
        0,
        1
      );
    }
    // Add the right cap.
    for (let step = 0; step < resolution; step++) {
      const theta0 = (3 * Math.PI) / 2 + ((step + 0) * 1 * Math.PI) / resolution;
      const theta1 = (3 * Math.PI) / 2 + ((step + 1) * 1 * Math.PI) / resolution;
      instanceRoundRound.push(0, 0, 1, 0.);
      instanceRoundRound.push(
        0.5 * Math.cos(theta0),
        0.5 * Math.sin(theta0),
        1,
        1
      );
      instanceRoundRound.push(
        0.5 * Math.cos(theta1),
        0.5 * Math.sin(theta1),
        1,
        1
      );
    }
    return instanceRoundRound
  }

  initLineRoundCap(rawPositionData:Array<number>|Float32Array = [-6, 3, 0,
    -4, -3, 0,
    -4, -3, 5,
    4, 3, 5]){

    let positionInstance = [
      0, -0.5,0,
      1, -0.5,0,
      1, 0.5,0,
      0, -0.5,0,
      1, 0.5,0,
      0, 0.5,0
    ]


    const pointA = [];
    const pointB = [];
    for(let i = 0; i < rawPositionData.length-3; i++){
      pointA.push( rawPositionData[i]);
    }
    for(let i = 3; i< rawPositionData.length; i++){
      pointB.push(rawPositionData[i] );
    }
    
    const instancedGeometry = new InstancedBufferGeometry();
    const instancedPointA = new Float32Array(pointA);
    const instancedPointB = new Float32Array(pointB);

    const points = new Float32Array()

    const tempuv = new Float32Array([0,0.5,0.5,0.75,0.75,1.0])
    const square = [
      0, -0.5, 0, -1,
      0, -0.5, 1, -1,
      0, 0.5, 1, 1,
      0, -0.5, 0, -1,
      0, 0.5, 1, 1,
      0, 0.5, 0, 1
    ]
    const positions3D = new Float32Array(this.roundCapJoinGeometry(8));// this.roundCapJoinGeometry(16)
    instancedGeometry.setAttribute('uv',new InstancedBufferAttribute(tempuv,2));
    instancedGeometry.setAttribute('position', new BufferAttribute(positions3D,4));
    instancedGeometry.setAttribute('pointA', new InstancedBufferAttribute(instancedPointA,3));
    instancedGeometry.setAttribute('pointB', new InstancedBufferAttribute(instancedPointB,3));

    instancedGeometry.instanceCount = 3;
    console.log('pointA count', instancedGeometry.attributes.pointA.count)


    const vertexShader3D = `
    varying vec2 vUv;
    attribute vec3 pointA,pointB,pointC;
    uniform mat4 projection;
    uniform float width;
    varying vec3 glposition;
    attribute float instanceDistanceStart;
    attribute float instanceDistanceEnd;
    uniform vec2 resolution;
    uniform float totalLength;
    void main(){
      float repeatDashLength = 2.;
      float dashLength = 2.;

      float startFract = fract(instanceDistanceStart/repeatDashLength);
      vec3 ABNormalized = normalize( pointB - pointA );

      vec4 totalResult;
      for( float currentPosition = startFract; currentPosition < ( instanceDistanceEnd - instanceDistanceStart ); ){
        vec3 realPositionA = pointA + ( currentPosition - repeatDashLength ) * ABNormalized;
        vec3 realPositionB = pointA + ( currentPosition - repeatDashLength + dashLength ) * ABNormalized; 

        vec3 pointBOffset = vec3( realPositionB.x - realPositionA.x, realPositionB.y - realPositionA.y, realPositionB.z - realPositionA.z );
        vec3 pointBFixed = realPositionA + pointBOffset;

        vec4 clip0 = projectionMatrix * modelViewMatrix * vec4( realPositionA, 1. );
        vec4 clip1 = projectionMatrix * modelViewMatrix * vec4( realPositionB, 1. );

        vec2 screen0 = resolution * ( 0.5 * clip0.xy/clip0.w + 0.5 );
        vec2 screen1 = resolution * ( 0.5 * clip1.xy/clip1.w + 0.5 );

        vec2 xBasis = normalize( screen1 - screen0 );
        vec2 yBasis = vec2( -xBasis.y, xBasis.x );
        
        vec2 pt0 = screen0 + width * ( position.x * xBasis + position.y * yBasis );
        vec2 pt1 = screen1 + width * ( position.x * xBasis + position.y * yBasis );
        
        vec2 pt = mix( pt0, pt1, position.z );
        vec4 clip = mix( clip0, clip1, position.z );
        vUv = vec2( mix(instanceDistanceStart, instanceDistanceEnd, position.z)/totalLength );// uv.x + position.z * (uv.y - uv.x), position.y
        vec4 theResult = vec4(clip.w * ( 2.0 * pt/resolution - 1.0 ), clip.z, clip.w );
        totalResult += theResult ;

        currentPosition += repeatDashLength;
      }
      // gl_Position = totalResult;

        vec3 pointBOffset = vec3( pointB.x - pointA.x, pointB.y - pointA.y, pointB.z - pointA.z );
        vec3 pointBFixed = pointA + pointBOffset;

        vec4 clip0 = projectionMatrix * modelViewMatrix * vec4( pointA, 1. );
        vec4 clip1 = projectionMatrix * modelViewMatrix * vec4( pointB, 1. );

        vec2 screen0 = resolution * ( 0.5 * clip0.xy/clip0.w + 0.5 );
        vec2 screen1 = resolution * ( 0.5 * clip1.xy/clip1.w + 0.5 );

        vec2 xBasis = normalize( screen1 - screen0 );
        vec2 yBasis = vec2( -xBasis.y, xBasis.x );
        
        vec2 pt0 = screen0 + width * ( position.x * xBasis + position.y * yBasis );
        vec2 pt1 = screen1 + width * ( position.x * xBasis + position.y * yBasis );
        
        vec2 pt = mix( pt0, pt1, position.z );
        vec4 clip = mix( clip0, clip1, position.z );
        vUv = vec2( mix(instanceDistanceStart, instanceDistanceEnd, position.z)/totalLength );// uv.x + position.z * (uv.y - uv.x), position.y
        gl_Position = vec4(clip.w * ( 2.0 * pt/resolution - 1.0 ), clip.z, clip.w );
      
    }
    `;
    let uniforms = {
      time:{value:1.0},
      projection:{value: new Matrix4()},
      color:{value:new Color(0xffff00)},
      width:{value: 200},
      resolution:{value: new Vector2(window.innerWidth,window.innerHeight)},
      totalLength:{value: 1}
    }
    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 positionx;
      uniform float time;
      uniform vec3 color;
      varying vec3 glposition;
      uniform vec2 resolution;
      uniform float totalLength;
      void main(){
        //vec2 st = - 1.0 + 2.0 * vUv;
        vec2 st = - 1.0 + 2.0 * (gl_FragCoord.xy/resolution);
        vec2 st1 = st + vec2(1.0/resolution.x, 0.0);
        vec2 st2 = st + vec2(0.0, 1.0/resolution.y);
        float height = abs( abs( vUv.y ) - 1.0 );
        //float valueU = height + st;
        gl_FragColor = vec4( color * vUv.x, 1.0 );//abs(vUv.y) mod(color * vUv.x * totalLength  ,1.)
        //gl_FragColor = vec4(color,1.);
      }
    `

    const lineMaterial = new ShaderMaterial({
      uniforms:uniforms,
      vertexShader:vertexShader3D,
      fragmentShader:fragmentShader,
      transparent:true,
      // blendEquation:MaxEquation,
      // blending:CustomBlending,
      depthWrite:false,
      depthTest:false
    })

    const lineMesh = new Mesh(instancedGeometry,lineMaterial)
    this.computeLineDistances(instancedGeometry,uniforms);
    return lineMesh;
  }

  
  computeLineDistances(geometry?:InstancedBufferGeometry,uniforms?:any){
    if(geometry){
      const instanceStart = geometry.attributes.pointA;
      const instanceEnd = geometry.attributes.pointB;
      const lineDistances = new Float32Array( 2 * instanceStart.count );

      let start = new Vector3();
      let end = new Vector3();
      for( let i = 0, j = 0, l = instanceStart.count; i < l; i++, j +=2 ){
        start.fromBufferAttribute( instanceStart, i );
        end.fromBufferAttribute( instanceEnd, i );

        lineDistances[j] = (j===0) ? 0 : lineDistances[ j - 1 ];
        lineDistances[j+1] = lineDistances[j] + start.distanceTo(end);

      }
      const instanceDistanceBuffer = new InstancedInterleavedBuffer( lineDistances, 2, 1 );

      geometry.setAttribute('instanceDistanceStart', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) );
      geometry.setAttribute('instanceDistanceEnd', new InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) );
      if(uniforms){
        uniforms.totalLength.value = lineDistances[lineDistances.length-1];
      }
    }
  }

  roundCapJoinLine(points:Array<number>){
    const geometry = new InstancedBufferGeometry();
  }
}