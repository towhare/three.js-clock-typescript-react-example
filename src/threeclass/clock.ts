import * as THREE from 'three';

/**
 * THREE scene component 
 * used for render a 3D clock Object
 * input and update current time 
 */

import HourHand from './clockComponent/hourHand';
import MinuteHand from './clockComponent/minuteHand';
import SecondHand from './clockComponent/secondHand'
interface ClockInput {
  hour?: number,
  minute?: number,
  second?: number
}
export default class THREEClock {
  hour: number
  minute: number
  second: number
  protected hourHand: HourHand
  protected miniteHand: MinuteHand
  protected secondHand: SecondHand
  renderObj: THREE.Object3D
  constructor({ hour = 0, minute = 0, second = 0 }: ClockInput = {}) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
    this.hourHand = new HourHand({
      hour
    });
    this.miniteHand = new MinuteHand({
      minute
    });
    this.secondHand = new SecondHand({ second });
    this.renderObj = this.initRenderObj();
  }

  initRenderObj() {
    const clockContainer = new THREE.Group();
    clockContainer.name = 'clock';
    //add hour hand
    clockContainer.add(this.hourHand.renderObj)
    // add minite hand
    this.miniteHand.renderObj.position.z = 0.1;
    clockContainer.add(this.miniteHand.renderObj)
    // add second hand
    this.secondHand.renderObj.position.z = 0.2;
    clockContainer.add(this.secondHand.renderObj)
    return clockContainer;
  }


  // clock update function 
  update(hour:number = 0,minite:number = 0,second:number= 0 ) {
    this.hourHand.hour = hour;
    this.miniteHand.minite = minite;
    this.secondHand.second = second;
    this.hourHand.update();
    this.miniteHand.update();
    this.secondHand.update();
  }
}