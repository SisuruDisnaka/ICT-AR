import '@ar-js-org/ar.js/aframe/build/aframe-ar.js'
import { MARKER, CAMERA_PARAMS } from './markers'

export interface ArHandle { marker: HTMLElement; dispose: () => void }
export function createArScene(host: HTMLElement, o: { deviceId?: string; onFound: () => void; onLost: () => void }): ArHandle {
  host.innerHTML = `<a-scene embedded vr-mode-ui="enabled:false" renderer="alpha:true;antialias:true;logarithmicDepthBuffer:true"
    arjs="trackingMethod:best;sourceType:webcam;${o.deviceId ? `deviceId:${o.deviceId};` : ''}cameraParametersUrl:${CAMERA_PARAMS};debugUIEnabled:false;detectionMode:mono;maxDetectionRate:60;sourceWidth:1280;sourceHeight:720;displayWidth:1280;displayHeight:720">
    <a-marker id="marker" type="${MARKER.type}" url="${MARKER.url}" smooth="true" smoothCount="8" smoothTolerance="0.01" smoothThreshold="2"></a-marker>
    <a-entity camera></a-entity></a-scene>`
  const marker = host.querySelector('#marker') as HTMLElement
  marker.addEventListener('markerFound', o.onFound)
  marker.addEventListener('markerLost', o.onLost)
  const fire = () => window.dispatchEvent(new Event('resize'))
  const root = document.documentElement.style
  /** Video and the A-Frame scene share one rect that is fully inside the screen (no crop, no overflow), so tracking stays aligned. */
  const fit = () => {
    const v = document.querySelector('#arjs-video') as HTMLVideoElement | null
    if (!v || !v.videoWidth) return
    const vv = window.visualViewport, W = vv?.width ?? window.innerWidth, H = vv?.height ?? window.innerHeight, k = Math.min(W / v.videoWidth, H / v.videoHeight)
    const w = Math.round(v.videoWidth * k), h = Math.round(v.videoHeight * k), l = Math.round((vv?.offsetLeft ?? 0) + (W - w) / 2), t = Math.round((vv?.offsetTop ?? 0) + (H - h) / 2)
    const key = `${w}x${h}x${l}x${t}`; if (root.getPropertyValue('--vk') === key) return
    root.setProperty('--vk', key); root.setProperty('--vw', w + 'px'); root.setProperty('--vh', h + 'px'); root.setProperty('--vl', l + 'px'); root.setProperty('--vt', t + 'px')
    setTimeout(fire, 50) // let A-Frame re-measure its (now resized) parent
  }
  const onResize = () => requestAnimationFrame(() => requestAnimationFrame(fit))
  window.addEventListener('resize', onResize)
  let tries = 0; const iv = window.setInterval(() => { const v = document.querySelector('#arjs-video') as HTMLVideoElement | null
    if ((v && v.videoWidth) || ++tries > 50) { fire(); setTimeout(fire, 400); setTimeout(fire, 1500); clearInterval(iv) } }, 300)
  const later = () => setTimeout(fire, 350)
  window.addEventListener('orientationchange', later); window.visualViewport?.addEventListener('resize', later); window.visualViewport?.addEventListener('scroll', onResize)
  return { marker, dispose() {
    clearInterval(iv); window.removeEventListener('resize', onResize); ['--vk','--vw','--vh','--vl','--vt'].forEach(x => root.removeProperty(x)); window.removeEventListener('orientationchange', later); window.visualViewport?.removeEventListener('resize', later); window.visualViewport?.removeEventListener('scroll', onResize)
    const v = document.querySelector('#arjs-video') as HTMLVideoElement | null
    ;(v?.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop())
    v?.remove(); host.innerHTML = '' } }
}
