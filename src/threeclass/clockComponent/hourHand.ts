
/**
 * three.js component Hour Hour hand
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
import HandOptions from './hand';
interface HourHandOptions{
  color?:number
  hour?:number
}
export default class HourHand extends ClockHand{
  hour:number
  constructor({hour = 0,color=0x00ff00}:HourHandOptions={}){
    super();
    this.hour = hour;
    this.color = color;
    this.renderObj = this.initObject();
  }
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