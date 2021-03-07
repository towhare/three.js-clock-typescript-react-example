
/**
 * three.js component Hour Hour hand
 */
import {
  ShapeGeometry,
  Shape,
  MeshBasicMaterial,
  Mesh,
  DoubleSide
} from 'three'
import ClockHand from './hand'
interface HourHandOptions {
  color?: number
  hour?: number
}
export default class HourHand extends ClockHand {
  protected hourtemp: number
  constructor({ hour = 0, color = 0x00ff00 }: HourHandOptions = {}) {
    super({color,angle:(hour/12)*360});
    this.hourtemp = hour;
  }
  initObject() {
    const handshape = new Shape();
    handshape.moveTo(0, -1);
    handshape.lineTo(1, 0);
    handshape.lineTo(0, 7);
    handshape.lineTo(-1, 0);
    handshape.lineTo(0, -1);

    const hole = new Shape();
    hole.absarc(0, 0, 0.5, 0, 2 * Math.PI, false);

    handshape.holes.push(hole);

    const geometry = new ShapeGeometry(handshape)
    const material = new MeshBasicMaterial({
      color: this.color,
      side: DoubleSide
    })
    const mesh = new Mesh(geometry, material);
    mesh.scale.set(0.1, 0.1, 0.1)

    return mesh;
  }

  set hour(hour:number){
    this.hourtemp = hour;
    this.pointAngle = this.changeHourToAngle(hour)
  }

  get hour(){
    return this.hourtemp;
  }

  private changeHourToAngle(hour:number){
    return (hour/12)*360
  }
}