
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
export default class MiniteHand extends ClockHand{
  // constructor(){
  //   super();
  //   this.renderObj = this.initObject();
  // }
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
}