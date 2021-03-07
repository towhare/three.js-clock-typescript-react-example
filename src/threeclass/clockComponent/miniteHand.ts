
/**
 * three.js component hour hand
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
import ClockHand from './hand'
export default class MiniteHand extends ClockHand{
  // constructor(){
  //   super();
  //   this.renderObj = this.initObject();
  // }
  initObject(){
    const handshape = new Shape();
    handshape.moveTo(0,-1);
    handshape.lineTo(1,0);
    handshape.lineTo(0,10);
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
}