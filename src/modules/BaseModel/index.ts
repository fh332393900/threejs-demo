import type { Object3DExtends } from '@/types';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import type { Material } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import type Viewer from '../Viewer';
import type { Animate } from '../Viewer';

export default class BaseModel {
  protected viewer: Viewer;
  public gltf: GLTF;
  public object: THREE.Group;
  /**模型原始材质 */
  public originMaterials: Material[] = [];
  public isSaveMaterial: boolean = false;
  public animaIndex: number = -1;
  public mixer!: THREE.AnimationMixer;
  public clock: THREE.Clock;
  public animaObject!: Animate;

  constructor(gltf: GLTF, viewer: Viewer) {
    this.gltf = gltf;
    this.viewer = viewer;
    this.object = gltf.scene || gltf;

    this.clock = new THREE.Clock();
  }
  /**
  * 设置模型比例
  * @param x 可以只填写一个参数
  * @param y 纵轴缩放
  * @param z 横轴缩放
  */
  public setScalc(x: number, y?: number, z?: number) {
    this.object.scale.set(x, y || x, z || x);
  }

  public getLength() {
    const box = new THREE.Box3();
    box.setFromObject(this.object);
    const size = box.getSize(new THREE.Vector3());
    return size;
  }

  /**
  * 设置模型动画
  * @param i 选择模型动画进行播放
  */
  public startAnima(i = 0) {
    this.animaIndex = i;
    if (!this.mixer) this.mixer = new THREE.AnimationMixer(this.object);
    if (this.gltf.animations.length < 1) return;
    this.mixer.clipAction(this.gltf.animations[i]).play();
    // 传入参数需要将函数与函数参数分开，在运行时填入
    this.animaObject = {
      fun: this.updateAnima,
      content: this,
    };
    this.viewer.addAnimate(this.animaObject);
  }

  private updateAnima(e: any) {
    e.mixer.update(e.clock.getDelta());
  }

  /**
   * 克隆模型
   * @param x
   * @param y
   * @param z
   * @returns {*}
   */
  public cloneModel([x, y, z] = [0, 0, 0]) {
    const newScene = { ...this.gltf };
    const newModel = clone(this.object);
    newModel.position.set(x, y, z);
    this.viewer.scene.add(newModel);
    newScene.scene = newModel as any;
    return new BaseModel(newScene, this.viewer);
  }

  /**
   * 开启模型阴影 数组中移除阴影
   */
  public openCastShadow(names = []) {
    this.gltf.scene.traverse((model: Object3DExtends) => {
      if (model.isMesh && !names.includes(model.name as never)) {
        model.frustumCulled = false;
        model.castShadow = true;
      }
    });
  }

  /**设置模型颜色 */
  public setColor(color = 'yellow', opacity = 0.5) {
    if (!this.isSaveMaterial) this.originMaterials = [];
    this.gltf.scene.traverse((model: Object3DExtends) => {
      if (model.isMesh) {
        if (!this.isSaveMaterial) this.originMaterials.push(model.material as Material);
        model.material = new THREE.MeshPhongMaterial({
          side: THREE.DoubleSide,
          transparent: true,
          depthTest: false,
          depthWrite: true, // 无法被选择，鼠标穿透
          color: new THREE.Color(color),
          opacity: opacity,
        });
      }
    });
    this.isSaveMaterial = true;
  }

  /**设置模型材质 */
  public setMaterial(material = new THREE.MeshBasicMaterial()) {
    if (!this.isSaveMaterial) this.originMaterials = [];
    this.gltf.scene.traverse((model: Object3DExtends) => {
      if (model.isMesh) {
        if (!this.isSaveMaterial) this.originMaterials.push(model.material as Material);
        model.material = material;
      }
    });
    this.isSaveMaterial = true;
  }

  // 还原模型材质
  public setDefault() {
    let i = 0;
    this.gltf.scene.traverse((model: Object3DExtends) => {
      if (model.isMesh) {
        model.material = this.originMaterials[i];
        i++;
      }
    });
  }
}
