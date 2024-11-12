<template>
  <div id="three"></div>
  <Popover
    ref="popoverRef"
    :top="popoverTop"
    :left="popoverLeft"
    :data="popoverData"
  ></Popover>
</template>

<script lang="ts" setup name="Sence">
/* eslint-disable */
import { ref, onMounted, type Ref } from 'vue';
import Viewer, { type Animate } from '@/modules/Viewer';
import Floors from '@/modules/Floors';
import ModelLoader from '@/modules/ModelLoder';
import * as THREE from 'three';
import gsap from 'gsap';
import Event from '@/modules/Viewer/Events';
import BoxHelperWrap from '@/modules/BoxHelperWrap';
import { checkNameIncludes, findParent } from '@/utils';

import Popover from './Popover/index.vue';

let viewer: Viewer;
let modelLoader: ModelLoader;
let boxHelperWrap: BoxHelperWrap;

const popoverRef: Ref = ref(null);
const popoverTop = ref(0);
const popoverLeft = ref(0);
const popoverData = ref<any>({});

let office: any = null;
let oldOffice: any = null;
let dataCenter: any = null;
let oldDataCenter: any = null;
let modelSelect = ['zuo0', 'zuo1', 'zuo2', 'zuo3', 'zuo4', 'zuo5'];
let modelSelectName = '';
let modelMoveName = '';
let isModelSelectName = false;


onMounted(() => {
  init();
  initModel();

  viewer.scene.traverse((item: THREE.Object3D) => {
    console.log(item, '0000000000');
  });
});

const init = () => {
  viewer = new Viewer('three');
  // viewer.addAxis();
  // viewer.addStats();
  viewer.initRaycaster();

  modelLoader = new ModelLoader(viewer);
  // const floors = new Floors(viewer);
  // floors.addGird();

  boxHelperWrap = new BoxHelperWrap(viewer);

  viewer.emitter.on(Event.dblclick.raycaster, (list: THREE.Intersection[]) => {
    onMouseClick(list);
  });

  viewer.emitter.on(Event.mousemove.raycaster, (list: THREE.Intersection[]) => {
    onMouseMove(list);
  });

};

const initModel = () => {
  // modelLoader.loadModelToScene('/models/zuo.glb', baseModel => {
  //   console.log(baseModel, '1111111');
    
  //   baseModel.setScalc(0.01);
  //   const model = baseModel.gltf.scene;
  //   office = baseModel;
  //   office.object.rotation.y = Math.PI;
  //   office.object.position.set(2, 0, 0);
  //   // model.position.set(80, 2, 90);
  //   office.object.children.forEach((item: any) => {
  //     item.name = item.name.replace('zuo', '');
  //     if (item.name === 'ding') {
  //       item.name = 6;
  //     }
  //     item.name--;
  //   });
  //   office.object.children.sort((a: { name: number; }, b: { name: number; }) => a.name - b.name).forEach((v: { name: string; }) => {
  //     v.name = 'zuo' + v.name;
  //   });

  //   model.name = '办公楼';
  //   baseModel.openCastShadow();
  //   oldOffice = model.clone();

  //   const list: THREE.Object3D<THREE.Event>[] = [];
  //   model.traverse(item => {
  //     list.push(item);
  //   });
  //   viewer.setRaycasterObjects(list);
  // });

  modelLoader.loadModelToScene('/models/plane.glb', baseModel => {
    const model = baseModel.gltf.scene;
    model.scale.set(0.0001 * 3, 0.0001 * 3, 0.0001 * 3)
    model.position.set(0, 0, 0);
    model.name = 'plane';
    baseModel.openCastShadow();

    const texture = (baseModel.object.children[0] as any).material.map;
    console.log(texture, 'texture-------');
    const fnOnj = planeAnimate(texture);
    viewer.addAnimate(fnOnj);
  });
  

  modelLoader.loadModelToScene('/models/datacenter.glb', baseModel => {
    console.log(baseModel, '1111111');
    baseModel.setScalc(0.2);
    // baseModel.object.rotation.y = Math.PI / 2;
    const model = baseModel.gltf.scene;
    model.position.set(0, 0, 0);
    model.name = '机房';
    baseModel.openCastShadow();

    dataCenter = baseModel;
    oldDataCenter = model.clone();

    const rackList: any[] = [];
    model.traverse(item => {
      if (checkIsRack(item)) {
        rackList.push(item);
      }
    });
    // console.log(rackList, 'rackList------');

    viewer.setRaycasterObjects(rackList);
    
  });
};

const planeAnimate = (texture: any): Animate => {
    console.log(texture, 'texture');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const animateFn = {
      fun: () => {
        const count = texture.repeat.y;
        if (count <= 10) {
          texture.repeat.x += 0.01;
          texture.repeat.y += 0.02;
        } else {
          texture.repeat.x = 0;
          texture.repeat.y = 0;
        }
      },
      content: viewer,
    };
    return animateFn;
}

