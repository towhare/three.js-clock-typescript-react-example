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
      hour,
      color:0xf78b60
    });
    this.miniteHand = new MinuteHand({
      minute,
      color:0xcb8e26
    });
    this.secondHand = new SecondHand({ 
      second,
      color:0x70bd68 });
    this.renderObj = this.initRenderObj();
  }

  initRenderObj() {
    const clockContainer = new THREE.Group();
    clockContainer.name = 'clock';
    //add hour hand
    clockContainer.add(this.hourHand.renderObj)
    // add minite hand
    this.miniteHand.renderObj.position.z = 0.01;
    clockContainer.add(this.miniteHand.renderObj)
    // add second hand
    this.secondHand.renderObj.position.z = 0.02;
    clockContainer.add(this.secondHand.renderObj);

    const background = this.initBackground();
    clockContainer.add(background);
    const points = this.initSigns();
    clockContainer.add(points);

    return clockContainer;
  }

  initBackground(){

    const textureLoader = new THREE.TextureLoader();
    const backgroundImage = textureLoader.load('/rabbit.png')
    const geometry = new THREE.CircleGeometry( 14, 64 );
    const material = new THREE.MeshBasicMaterial({
      color:0xffffff,
      side:THREE.DoubleSide,
      map:backgroundImage
    });
    const backgroundCircle = new THREE.Mesh(geometry,material);
    backgroundCircle.position.z = -0.02;
    backgroundCircle.name = 'circleBackground';
    return backgroundCircle
  }

  initSigns(){
    const pointsGroup = new THREE.Group();
    const singleCircleGeometry = new THREE.CircleGeometry(0.3,32);
    const material = new THREE.MeshBasicMaterial({
      color:0x000000,
      side:THREE.DoubleSide
    })
    const point = new THREE.Mesh(singleCircleGeometry,material);

    const smallPlaneGeometry = new THREE.PlaneGeometry(0.15,0.7);
    const smallPlane = new THREE.Mesh(smallPlaneGeometry,material);
    
    const z = 0;
    const radius = 13;
    const smallAngle = Math.PI /30;
    for(let i = 0; i < 12; i++){
      const pointCloned = point.clone();
      const angle = (Math.PI * 2 * (12-i))/12 + (4/3) * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      pointCloned.position.set(x,y,z);

      for(let j = 0 ; j < 4; j++){
        const ang = angle + smallAngle*(j+1);
        const smallX = Math.cos(ang) * radius;
        const smallY = Math.sin(ang) * radius;
        const smallPlaneCloned = smallPlane.clone();
        
        
        smallPlaneCloned.position.set(smallX,smallY,z);
        smallPlaneCloned.rotation.z = ang +Math.PI/2;
        pointsGroup.add(smallPlaneCloned);
      }

      pointsGroup.add(pointCloned)
    }
    return pointsGroup;

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