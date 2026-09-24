import { MotionPhysics } from './motion-physics.js';

export function initMotionControls(motionCallback = () => {}, telemetryCallback = () => {}) {
  const physics = new MotionPhysics();
  let enabled = false;
  let lastSample = { x: 0, y: 0, z: 0, received: false, source: 'none' };
  let lastMotionSampleAt = 0;

  function publish(movement, source = lastSample.source) {
    const enriched = { ...movement, source, received: lastSample.received };
    telemetryCallback(enriched);
    return enriched;
  }

  function handleSample(x, y, z, source = 'motion') {
    if (!enabled) return;
    const sample = { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || 0 };
    lastSample = { ...sample, received: true, source };
    if (source === 'motion') lastMotionSampleAt = Date.now();
    const movement = publish(physics.update(sample.x, sample.y, sample.z), source);
    // The game consumes the velocity in its animation frame. This callback
    // only informs it that motion input exists; no grid step is dispatched.
    motionCallback(movement);
  }

  function handleMotion(event) {
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    handleSample(acceleration.x, acceleration.y, acceleration.z, 'motion');
  }

  function handleOrientation(event) {
    // Some Android WebViews expose DeviceOrientation but not DeviceMotion.
    // Convert the screen tilt angle into the same gravity-like units used by
    // the native accelerometer bridge. Ignore it while native samples arrive
    // so the two streams never double the ball's acceleration.
    if (Date.now() - lastMotionSampleAt < 120) return;
    if (!Number.isFinite(event.beta) && !Number.isFinite(event.gamma)) return;
    const beta = Math.max(-89, Math.min(89, Number(event.beta) || 0)) * Math.PI / 180;
    const gamma = Math.max(-89, Math.min(89, Number(event.gamma) || 0)) * Math.PI / 180;
    handleSample(Math.sin(gamma) * 9.81, Math.sin(beta) * 9.81, Math.cos(beta) * Math.cos(gamma) * 9.81, 'orientation');
  }

  function handleNativeMotion(x, y, z) {
    handleSample(x, y, z);
  }

  async function requestPermission() {
    const permissionRequests = [];
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') permissionRequests.push(DeviceMotionEvent.requestPermission());
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') permissionRequests.push(DeviceOrientationEvent.requestPermission());
    if (permissionRequests.length === 0) return true;
    const results = await Promise.all(permissionRequests);
    return results.every((result) => result === 'granted');
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
    lastSample = { x: 0, y: 0, z: 0, received: false, source: 'none' };
    lastMotionSampleAt = 0;
    window.addEventListener('devicemotion', handleMotion, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    enableNativeBridge();
    return true;
  }

  function disable() {
    enabled = false;
    window.removeEventListener('devicemotion', handleMotion, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
    disableNativeBridge();
    physics.reset();
    lastSample = { x: 0, y: 0, z: 0, received: false, source: 'none' };
  }

  function calibrate() {
    if (!lastSample.received) return false;
    physics.calibrate(lastSample.x, lastSample.y, lastSample.z);
    return true;
  }

  function tick(deltaSeconds) {
    if (!enabled) return publish({ x: 0, y: 0, isRolling: false, intensity: 0, speed: 0, velocityX: 0, velocityY: 0, calibrated: false }, 'none');
    return publish(physics.advance(deltaSeconds), lastSample.source);
  }

  function resetVelocity() {
    physics.resetVelocity();
  }

  function hitWall(axis) {
    physics.hitWall(axis);
  }

  function setSensitivity(value) {
    physics.setSensitivity(value);
  }

  function setInvert(value) {
    physics.setInvert(value);
  }

  return {
    enable,
    disable,
    calibrate,
    tick,
    resetVelocity,
    hitWall,
    setSensitivity,
    setInvert,
    isEnabled: () => enabled,
    getLastSample: () => ({ ...lastSample })
  };
}
