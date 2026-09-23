import { MotionPhysics } from './motion-physics.js';

export function initMotionControls(movePlayerCallback, telemetryCallback = () => {}) {
  const physics = new MotionPhysics();
  let enabled = false;
  let lastSample = { x: 0, y: 0, z: 0 };

  function handleSample(x, y, z) {
    if (!enabled) return;
    lastSample = { x, y, z };
    const movement = physics.update(x, y, z);
    telemetryCallback(movement);
    if (!movement.isRolling) return;
    const moved = movePlayerCallback(movement.x, movement.y, movement.intensity);
    if (moved === false) physics.hitWall();
  }

  function handleMotion(event) {
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    handleSample(acceleration.x, acceleration.y, acceleration.z);
  }

  function handleNativeMotion(x, y, z) {
    handleSample(x, y, z);
  }

  async function requestPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const result = await DeviceMotionEvent.requestPermission();
      return result === 'granted';
    }
    return true;
  }

  function enableNativeBridge() {
    if (typeof window === 'undefined') return;
    window.LabyrinthiaNativeMotion = handleNativeMotion;
    if (window.LabyrinthiaAndroid?.setMotionEnabled) window.LabyrinthiaAndroid.setMotionEnabled(true);
  }

  function disableNativeBridge() {
    if (typeof window === 'undefined') return;
    if (window.LabyrinthiaAndroid?.setMotionEnabled) window.LabyrinthiaAndroid.setMotionEnabled(false);
    delete window.LabyrinthiaNativeMotion;
  }

  async function enable() {
    if (enabled) return true;
    const granted = await requestPermission();
    if (!granted) return false;
    enabled = true;
    physics.reset();
    window.addEventListener('devicemotion', handleMotion, true);
    enableNativeBridge();
    return true;
  }

  function disable() {
    enabled = false;
    window.removeEventListener('devicemotion', handleMotion, true);
    disableNativeBridge();
    physics.reset();
  }

  function calibrate() {
    physics.calibrate(lastSample.x, lastSample.y, lastSample.z);
  }

  function setSensitivity(value) {
    physics.setSensitivity(value);
  }

  function setInvert(value) {
    physics.setInvert(value);
  }

  return { enable, disable, calibrate, setSensitivity, setInvert, isEnabled: () => enabled, getLastSample: () => ({ ...lastSample }) };
}
