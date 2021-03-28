
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
  BufferAttribute,
  ShaderMaterial,
  Matrix4
} from 'three'

export default class Tube{
  renderObj:Mesh
  constructor(){
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
    let positionInstance = [
      0, -0.5,0,
      1, -0.5,0,
      1, 0.5,0,
      0, -0.5,0,
      1, 0.5,0,
      0, 0.5,0
    ]
    const positions = initPoisitions(4);

    function initEndPoint(array:Array<number>){
      const pointAArray = [];
      for(let i = 0; i < array.length; i+=2) {
        for(let j = 0; j < 6; j++){
          pointAArray.push(array[i], array[i+1])
        }
      }
      return new Float32Array(pointAArray);
    }

    const pointA = initEndPoint([
      -6,0,
      6,3,
      6,6
    ]);
    const pointB = initEndPoint([
      6,3,
      6,6,
      16,12
    ]);

    function initPoisitions(length:number){
      const positionArray = [];
      for(let i = 0; i < length;i++){
        positionArray.push(...positionInstance);
      }
      return new Float32Array(positionArray)
    }
    const vertices = new Float32Array( [
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
    
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0
    ] );
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions,3));
    geometry.setAttribute('pointA', new BufferAttribute(pointA,2));
    geometry.setAttribute('pointB', new BufferAttribute(pointB,2));
    const vertexShader = `
    varying vec2 vUv;
    // attribute vec2 position;
    attribute vec2 pointA,pointB;
    uniform mat4 projection;
    varying vec2 testColor;
    void main(){
      float width = 5.0;
      vUv = uv;
      //vec2 po = positionx * 10.;
      vec2 xBasis = pointB - pointA;
      mat4 p;
      vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
      vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
      vec3 newPosition = vec3(point,0.0);
      vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
      testColor = modelViewPosition.xy;
      gl_Position = projectionMatrix * modelViewPosition;// modelViewPosition;
      //gl_Position = projection * vec4(point,0.,1.)；
    }
    `
    let uniforms = {
      time:{value:1.0},
      projection:{value: new Matrix4()},
      color:{value:new Vector3(0,1,0)}
    }
    const fragmentShader = `
      varying vec2 testColor;
      varying vec2 vUv;
      varying vec3 positionx;
      uniform float time;
      uniform vec3 color;
      void main(){
        vec2 st = - 1.0 + 2.0 * vUv;
        gl_FragColor = vec4(color,1.0);
      }
    `

    const material = new ShaderMaterial({
      uniforms:uniforms,
      vertexShader:vertexShader,
      fragmentShader:fragmentShader
    })
    const basicMaterial = new MeshBasicMaterial({
      color:0xff0000
    })

    const mesh = new Mesh(geometry,material);
    return mesh;
  }
}