import { CONFIG } from './config.js';

export class MotionPhysics {
  constructor() {
    this.friction = CONFIG.physics.friction;
    this.maxVelocity = CONFIG.physics.maxVelocity;
    this.acceleration = CONFIG.physics.acceleration;
    this.movementThreshold = CONFIG.physics.movementThreshold;
    this.tiltSensitivity = CONFIG.physics.tiltSensitivity;
    this.deadzone = CONFIG.physics.deadzone;
    this.invert = false;
    this.velocity = { x: 0, y: 0 };
    this.calibration = { x: 0, y: 0, z: 0 };
    this.calibrated = false;
    this.lastUpdate = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    this.orientation = typeof window === 'undefined' ? 0 : window.orientation || 0;

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', () => {
        this.orientation = window.orientation || 0;
        this.reset();
      });
    }
  }

  setSensitivity(value) {
    this.tiltSensitivity = Math.min(5, Math.max(0.5, Number(value) || CONFIG.physics.tiltSensitivity));
  }

  setInvert(value) {
    this.invert = Boolean(value);
  }

  calibrate(x, y, z) {
    this.calibration = { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || 0 };
    this.calibrated = true;
    this.velocity = { x: 0, y: 0 };
  }

  update(accelerationX, accelerationY, accelerationZ) {
    const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    const deltaTime = Math.min(0.08, Math.max(0.008, (now - this.lastUpdate) / 1000));
    this.lastUpdate = now;

    const x = Number(accelerationX) || 0;
    const y = Number(accelerationY) || 0;
    const z = Number(accelerationZ) || 0;
    if (!this.calibrated) {
      this.calibrate(x, y, z);
      return { x: 0, y: 0, isRolling: false, intensity: 0 };
    }

    // Android's accelerometer reports m/s². Normalizing by gravity makes the
    // response consistent between native Android and browser sensor streams.
    let relativeX = ((x - this.calibration.x) / 9.81) * this.tiltSensitivity;
    let relativeY = ((y - this.calibration.y) / 9.81) * this.tiltSensitivity;
    if (Math.abs(relativeX) < this.deadzone) relativeX = 0;
    if (Math.abs(relativeY) < this.deadzone) relativeY = 0;

    relativeX = -relativeX;
    if (this.orientation === 90) {
      [relativeX, relativeY] = [-relativeY, relativeX];
    } else if (this.orientation === -90) {
      [relativeX, relativeY] = [relativeY, -relativeX];
    } else if (this.orientation === 180 || this.orientation === -180) {
      relativeX = -relativeX;
      relativeY = -relativeY;
    }
    if (this.invert) {
      relativeX = -relativeX;
      relativeY = -relativeY;
    }

    this.velocity.x += relativeX * this.acceleration * deltaTime;
    this.velocity.y += relativeY * this.acceleration * deltaTime;
    const friction = Math.pow(this.friction, deltaTime * 60);
    this.velocity.x *= friction;
    this.velocity.y *= friction;

    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxVelocity) {
      const factor = this.maxVelocity / speed;
      this.velocity.x *= factor;
      this.velocity.y *= factor;
    }

    const isRolling = speed > this.movementThreshold;
    if (!isRolling) return { x: 0, y: 0, isRolling: false, intensity: 0 };
    const direction = Math.abs(this.velocity.x) >= Math.abs(this.velocity.y)
      ? { x: Math.sign(this.velocity.x), y: 0 }
      : { x: 0, y: Math.sign(this.velocity.y) };
    return { ...direction, isRolling: true, intensity: Math.min(speed / this.maxVelocity, 1) };
  }

  reset() {
    this.velocity = { x: 0, y: 0 };
    this.calibrated = false;
    this.lastUpdate = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  hitWall() {
    // A board rolls into a wall and loses its momentum, rather than continuing
    // to request the same move at full speed.
    this.velocity.x *= 0.22;
    this.velocity.y *= 0.22;
  }
}
