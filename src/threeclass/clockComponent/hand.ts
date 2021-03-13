
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
  DoubleSide,
  Clock
} from 'three'

interface HandOptions {
  /** from 0 - 360 */
  angle?: number
  color?: number
}

export default class ClockHand {
  /**
   * the angle for a hand 
   */
  renderObj: THREE.Object3D
  color: number
  clock:Clock
  setQueue:Array<number>
  private pointAngle:number
  constructor(
    { angle = 19, color = 0xff0000 }: HandOptions = {}) {
    this.color = color;
    this.pointAngle = angle;
    this.setQueue = [angle,angle];
    this.renderObj = this.initObject();
    this.clock = new Clock();

    this.update();
  }

  set angle(angle:number){
    if(angle === this.pointAngle) {
      return;
    }
    this.setQueue.push(angle);
    this.setQueue.shift();
    this.pointAngle = angle;
  }

  get angle(){
    return this.pointAngle;
  }

  /** init this hand */
  initObject(): Object3D {
    const handshape = new Shape();
    handshape.moveTo(0, -1);
    handshape.lineTo(1, 0);
    handshape.lineTo(0, 16);
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
    return mesh;
  }


  public update() {
    const delta = this.clock.getDelta();
    // 2 is the speed
    
    let realAngleChange = (this.setQueue[1] - this.setQueue[0]) * delta * 6;
    if(this.setQueue[1] < this.setQueue[0]){
      realAngleChange = ((this.setQueue[1]+360) - this.setQueue[0]) * delta * 6;
    }
    const realAngle = (this.setQueue[0] + realAngleChange);
    const rad = this.angleToRad(realAngle);
    this.setQueue[0] = realAngle;
    let radTarget = Math.PI * 2 - rad % (Math.PI * 2);

    if (this.renderObj) {
      this.renderObj.rotation.z = radTarget;
    }
    
  }

  public angleToRad(angle:number) {
    const rad = MathUtils.degToRad(angle);
    return rad;
  }
}