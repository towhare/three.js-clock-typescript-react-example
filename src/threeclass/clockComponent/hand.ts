
/**
 * basic hand class
 */
import {
  ShapeGeometry,
  Object3D,
  MathUtils,
  Shape,
  MeshBasicMaterial,
  Mesh,
  DoubleSide
} from 'three'

interface HandOptions{
  /** from 0 - 360 */
  angle?:number
  color?:number
}

export default class ClockHand{
  /**
   * the angle for a hand 
   */
  pointAngle:number
  renderObj:THREE.Object3D
  color:number
  constructor(
    {angle = 19,color = 0xff0000}:HandOptions = {}){
    this.color = color;
    this.pointAngle = angle;
    this.renderObj = this.initObject();
    this.update();
  }

  /** init this hand */
  initObject():Object3D{
    const handshape = new Shape();
    handshape.moveTo(0,-1);
    handshape.lineTo(1,0);
    handshape.lineTo(0,16);
    handshape.lineTo(-1,0);
    handshape.lineTo(0,-1);

    const hole = new Shape();
    hole.absarc(0,0,0.5,0,2*Math.PI,false);

    handshape.holes.push(hole);

    const geometry = new ShapeGeometry(handshape)
    const material = new MeshBasicMaterial({
      color:this.color,
      side:DoubleSide
    })
    const mesh = new Mesh(geometry, material);
    mesh.scale.set(0.1,0.1,0.1)
    
    return mesh;
  }

  public update(){
    const rad = this.angleToRad();
    if(this.renderObj) {
      this.renderObj.rotation.z = rad
    }
  }

  private angleToRad(){
    const rad = MathUtils.degToRad(this.pointAngle);
    return rad;
  }
}