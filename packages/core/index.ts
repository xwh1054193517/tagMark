import merge from 'lodash/merge'

export interface markOptions{
    canvasId:string,
    width?:number,
    height?:number,
    imgUrl:string
    scale?:number
    wheelScale?:boolean
}
export interface rectsOptions{
    x:number,
    y:number,
    width:number,
    height:number,
    isEditing?:boolean,
    rotatable?:boolean,
    rotateAngle?:number
}
class TagMarkTools{
    default:markOptions={
        canvasId:'markTool',
        width:1000,
        height:700,
        imgUrl:'',
        scale:1,
        wheelScale:true ,
    }
    options:markOptions
    canvas:HTMLCanvasElement
    context:CanvasRenderingContext2D|null
    imageSource!: HTMLImageElement
    scaleXY:{scaleX:number,scaleY:number}
    translateXY:{translateX:number,translateY:number}
    rects:rectsOptions[]
    drawingRect:any
    startXY:{startX:number,startY:number}
    editRect:any;
    tagsOpen:boolean;
    constructor(receiveOptions:markOptions){
        this.options=merge({},this.default,receiveOptions)

        //赋值canvas和context
        this.canvas=document.getElementById(this.options.canvasId) as HTMLCanvasElement
        this.context=this.canvas?this.canvas.getContext('2d'):null
        this.scaleXY={scaleX:0,scaleY:0}
        this.translateXY={translateX:0,translateY:0}
        this.rects=[]
        this.drawingRect = null;
        this.editRect = null;
        this.tagsOpen=true
        this.startXY={startX:0,startY:0}

  
        this.drawPic()
        this.setWheelEvent()
        this.setTagsEvent()
    }

    //渲染图片
    drawPic(){
        const {imgUrl}=this.options
        if(!imgUrl)return
        this.imageSource=new Image()
        this.imageSource.src=imgUrl
        this.imageSource.onload=()=>{
            this.drawReal()
        }
    }

    // 重新渲染画布
    drawReal(){
        const {width,height}=this.canvas
        const {scale}=this.options
        const {scaleX,scaleY}=this.scaleXY

        if(!this.context)return
        console.warn('drawReal')

        this.context.clearRect(0,0,width,height)
        // 保存缩放前的状态
        this.context.save()


        //缩放X,Y轴 先把缩放原点移动到鼠标处
        this.context.translate(scaleX,scaleY)
        this.context.scale(scale!,scale!)


        //缩放完成 再把缩放原点移动到左上角
        this.context.translate(-scaleX,-scaleY)



        this.context!.drawImage(this.imageSource,0,0,width,height)

        this.drawTags()
        // 恢复缩放前的状态
        this.context.restore()
    }

    // 缩放开关
    toggleWheel(){
        const {wheelScale}=this.options
        this.options.wheelScale=!wheelScale
        this.setWheelEvent()
    }
    //设置缩放事件
    setWheelEvent(){
       const {wheelScale}=this.options
       if(wheelScale){
        console.log('开启缩放')
        this.canvas.addEventListener('wheel',this.wheelScaleEvent.bind(this),{passive:false})
       }else{
        console.log('关闭缩放')
        this.canvas.removeEventListener('wheel',this.wheelScaleEvent)
       }
    }

    //缩放事件
    wheelScaleEvent(event:any){
        if (event.altKey) {
          event.preventDefault(); // prevent zoom
          if (event.deltaY < 0) {
            if ( this.options.scale! < 10) {
                this.scaleXY={
                    scaleX:event.offsetX,
                    scaleY:event.offsetY,
                }
                this.options.scale = Math.min( this.options.scale! + 0.5, 10);
              this.drawReal();
            }
          } else {
            if ( this.options.scale! > 1) {
                this.scaleXY={
                    scaleX:event.offsetX,
                    scaleY:event.offsetY,
                }
                this.options.scale = Math.max( this.options.scale! - 0.5, 1);
              this.drawReal();
            }
          }
        }
    }

