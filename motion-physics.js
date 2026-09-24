import { CONFIG } from './config.js';

const gravity = 9.81;
const clockNow = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

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
    this.lastUpdate = clockNow();
    this.orientation = this.readOrientation();

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', () => {
        this.orientation = this.readOrientation();
        this.reset();
      });
    }
  }

  readOrientation() {
    if (typeof window === 'undefined') return 0;
    const raw = Number(window.screen?.orientation?.angle ?? window.orientation ?? 0) || 0;
    return ((Math.round(raw / 90) * 90) % 360 + 360) % 360;
  }

  setSensitivity(value) {
    this.tiltSensitivity = Math.min(2.5, Math.max(0.5, Number(value) || CONFIG.physics.tiltSensitivity));
  }

  setInvert(value) {
    this.invert = Boolean(value);
  }

  calibrate(x, y, z) {
    this.calibration = { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || 0 };
    this.calibrated = true;
    this.resetVelocity();
  }

  state() {
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    const isRolling = speed > this.movementThreshold;
    const direction = Math.abs(this.velocity.x) >= Math.abs(this.velocity.y)
      ? { x: Math.sign(this.velocity.x), y: 0 }
      : { x: 0, y: Math.sign(this.velocity.y) };
    return {
      ...direction,
      isRolling,
      intensity: Math.min(speed / this.maxVelocity, 1),
      speed,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      calibrated: this.calibrated
    };
  }

  applyFriction(deltaTime) {
    const friction = Math.pow(this.friction, Math.max(0, deltaTime) * 60);
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxVelocity) {
      const factor = this.maxVelocity / speed;
      this.velocity.x *= factor;
      this.velocity.y *= factor;
    }
  }

  update(accelerationX, accelerationY, accelerationZ) {
    const current = clockNow();
    const deltaTime = Math.min(0.08, Math.max(0.008, (current - this.lastUpdate) / 1000));
    this.lastUpdate = current;

    const x = Number(accelerationX) || 0;
    const y = Number(accelerationY) || 0;
    const z = Number(accelerationZ) || 0;
    if (!this.calibrated) {
      this.calibrate(x, y, z);
      return this.state();
    }

    // Android reports gravity in m/s². Removing the calibrated flat-board
    // vector leaves a tilt signal; its magnitude directly adds acceleration.
    let relativeX = ((x - this.calibration.x) / gravity) * this.tiltSensitivity;
    let relativeY = ((y - this.calibration.y) / gravity) * this.tiltSensitivity;
    relativeX = Math.max(-1, Math.min(1, relativeX));
    relativeY = Math.max(-1, Math.min(1, relativeY));
    if (Math.abs(relativeX) < this.deadzone) relativeX = 0;
    if (Math.abs(relativeY) < this.deadzone) relativeY = 0;

    relativeX = -relativeX;
    const orientation = this.orientation;
    if (orientation === 90) {
      [relativeX, relativeY] = [-relativeY, relativeX];
    } else if (orientation === 270) {
      [relativeX, relativeY] = [relativeY, -relativeX];
    } else if (orientation === 180) {
      relativeX = -relativeX;
      relativeY = -relativeY;
    }
    if (this.invert) {
      relativeX = -relativeX;
      relativeY = -relativeY;
    }

    this.velocity.x += relativeX * this.acceleration * deltaTime;
    this.velocity.y += relativeY * this.acceleration * deltaTime;
    // Friction is applied once per rendered frame in advance(). Keeping it
    // there prevents fast sensor streams from damping the ball twice.
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxVelocity) {
      const factor = this.maxVelocity / speed;
      this.velocity.x *= factor;
      this.velocity.y *= factor;
    }
    return this.state();
  }

  advance(deltaSeconds) {
    if (!this.calibrated) return this.state();
    this.applyFriction(Math.min(0.08, Math.max(0, Number(deltaSeconds) || 0)));
    return this.state();
  }

  resetVelocity() {
    this.velocity = { x: 0, y: 0 };
    this.lastUpdate = clockNow();
  }

  reset() {
    this.resetVelocity();
    this.calibrated = false;
    this.calibration = { x: 0, y: 0, z: 0 };
  }

  hitWall(axis) {
    // A real board loses most energy at a wall. A tiny reverse impulse keeps
    // the contact from feeling sticky without making the ball bounce away.
    if (axis === 'x') this.velocity.x *= -0.08;
    else if (axis === 'y') this.velocity.y *= -0.08;
    else {
      this.velocity.x *= 0.22;
      this.velocity.y *= 0.22;
    }
  }
}
