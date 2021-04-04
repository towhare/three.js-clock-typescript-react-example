
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
  InstancedBufferAttribute
} from 'three'

export default class FatLine{
  renderObj:Group
  constructor(points:Array<number>){
    this.renderObj = this.initLine();
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
    const positions = initPoisitions(3);// 意味着几段

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
      -6,0,
      6,3,
      6,6,
      16,12
    ]
    const pointARaw = [
      -6,0,
      6,3,
      6,6
    ];

    const pointA = initEndPoint(pointARaw);

    const pointBRaw = [
      6,3,
      6,6,
      16,12
    ];

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
    const instancedPointA = new Float32Array(pointARaw);
    const instancedPointB = new Float32Array(pointBRaw);

    instancedGeometry.setAttribute('position',positionAttribute);
    instancedGeometry.setAttribute('pointA', new InstancedBufferAttribute(instancedPointA,2));
    instancedGeometry.setAttribute('pointB', new InstancedBufferAttribute(instancedPointB,2));
    instancedGeometry.instanceCount = 3;

    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('pointA', new BufferAttribute(pointA,2));
    geometry.setAttribute('pointB', new BufferAttribute(pointB,2));


    const vertexShader = `
    varying vec2 vUv;
    attribute vec2 pointA,pointB,pointC;
    uniform mat4 projection;
    uniform float width;
    void main(){
      vec2 xBasis = pointB - pointA;
      mat4 p;
      vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
      vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
      vec3 newPosition = vec3(point,0.0);
      vUv = position.xy*2.;
      vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }
    `
    let uniforms = {
      time:{value:1.0},
      projection:{value: new Matrix4()},
      color:{value:new Vector3(1,0.,0.5)},
      width:{value: 6}
    }
    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 positionx;
      uniform float time;
      uniform vec3 color;
      void main(){
        vec2 st = - 1.0 + 2.0 * vUv;
        //gl_FragColor = vec4(color * abs(abs(vUv.y)-1.0) ,abs(vUv.y) );
        gl_FragColor = vec4(color,1.);
      }
    `

    const miterVertex = `
    varying vec2 vUv;
    attribute vec2 pointA,pointB,pointC;
    uniform float width;
    uniform mat4 projection;
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
      vec3 newPosition = vec3(point,0.0);
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
    miterGeometry.setAttribute('pointC', new BufferAttribute(pointCMiterJoin,2));

    //const mesh = new Mesh(geometry,material);
    const mesh = new Mesh(instancedGeometry,material);

    const miterMesh = new Mesh(miterGeometry,miterMaterial);

    const group = new Group();
    group.add(mesh);
    group.add(miterMesh);
    return group;
  }

  initMiterLine(points:Array<number>){
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
}