    // 移动视口事件
    moveEvent(event:any){

    }

    //标注
    drawTags(){
        //矩形标注
        this.rects.forEach((r)=>{
            //标注颜色
            this.context!.strokeStyle=r.isEditing?"rgba(255,0,0,0.5)":"rgba(255,0,0)"
            this.context?.save()
            if(r.rotatable){
                //先找旋转中心
                this.context!.translate(r.x+r.width/2,r.y+r.height/2);
                // 在旋转
                this.context!.rotate((r.rotateAngle!*Math.PI)/180)
                // 恢复中心位置
                this.context!.translate(-(r.x+r.width/2),-(r.y+r.height/2));
            }
            this.context!.strokeRect(r.x,r.y,r.width,r.height)
            this.context!.restore()
        })
        if (this.drawingRect) {
            this.context!.strokeRect(
              this.drawingRect.x,
              this.drawingRect.y,
              this.drawingRect.width,
              this.drawingRect.height
            );
          }
    }
       // 标记开关
    toggleTags(){
        this.tagsOpen=!this.tagsOpen
        this.setTagsEvent()
    }
    // 设置标注事件
    setTagsEvent(){
        if(this.tagsOpen){  
            this.canvas.addEventListener("mousedown", this.mouseDownEvent.bind(this));
            this.canvas.addEventListener("mousemove", this.mouseMoveEvent.bind(this));
            this.canvas.addEventListener("mouseup", this.mouseUpEvent.bind(this));  
        }else{
            this.canvas.removeEventListener('mousedown',this.mouseDownEvent)
            this.canvas.removeEventListener('mousemove',this.mouseMoveEvent)
            this.canvas.removeEventListener('mouseup',this.mouseUpEvent)
        }
    }
    mouseDownEvent(e:any){
        this.startXY={
            startX:e.offsetX,
            startY:e.offsetY
        }
        const { x, y } = this.computexy(e.offsetX, e.offsetY);
        console.log("mousedown", e.offsetX, e.offsetY, x, y);
        this.drawingRect = this.drawingRect || {};
    }
    mouseMoveEvent(e:any){
        const {startX,startY}=this.startXY
        if (this.drawingRect) {
        this.context!.strokeStyle="rgba(255,0,0)"
          this.drawingRect = this.computeRect({
            x: startX,
            y: startY,
            width: e.offsetX - startX,
            height: e.offsetY - startY,
          });
          this.drawReal();
          return;
        }
    }
    mouseUpEvent(e:any){
        if (this.drawingRect) {
            this.drawingRect = null;
            // 如果绘制的矩形太小，则不添加，防止原地点击时添加矩形
            // 如果反向绘制，则调整为正向
            const {startX,startY}=this.startXY
            const width = Math.abs(e.offsetX - startX);
            const height = Math.abs(e.offsetY - startY);
            if (width > 1 || height > 1) {
              const newrect = this.computeRect({
                x: Math.min(startX, e.offsetX),
                y: Math.min(startY, e.offsetY),
                width,
                height,
              });
              this.rects.push(newrect);
              this.drawReal();
            }
            return;
          }
    }
    computexy(x:number, y:number) {
        const {scale}=this.options
        const{scaleX,scaleY}=this.scaleXY
        const {translateX,translateY}=this.translateXY
        const xy = {
          // x: x / scale - translateX,
          // y: y / scale - translateY,
          x: (x - scaleX * (1 - scale!) - translateX * scale!) / scale!,
          y: (y - scaleY * (1 - scale!) - translateY * scale!) / scale!,
        };
        return xy;
    }
    computewh(width:number, height:number) {
        const {scale}=this.options
        return {
          width: width / scale!,
          height: height / scale!,
        };
    }
    computeRect(rect:rectsOptions) {
        const cr = {
          ...this.computexy(rect.x, rect.y),
          ...this.computewh(rect.width, rect.height),
        };
        // console.log("computeRect", rect, cr);
        return cr;
    }
}
export {TagMarkTools}