const onMouseClick = (intersects: THREE.Intersection[]) => {
  if (!intersects.length) return;
  const selectedObject = intersects[0].object;

  let selectedObjectName = '';
  const findClickModel = (object: any) => {
    console.log(object, 'object');
    if (object.type === 'Group') {
      selectedObjectName = object.name;
    }
    if (object.parent && object.type !== 'Scene') {
      findClickModel(object.parent);
    }
  };
  findClickModel(selectedObject);
  console.log(selectedObjectName);

  // if (!selectedObjectName || !selectedObjectName.includes('办公楼')) {
  //   // this.scene.remove(this.label);
  //   return;
  // }

  // const selectedModel = viewer.scene.getObjectByName(selectedObjectName);
  console.log(selectedObject, 'selectedObject');
  
  // 点击楼房
  if (selectedObject.name.includes('zuo')) {
    
    selectOffice(selectedObject.parent);
  }
  
  // 点击其他区域
  if (!selectedObject.name.includes('zuo')) {
    if (!isModelSelectName && oldOffice) {
      let oldmodel = oldOffice.getObjectByName(modelMoveName);
      office.object.getObjectByName(modelMoveName).traverse(function (child: { isMesh: any; material: any; name: any; }) {
        if (child.isMesh) {
          child.material = oldmodel.getObjectByName(child.name).material;
        }
      });
    }
  }
};

function checkIsRack (obj: any): boolean {
  return checkNameIncludes(obj, 'rack');
}

const onMouseMove = (intersects: THREE.Intersection[]) => {
  if (!intersects.length) {
    popoverRef.value.setShow(false);
    boxHelperWrap.setVisible(false);
    return;
  }
  const selectedObject = intersects[0].object || {};
  
  
  let selectedObjectName = '';
  const findClickModel = (object: any) => {
    if (object.name.includes('rack')) {
      selectedObjectName = object.name;
      return;
    }
    if (object.parent) {
      findClickModel(object.parent);
    }
  };

  // const findClickModel = (object: any) => {
  //   if (object.name.includes('zuo')) {
  //     selectedObjectName = object.name;
  //     return;
  //   }
  //   if (object.parent) {
  //     findClickModel(object.parent);
  //   }
  // };
  findClickModel(selectedObject);

  console.log(selectedObjectName, '--selectedObjectName---');
  console.log(selectedObject, '------selectedObject---------');
  const rack = findParent(selectedObject, checkIsRack);
  console.log(rack, '-------rack---------');
  if (rack) {
    
    boxHelperWrap.attach(rack);
    updateRackInfo(rack.name);
  }

  // if (!selectedObjectName || !selectedObjectName.includes('办公楼')) {
  //   // 重置模型
  //   // viewer.scene.children[viewer.scene.children.findIndex(o => o.name === '办公楼')] = office.object = oldOffice.clone();
  //   return;
  // }


  modelSelect.forEach((item: any) => {
    if (item === selectedObject.parent?.name) {
      modelMoveName = item;
      if (modelSelectName === modelMoveName) return;
      office.object.getObjectByName(item).traverse(function (child: { isMesh: any; material: THREE.MeshPhongMaterial; }) {
        if (child.isMesh) {
          child.material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthTest: false,
            depthWrite: true, // 无法被选择，鼠标穿透
            color: 'yellow',
            opacity: 0.3,
          });
        }
      });
    } else {
      if (!isModelSelectName && oldOffice) {
        let oldmodel = oldOffice.getObjectByName(item);
        office.object.getObjectByName(item).traverse(function (child: { isMesh: any; material: any; name: any; }) {
          if (child.isMesh) {
            child.material = oldmodel.getObjectByName(child.name).material;
          }
        });
      }
    }
  });

};

const updateRackInfo = (name: string) => {
  if (name) {
    popoverRef.value.setShow(true, { name });
    const event = viewer.mouseEvent as MouseEvent;
    popoverTop.value = event.y + 10;
    popoverLeft.value = event.x + 10;
  } else {
    popoverRef.value.setShow(false);

  }
};

const selectOffice = (model: any) => {
  modelSelectName = model.name;
  let oldmodel = oldOffice.getObjectByName(modelSelectName);
  let modelSelectIndex = modelSelect.findIndex(v => v === modelSelectName);
  office.object.children.forEach((child: any, index: number) => {
    child.children.forEach((Mesh: any) => {
      if (child.name === modelSelectName) {
        child.children.forEach((Mesh: { material: any; name: any; }) => {
          Mesh.material = oldmodel.getObjectByName(Mesh.name).material;
        });
      } else {
        // Mesh.material = new THREE.MeshPhongMaterial({
        //   color: new THREE.Color('#123ca8'),
        //   transparent: true,
        //   opacity: 0.5,
        //   emissiveMap: Mesh.material.map,
        // });
      }
    });
    if (!model.userData.position && index > modelSelectIndex) {
      gsap.to(child.position, {
        y: !child.userData.position ? child.position.y + 60 : child.position.y,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
          child.userData.position = true;
        },
      });
    }
    if (model.userData.position && index <= modelSelectIndex) {
      if (child.userData.position) {
        gsap.to(child.position, {
          y: oldOffice.getObjectByName(child.name).position.y,
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
            child.userData.position = false;
          },
        });
      }
    }
  });
};

</script>

<style scoped>
#three {
  height: 100%;
  width: 100%;
}
</style>
