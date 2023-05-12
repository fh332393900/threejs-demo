import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import BaseModel from '../BaseModel';
import type Viewer from '../Viewer';

type LoadModelCallbackFn<T = any> = (arg: T) => any;

/**模型加载器 */
export default class ModelLoder {
  protected viewer: Viewer;
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;

  constructor(viewer: Viewer, dracolPath: string = '/draco/') {
    this.viewer = viewer;
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();

    // 提供一个DracLoader实例来解码压缩网格数据
    // 没有这个会报错 dracolPath 默认放在public文件夹当中
    this.dracoLoader.setDecoderPath(dracolPath);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /**模型加载到场景 */
  public loadModelToScene(url: string, callback: LoadModelCallbackFn<BaseModel>) {
    this.loadModel(url, model => {
      this.viewer.scene.add(model.object);
      callback && callback(model);
    });
  }

  private loadModel(url: string, callback: LoadModelCallbackFn<BaseModel>) {
    this.gltfLoader.load(url, gltf => {
      const baseModel = new BaseModel(gltf, this.viewer);
      callback && callback(baseModel);
    });
  }
}
