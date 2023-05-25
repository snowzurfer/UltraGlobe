import * as THREE from "three";
import { Controller } from "./Controller";

const tempPointA = new THREE.Vector3();
const tempPointB = new THREE.Vector3();
const tempPointC = new THREE.Vector3();
const tempPointD = new THREE.Vector3();
const tempPointE = new THREE.Vector3();
const quaternion = new THREE.Quaternion();

class PanController extends Controller {
  constructor(camera, domElement, map) {
    super(camera, domElement, map);
    this.isMouseDown = false;
    this.mouseDownLocation = [];
    this.mouseRayCast = new THREE.Vector3();
  }
  _handleEvent(eventName, e) {
    let self = this;
    switch (eventName) {
      case "mousedown":
        self.mouseDown(e);
        break;
      case "mouseup":
        self.mouseUp(e);
        break;
      case "mousemove":
        self.mouseMove(e);
        break;
      case "touchstart":
        self.touchStart(e);
        break;
      case "touchmove":
        self.touchMove(e);
        break;
      case "touchend":
        self.touchEnd(e);
        break;
      case "touchcancel":
        self.touchEnd(e);
        break;
    }
    super._handleEvent(eventName, e);
  }

  touchStart(e) {
    if (!this.touchId && e.touches.length == 1) {
      this.touchId = e.changedTouches[0].identifier;
      this.isMouseDown = true;
      this.mouseDownLocation = [
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
      ];
      this.mouseLatest = [
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
      ];
      this.map.screenPixelRayCast(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
        this.mouseRayCast
      );
    } else {
      delete this.touchID;
      this.isMouseDown = false;
    }
  }
  touchEnd(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      const touch = e.changedTouches[index];
      if (this.touchId == touch.identifier) {
        delete this.touchID;
        this.isMouseDown = false;
        break;
      }
    }
  }
  touchMove(e) {
    for (let index = 0; index < e.changedTouches.length; index++) {
      const touch = e.changedTouches[index];
      if (this.touchId == touch.identifier) {
        this.mouseLatest = [touch.clientX, touch.clientY];
        break;
      }
    }
  }

  mouseDown(e) {
    if ((e.which == 1 && !e.ctrlKey) || e.which == "all") {
      this.isMouseDown = true;
      this.mouseDownLocation = [e.x, e.y];
      this.mouseLatest = [e.x, e.y];
      this.map.screenPixelRayCast(e.x, e.y, this.mouseRayCast);
    }
  }
  mouseUp(e) {
    if (e.which == 1 || e.which == "all") {
      this.isMouseDown = false;
    }
  }
  mouseMove(e) {
    if (!!this.isMouseDown) {
      this.mouseLatest = [e.x, e.y];
    }
  }

  _calculatePointerScale(distance) {
    const minDistance = 100;
    const maxDistance = 33666989;
    const cappedDistance = Math.max(
      minDistance,
      Math.min(maxDistance, distance)
    );
    const distanceScale =
      (cappedDistance - minDistance) / (maxDistance - minDistance);

    const minScale = 0.0006;
    const maxScale = 0.005;
    // const cappedScale = Math.max(minScale, Math.min(maxScale, scale));
    const scale = minScale + (maxScale - minScale) * distanceScale;
    return scale;
  }

  _update() {
    if (!this.isMouseDown) {
      return;
    }
    tempPointC.copy(this.mouseRayCast);
    tempPointA.copy(this.camera.position).sub(this.planet.position).normalize();
    const distance = tempPointC.distanceTo(this.camera.position);
    const pointerScale = this._calculatePointerScale(distance);
    const scaledDistanceToCamera =
      tempPointC.distanceTo(this.camera.position) * pointerScale;

    const pointerXDisplacement =
      (this.mouseLatest[0] - this.mouseDownLocation[0]) *
      scaledDistanceToCamera;
    const pointerYDisplacement =
      (this.mouseLatest[1] - this.mouseDownLocation[1]) *
      scaledDistanceToCamera;

    this.mouseDownLocation[0] = this.mouseLatest[0];
    this.mouseDownLocation[1] = this.mouseLatest[1];

    const cameraWorldDirection = tempPointD
    this.camera.getWorldDirection(cameraWorldDirection).normalize();

    tempPointE.crossVectors(this.camera.up.normalize(), cameraWorldDirection);
    tempPointB.crossVectors(tempPointE, this.camera.position).normalize();

    const cameraToPlanetCenterDistance = this.planet.center.distanceTo(
      this.camera.position
    );

    this.camera.position.set(
      this.camera.position.x +
        pointerXDisplacement * tempPointE.x +
        pointerYDisplacement * tempPointB.x,
      this.camera.position.y +
        pointerXDisplacement * tempPointE.y +
        pointerYDisplacement * tempPointB.y,
      this.camera.position.z +
        pointerXDisplacement * tempPointE.z +
        pointerYDisplacement * tempPointB.z
    );

    this.camera.position
      .sub(this.planet.center)
      .normalize()
      .multiplyScalar(cameraToPlanetCenterDistance)
      .add(this.planet.center);

    tempPointB.copy(this.camera.position).sub(this.planet.position).normalize();

    quaternion.setFromUnitVectors(tempPointA, tempPointB);

    tempPointD.applyQuaternion(quaternion).add(this.camera.position);
    this.camera.lookAt(tempPointD);
    tempPointE.applyQuaternion(quaternion);
    this.camera.up.crossVectors(
      tempPointD.sub(this.camera.position),
      tempPointE
    );

    this.map.moveCameraAboveSurface();
    this.map.resetCameraNearFar();
  }
}
export { PanController };
