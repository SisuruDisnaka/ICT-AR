import "@ar-js-org/ar.js/aframe/build/aframe-ar.js";
import { MARKER, CAMERA_PARAMS } from "./markers";

export interface ArHandle {
  marker: HTMLElement;
  dispose: () => void;
}
export function createArScene(
  host: HTMLElement,
  o: { deviceId?: string; onFound: () => void; onLost: () => void },
): ArHandle {
  host.innerHTML = `<a-scene embedded vr-mode-ui="enabled:false" renderer="alpha:true;antialias:true;logarithmicDepthBuffer:true"
    arjs="trackingMethod:best;sourceType:webcam;${o.deviceId ? `deviceId:${o.deviceId};` : ""}cameraParametersUrl:${CAMERA_PARAMS};debugUIEnabled:false;detectionMode:mono;maxDetectionRate:60;sourceWidth:1280;sourceHeight:720;displayWidth:1280;displayHeight:720">
    <a-marker id="marker" type="${MARKER.type}" url="${MARKER.url}" smooth="true" smoothCount="8" smoothTolerance="0.01" smoothThreshold="2"></a-marker>
    <a-entity camera></a-entity></a-scene>`;
  const marker = host.querySelector("#marker") as HTMLElement;
  marker.addEventListener("markerFound", o.onFound);
  marker.addEventListener("markerLost", o.onLost);
  return {
    marker,
    dispose() {
      const v = document.querySelector(
        "#arjs-video",
      ) as HTMLVideoElement | null;
      (v?.srcObject as MediaStream | null)
        ?.getTracks()
        .forEach((t) => t.stop());
      v?.remove();
      host.innerHTML = "";
    },
  };
}
