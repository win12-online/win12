/* Optional WebGL compositor. The DOM remains the source of truth and is the fallback. */
(function () {
  const KEY = 'webgl-mode';
  const DEFAULT_MODE = 'off';

  let canvas;
  let animationFrame;

  // Inline styles for the WebGL overlay layer
  const style = document.createElement('style');
  style.textContent = `
    #win12-webgl-layer{
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: .45;
      mix-blend-mode: multiply;
    }
    .webgl-full #win12-webgl-layer { opacity: .55; }
    .webgl-partial #win12-webgl-layer { opacity: .3; }
    .webgl-fallback #win12-webgl-layer { display: none; }
  `;
  document.head.appendChild(style);

  /** Check whether WebGL (ideally WebGL2) is available. */
  function supported() {
    try {
      const probe = document.createElement('canvas');
      return !!(
        probe.getContext('webgl2', { alpha: true }) ||
        probe.getContext('webgl', { alpha: true })
      );
    } catch (_) {
      return false;
    }
  }

  /** Tear down the compositor – cancel animation, remove canvas & classes. */
  function stop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    canvas?.remove();
    canvas = null;
    document.documentElement.classList.remove(
      'webgl-partial', 'webgl-full', 'webgl-fallback'
    );
  }

  /**
   * Initialise (or switch) the WebGL compositor.
   * @param {'off' | 'partial' | 'full'} mode
   */
  function start(mode) {
    stop();
    if (mode === 'off') return;
    if (!supported()) {
      document.documentElement.classList.add('webgl-fallback');
      return;
    }

    // Create the overlay canvas
    canvas = document.createElement('canvas');
    canvas.id = 'win12-webgl-layer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    // Obtain a WebGL context (prefer WebGL2)
    const gl =
      canvas.getContext('webgl2', { alpha: true }) ||
      canvas.getContext('webgl', { alpha: true });

    if (!gl) {
      stop();
      document.documentElement.classList.add('webgl-fallback');
      return;
    }

    // --- Shaders ---
    const vertexSrc =
      'attribute vec2 p;' +
      'void main(){gl_Position=vec4(p,0.,1.);}';

    const fragmentSrc = `
      precision mediump float;
      uniform float t;

      void main() {
        vec2 p = gl_FragCoord.xy / vec2(1200.0, 800.0);
        float v = 0.5 + 0.5 * sin(t * 0.00025 + p.x * 3.0 + p.y * 2.0);

        gl_FragColor = vec4(
          0.05 + 0.08 * v,
          0.28 + 0.12 * v,
          0.52 + 0.18 * v,
          0.12
        );
      }`;

    const compile = (type, source) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };

    // Build program
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-viewport triangle strip (quad)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const time = gl.getUniformLocation(program, 't');

    // Handle resize
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width  = innerWidth  * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width  = '100vw';
      canvas.style.height = '100vh';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    addEventListener('resize', resize);
    resize();

    // Apply mode visual class
    document.documentElement.classList.add(
      mode === 'full' ? 'webgl-full' : 'webgl-partial'
    );

    // Animation loop
    const frame = (now) => {
      if (!canvas) return;
      gl.uniform1f(time, now);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);

    // Handle context lost
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      stop();
      document.documentElement.classList.add('webgl-fallback');
    });
  }

  // Public API
  window.win12WebGL = {
    getMode: () => localStorage.getItem(KEY) || DEFAULT_MODE,

    apply(mode) {
      mode = ['off', 'partial', 'full'].includes(mode) ? mode : DEFAULT_MODE;
      localStorage.setItem(KEY, mode);
      start(mode);
      return mode;
    },

    init() {
      start(this.getMode());
    },
  };

  // Auto-start when DOM is ready
  document.addEventListener('DOMContentLoaded', () => window.win12WebGL.init());
})();
