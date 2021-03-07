
/**
 * three.js component minute hand
 */
 import {
  ShapeGeometry,
  Shape,
  MeshBasicMaterial,
  Mesh,
  DoubleSide
} from 'three'
import ClockHand from './hand'

interface MinuteHandOptions{
  /** minite number from 0 to 60 */
  minute?:number,
  color?:number
}
export default class MinuteHand extends ClockHand{
  protected miniteTemp:number
  constructor({color = 0xff0000, minute = 0}:MinuteHandOptions ={}){
    const m = MinuteHand.getAngleFromMinite(minute);
    super({color, angle:m});
    this.miniteTemp = minute;
  }
  // change minite to angle degree
  static getAngleFromMinite(minute:number){
    return (minute/60)*360;
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

  get minite(){
    return this.miniteTemp;
  }

  set minite(min) {
    this.miniteTemp = min;
    this.pointAngle = MinuteHand.getAngleFromMinite(min);
  }
}