
/**
 * a class that create a textplane with three.js
 */
import { 
  CanvasTexture, 
  PlaneGeometry, 
  Mesh, 
  MeshBasicMaterial,
  LinearFilter
} from 'three';

interface textOptions{
  text?:string,
  /** in pixel */
  fontSize?:number,
  /** #FF00FF for example text fill style */
  fillStyle?:string,
  planeHeight?:number
}
export default class TextPlane{

  canvas:HTMLCanvasElement;
  context:CanvasRenderingContext2D|null;
  renderObj:Mesh;
  fontSize:number;
  fillStyle:string;
  planeHeight:number = 1;
  private _text:string;

  protected material: MeshBasicMaterial = new MeshBasicMaterial();

  constructor({ text = 'TEXT', fontSize = 36, fillStyle = '#222222',planeHeight=1 }: textOptions = {}){
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.fontSize = fontSize;
    this._text = text;
    
    this.fillStyle = fillStyle;
    this.planeHeight = planeHeight;
    this.renderObj = this.initMesh();
    this.text = text;
    //this.updateText(this.text);
  }

  get text(){
    return this._text;
  }

  set text(text:string){
    this._text = text;
    this.updateText(this._text);
  }
  initMesh(){
    const planeGeometry = new PlaneGeometry(this.planeHeight,this.planeHeight);
    const canvasTexture = new CanvasTexture(this.canvas);
    canvasTexture.magFilter = LinearFilter;
    canvasTexture.minFilter = LinearFilter;
    const material = new MeshBasicMaterial({
      map:canvasTexture,
      color:0xffffff,
      opacity:0.9,
      depthWrite:false,
      transparent:true
    });
    this.material = material;
    const mesh = new Mesh(planeGeometry, material);
    
    return mesh;
  }

  updateText( text:string ){
    if(this.context instanceof CanvasRenderingContext2D){
      this.context.fillStyle = this.fillStyle;
      this.context.font = this.fontSize + "px Arial bold";
      this.context.textBaseline = 'middle';
      this.context.textAlign = 'center';
      const textMetrics = this.context.measureText(text);
      const w = textMetrics.width;
      const h = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent

      
      this.canvas.width = w;
      this.canvas.height = h;
      this.context.fillStyle = this.fillStyle;
      this.context.font = this.fontSize + "px Arial bold";
      this.context.textBaseline = 'top';
      this.context.textAlign = 'center';
      this.context.fillText(text,w/2,0);
      
      
      this.renderObj.scale.x = w/h;
      //this.context.fillText(text,64,64);
      if(this.renderObj?.material){
        if(this.renderObj.material instanceof MeshBasicMaterial){
          this.renderObj.material.needsUpdate = true;
        }
      }
    }
  }
  
}