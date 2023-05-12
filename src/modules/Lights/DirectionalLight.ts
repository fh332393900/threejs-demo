import * as THREE from 'three';
import type Viewer from '../Viewer';

/**
 * 平行光
 */
export default class DirectionalLight {
  public light: THREE.DirectionalLight;
  public viewer: Viewer;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.viewer.scene.add(ambient);
    this.light = new THREE.DirectionalLight(new THREE.Color('#fff'));

    this.viewer.scene.add(this.light);
  }

}
