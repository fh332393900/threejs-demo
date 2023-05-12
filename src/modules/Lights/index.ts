import { AmbientLight } from 'three';
import type Viewer from '../Viewer';

export default class Lights {
  public viewer: Viewer;
  constructor(viewer: Viewer) {
    this.viewer = viewer;
    const ambient = new AmbientLight(0xffffff, 0.4);
    this.viewer.scene.add(ambient);
  }
}
