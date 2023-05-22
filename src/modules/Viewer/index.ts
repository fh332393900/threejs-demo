import { 
  Scene,
  PerspectiveCamera,
  AxesHelper,
  WebGLRenderer,
  Camera,
  SRGBColorSpace,
  AmbientLight,
  Raycaster,
  Vector2
} from 'three';
import * as THREE from 'three';
import mitt, { type Emitter } from 'mitt';
import Events from './Events';
import { throttle } from 'lodash-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import SkyBoxs from '../SkyBoxs';

export type Animate = {
  fun: (arg: any) => any,
  content: any,
}

export default class Viewer {
  public id: string;
  public viewerDom!: HTMLElement;
  public scene!: Scene;
  public camera!: PerspectiveCamera;
  public renderer!: WebGLRenderer;
  public controls!: OrbitControls;
  public skyboxs!: SkyBoxs;
  public animateEventList: any[] = [];
  public statsControls!: Stats;
  public raycaster!: Raycaster;
  public mouse!: Vector2;
  public emitter!: Emitter<any>;
  public mouseEvent: MouseEvent | undefined;
  public raycasterObjects: THREE.Object3D[] = [];
  public isDestroy: boolean = false;
  
  constructor(id: string) {
    this.id = id;
    this.initViewer();
  }
  /**坐标轴辅助 */
  public addAxis() {
    const axis = new AxesHelper(1000);
    this.scene?.add(axis);
  }

  public addAnimate(animate: Animate) {
    this.animateEventList.push(animate);
  }
  /**
  * 添加性能状态监测
  */
  public addStats() {
    if (!this.statsControls) this.statsControls = new Stats();
    this.statsControls.dom.style.position = 'absolute';
    this.viewerDom.appendChild(this.statsControls.dom);

    // 添加到动画
    this.addAnimate({
      fun: this.statsUpdate,
      content: this.statsControls,
    });
  }

  /**注册鼠标事件监听 */
  public initRaycaster() {
    this.raycaster = new Raycaster();

    const initRaycasterEvent: Function = (eventName: keyof HTMLElementEventMap): void => {
      const funWrap = throttle(
        (event: any) => {
          this.mouseEvent = event;
          this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
          // @ts-expect-error
          this.emitter.emit(Events[eventName].raycaster, this.getRaycasterIntersectObjects());
        },
        50
      );
      this.viewerDom.addEventListener(eventName, funWrap, false);
    };

    initRaycasterEvent('click');
    initRaycasterEvent('dblclick');
    initRaycasterEvent('mousemove');
  }

  /**销毁场景 */
  public destroy() {
    this.scene.traverse((child: any) => {
      if (child.material) {
        child.material.dispose();
      }
      if (child.geometry) {
        child.geometry.dispose();
      }
      child = null;
    });
    this.renderer.forceContextLoss();
    this.renderer.dispose();
    this.scene.clear();

    this.isDestroy = true;
  }

  private statsUpdate(statsControls: any) {
    statsControls.update();
  }

  private initViewer() {
    this.emitter = mitt();

    this.initRenderer();
    this.initScene();
    this.initLight();
    this.initCamera();
    this.initControl();
    this.initSkybox();

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    const animate = () => {
      if (this.isDestroy) return;
      requestAnimationFrame(animate);

      this.updateDom();
      this.readerDom();
      
      // 全局的公共动画函数，添加函数可同步执行
      this.animateEventList.forEach(event => {
        // event.fun && event.content && event.fun(event.content);
        if (event.fun && event.content) {
          event.fun(event.content);
        }
      });
    };

    animate();
  }

  private initScene() {
    this.scene = new Scene();
  }

  private initCamera() {
    // 渲染相机
    this.camera = new PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 2000);
    //设置相机位置
    this.camera.position.set(4, 2, -3);
    //设置相机方向
    this.camera.lookAt(0, 0, 0);
  }

  private initRenderer() {
    // 获取画布dom
    this.viewerDom = document.getElementById(this.id) as HTMLElement;
    // 初始化渲染器
    this.renderer = new WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true, // true/false表示是否开启反锯齿
      alpha: true, // true/false 表示是否可以设置背景色透明
      precision: 'mediump', // highp/mediump/lowp 表示着色精度选择
      premultipliedAlpha: true, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率）
      // preserveDrawingBuffer: false, // true/false 表示是否保存绘图缓冲
      // physicallyCorrectLights: true, // true/false 表示是否开启物理光照
    });
    this.renderer.clearDepth();

    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = SRGBColorSpace; // 可以看到更亮的材质，同时这也影响到环境贴图。
    this.viewerDom.appendChild(this.renderer.domElement);
  }

  private initControl() {
    this.controls = new OrbitControls(
      this.camera as Camera,
      this.renderer?.domElement
    );
    this.controls.enableDamping = false;
    this.controls.screenSpacePanning = false; // 定义平移时如何平移相机的位置 控制不上下移动
    this.controls.minDistance = 2;
    this.controls.maxDistance = 1000;
    this.controls.addEventListener('change', ()=>{
      this.renderer.render(this.scene, this.camera);
    });
  }

  private initSkybox() {
    if (!this.skyboxs) this.skyboxs = new SkyBoxs(this);
    this.skyboxs.addSkybox('night');
    this.skyboxs.addFog();
  }

  private initLight() {
    const ambient = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 200, 100 );
    light.castShadow = true;

    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.left = -120;
    light.shadow.camera.right = 400;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 400;
    // 设置mapSize属性可以使阴影更清晰，不那么模糊
    light.shadow.mapSize.set(1024, 1024);

    this.scene.add(light);
  }

  // 渲染dom
  private readerDom() {
    this.renderer?.render(this.scene as Scene, this.camera as Camera);
  }

  private updateDom() {
    this.controls.update();
    // 更新参数
    this.camera.aspect = this.viewerDom.clientWidth / this.viewerDom.clientHeight; // 摄像机视锥体的长宽比，通常是使用画布的宽/画布的高
    this.camera.updateProjectionMatrix(); // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用,来使得这些改变生效
    this.renderer.setSize(this.viewerDom.clientWidth, this.viewerDom.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比
  }

  /**自定义鼠标事件触发的范围，给定一个模型组，对给定的模型组鼠标事件才生效 */
  public setRaycasterObjects (objList: THREE.Object3D[]): void {
    this.raycasterObjects = objList;
  }
  
  private getRaycasterIntersectObjects(): THREE.Intersection[] {
    if (!this.raycasterObjects.length) return [];
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.raycasterObjects, true);
  }
}
