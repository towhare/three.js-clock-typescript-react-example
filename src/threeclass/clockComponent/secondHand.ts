
/**
 * three.js component minite hand
 */
 import {
  ShapeGeometry,
  Shape,
  MeshBasicMaterial,
  Mesh,
  DoubleSide
} from 'three'
import ClockHand from './hand'

interface SecondHandInput {
  second?:number,
  color?:number
}
export default class MiniteHand extends ClockHand{

  protected secondTemp:number;
  constructor({second = 0, color = 0xff00ff}:SecondHandInput = {}){
    const initSecond = MiniteHand.changeSecondeToAngle(second);
    super({color,angle:initSecond});
    this.secondTemp = initSecond;
  }

  static changeSecondeToAngle(second:number){
    return (second % 60)/60 * 360
  }

  initObject(){
    const handshape = new Shape();

    let pointsArray = [
      [-0.3,-0.5],
      [0.3,-0.5],
      [0.3,10],
      [0.7,10.5],
      [0, 12],
      [-0.7,10.5],
      [-0.3,10],
      [-0.3,-0.5]
    ]

    for(let i = 0; i < pointsArray.length; i++){
      const currentPoint = pointsArray[i]
      if(i===0){
        handshape.moveTo(currentPoint[0],currentPoint[1]);
      } else {
        handshape.lineTo(currentPoint[0],currentPoint[1]);
      }
    }

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

  get second(){
    return this.secondTemp;
  }

  set second(second){
    this.secondTemp = second;
    this.pointAngle = MiniteHand.changeSecondeToAngle(second);
  }
}