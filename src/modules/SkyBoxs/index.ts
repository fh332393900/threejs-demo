import * as THREE from 'three';
import type Viewer from '../Viewer';
import { Sky } from '../type';

/** 场景天空盒*/
export default class SkyBoxs {
  protected viewer: Viewer;
  
  constructor (viewer: Viewer) {
    this.viewer = viewer;
  }

  /**
   * 添加雾效果
   * @param color 颜色
   */
  public addFog (color = 0xa0a0a0, near = 500, far = 2000) {
    this.viewer.scene.fog = new THREE.Fog(new THREE.Color(color), near, far);
  }

  /**
   * 移除雾效果
   */
  public removeFog () {
    this.viewer.scene.fog = null;
  }

  /**
   * 添加默认天空盒
   * @param skyType
   */
  public addSkybox (skyType: keyof typeof Sky = Sky.daytime) {
    const path = `/skybox/${Sky[skyType]}/`; // 设置路径
    const format = '.jpg'; // 设定格式
    this.setSkybox(path, format);
  }

  /**
   * 自定义添加天空盒
   * @param path 天空盒地址
   * @param format 图片后缀名
   */
  private setSkybox (path: string, format = '.jpg') {
    const loaderbox = new THREE.CubeTextureLoader();
    const cubeTexture = loaderbox.load([
      path + 'posx' + format,
      path + 'negx' + format,
      path + 'posy' + format,
      path + 'negy' + format,
      path + 'posz' + format,
      path + 'negz' + format,
    ]);
    // 需要把色彩空间编码改一下
    cubeTexture.encoding = THREE.sRGBEncoding;
    this.viewer.scene.background = cubeTexture;
  }
}
