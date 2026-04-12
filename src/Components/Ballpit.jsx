import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

class ThreeScene {
    #config;
    canvas;
    camera;
    cameraFov;
    scene;
    renderer;
    #postprocessing;
    size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
    render = this.#internalRender;
    onAfterResize = () => { };
    #isIntersecting = false;
    #isInitialized = false;
    isDisposed = false;
    #intersectionObserver;
    #resizeObserver;
    #resizeTimeout;
    #clock = new THREE.Clock();
    #time = { elapsed: 0, delta: 0 };
    #requestRef;

    constructor(config) {
        this.#config = { ...config };
        this.#initCamera();
        this.#initScene();
        this.#initRenderer();
        this.resize();
        this.#initEvents();
    }

    #initCamera() {
        this.camera = new THREE.PerspectiveCamera();
        this.cameraFov = this.camera.fov;
    }

    #initScene() {
        this.scene = new THREE.Scene();
    }

    #initRenderer() {
        if (this.#config.canvas) {
            this.canvas = this.#config.canvas;
        } else if (this.#config.id) {
            this.canvas = document.getElementById(this.#config.id);
        }

        if (!this.canvas) {
            console.error('ThreeScene: Missing canvas or id parameter');
            return;
        }

        this.canvas.style.display = 'block';

        // Detect if HIGH_FLOAT is supported to prevent crashes on some mobile devices
        let precision = 'highp';
        try {
            const gl = this.canvas.getContext('webgl2') || 
                      this.canvas.getContext('webgl') || 
                      this.canvas.getContext('experimental-webgl');
            
            if (gl) {
                const highp = gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT);
                if (!highp || highp.precision === 0) {
                    precision = 'mediump';
                }
            }
        } catch (e) {
            precision = 'mediump';
        }

        const options = {
            canvas: this.canvas,
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
            precision: precision, // Set detected precision
            ...(this.#config.rendererOptions ?? {})
        };
        this.renderer = new THREE.WebGLRenderer(options);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    #initEvents() {
        window.addEventListener('resize', this.#handleResize.bind(this));
        if (this.#config.size === 'parent' && this.canvas.parentNode) {
            this.#resizeObserver = new ResizeObserver(this.#handleResize.bind(this));
            this.#resizeObserver.observe(this.canvas.parentNode);
        }

        this.#intersectionObserver = new IntersectionObserver((entries) => {
            this.#isIntersecting = entries[0].isIntersecting;
            this.#isIntersecting ? this.#start() : this.#stop();
        }, { root: null, rootMargin: '0px', threshold: 0 });
        this.#intersectionObserver.observe(this.canvas);

        document.addEventListener('visibilitychange', () => {
            if (this.#isIntersecting) {
                document.hidden ? this.#stop() : this.#start();
            }
        });
    }

    #handleResize() {
        if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(this.resize.bind(this), 100);
    }

    resize() {
        let width, height;
        if (this.#config.size instanceof Object) {
            width = this.#config.size.width;
            height = this.#config.size.height;
        } else if (this.#config.size === 'parent' && this.canvas.parentNode) {
            width = this.canvas.parentNode.offsetWidth;
            height = this.canvas.parentNode.offsetHeight;
        } else {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        this.size.width = width;
        this.size.height = height;
        this.size.ratio = width / height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        const fovRad = (this.camera.fov * Math.PI) / 180;
        this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
        this.size.wWidth = this.size.wHeight * this.camera.aspect;

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.onAfterResize(this.size);
    }

    #start() {
        if (this.#isInitialized) return;
        const animate = () => {
            this.#requestRef = requestAnimationFrame(animate);
            this.#time.delta = this.#clock.getDelta();
            this.#time.elapsed += this.#time.delta;
            if (this.onBeforeRender) this.onBeforeRender(this.#time);
            this.render();
        };
        this.#isInitialized = true;
        this.#clock.start();
        animate();
    }

    #stop() {
        if (this.#isInitialized) {
            cancelAnimationFrame(this.#requestRef);
            this.#isInitialized = false;
            this.#clock.stop();
        }
    }

    #internalRender() {
        this.renderer.render(this.scene, this.camera);
    }

    clear() {
        this.scene.traverse(obj => {
            if (obj.isMesh && obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
                obj.geometry.dispose();
            }
        });
        this.scene.clear();
    }

    dispose() {
        this.#stop();
        window.removeEventListener('resize', this.#handleResize);
        this.#resizeObserver?.disconnect();
        this.#intersectionObserver?.disconnect();
        this.clear();
        this.renderer.dispose();
        this.isDisposed = true;
    }
}

// Interaction handling
const interactions = new Map();
let isInteractionsInitialized = false;
const interactionMouse = new THREE.Vector2();

function setupInteractions(canvas, data) {
    if (!interactions.has(canvas)) {
        interactions.set(canvas, data);
        if (!isInteractionsInitialized) {
            const handleMove = (e) => {
                interactionMouse.x = e.clientX;
                interactionMouse.y = e.clientY;
                updateInteractions();
            };
            document.addEventListener('pointermove', handleMove);
            isInteractionsInitialized = true;
        }
    }
}

function updateInteractions() {
    for (const [canvas, data] of interactions) {
        const rect = canvas.getBoundingClientRect();
        const x = interactionMouse.x - rect.left;
        const y = interactionMouse.y - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            data.position.set(x, y);
            data.nPosition.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
            if (!data.hover) {
                data.hover = true;
                if (data.onEnter) data.onEnter();
            }
            if (data.onMove) data.onMove();
        } else if (data.hover) {
            data.hover = false;
            if (data.onLeave) data.onLeave();
        }
    }
}

class PhysicsSystem {
    constructor(config) {
        this.config = config;
        this.positionData = new Float32Array(3 * config.count);
        this.velocityData = new Float32Array(3 * config.count);
        this.sizeData = new Float32Array(config.count);
        this.center = new THREE.Vector3();
        this.init();
    }

    init() {
        for (let i = 0; i < this.config.count; i++) {
            const idx = i * 3;
            if (i === 0) {
                this.center.toArray(this.positionData, 0);
            } else {
                this.positionData[idx] = (Math.random() - 0.5) * 2 * this.config.maxX;
                this.positionData[idx + 1] = (Math.random() - 0.5) * 2 * this.config.maxY;
                this.positionData[idx + 2] = (Math.random() - 0.5) * 2 * this.config.maxZ;
            }
            this.sizeData[i] = i === 0 ? this.config.size0 : THREE.MathUtils.randFloat(this.config.minSize, this.config.maxSize);
        }
    }

    update(time) {
        const { count, gravity, friction, maxVelocity, wallBounce, maxX, maxY, maxZ } = this.config;
        const pos = this.positionData;
        const vel = this.velocityData;
        const sizes = this.sizeData;

        const p1 = new THREE.Vector3();
        const v1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const diff = new THREE.Vector3();

        if (this.config.controlSphere0) {
            p1.fromArray(pos, 0);
            p1.lerp(this.center, 0.1).toArray(pos, 0);
            v1.set(0, 0, 0).toArray(vel, 0);
        }

        const startIdx = this.config.controlSphere0 ? 1 : 0;

        for (let i = startIdx; i < count; i++) {
            const idx = i * 3;
            v1.fromArray(vel, idx);
            p1.fromArray(pos, idx);

            v1.y -= time.delta * gravity * sizes[i];
            v1.multiplyScalar(friction);
            v1.clampLength(0, maxVelocity);

            p1.add(v1);
            p1.toArray(pos, idx);
            v1.toArray(vel, idx);
        }

        // Collisions
        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            p1.fromArray(pos, idx);
            v1.fromArray(vel, idx);
            const r1 = sizes[i];

            for (let j = i + 1; j < count; j++) {
                const jdx = j * 3;
                p2.fromArray(pos, jdx);
                v2.fromArray(vel, jdx);
                const r2 = sizes[j];

                diff.copy(p2).sub(p1);
                const dist = diff.length();
                const minBoard = r1 + r2;

                if (dist < minBoard) {
                    const overlap = minBoard - dist;
                    const force = diff.normalize().multiplyScalar(0.5 * overlap);
                    
                    const f1 = force.clone().multiplyScalar(Math.max(v1.length(), 1));
                    const f2 = force.clone().multiplyScalar(Math.max(v2.length(), 1));

                    p1.sub(force);
                    v1.sub(f1);
                    p2.add(force);
                    v2.add(f2);

                    p2.toArray(pos, jdx);
                    v2.toArray(vel, jdx);
                }
            }

            // Boundaries
            if (Math.abs(p1.x) + r1 > maxX) {
                p1.x = Math.sign(p1.x) * (maxX - r1);
                v1.x = -v1.x * wallBounce;
            }
            if (gravity === 0) {
                if (Math.abs(p1.y) + r1 > maxY) {
                    p1.y = Math.sign(p1.y) * (maxY - r1);
                    v1.y = -v1.y * wallBounce;
                }
            } else if (p1.y - r1 < -maxY) {
                p1.y = -maxY + r1;
                v1.y = -v1.y * wallBounce;
            }
            if (Math.abs(p1.z) + r1 > maxZ) {
                p1.z = Math.sign(p1.z) * (maxZ - r1);
                v1.z = -v1.z * wallBounce;
            }

            p1.toArray(pos, idx);
            v1.toArray(vel, idx);
        }
    }
}

class ScatteringMaterial extends THREE.MeshPhysicalMaterial {
    constructor(params) {
        super(params);
        this.uniforms = {
            thicknessDistortion: { value: 0.1 },
            thicknessAmbient: { value: 0 },
            thicknessAttenuation: { value: 0.1 },
            thicknessPower: { value: 2 },
            thicknessScale: { value: 10 }
        };
        this.defines.USE_UV = '';
        this.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, this.uniforms);
            shader.fragmentShader = `
                uniform float thicknessPower;
                uniform float thicknessScale;
                uniform float thicknessDistortion;
                uniform float thicknessAmbient;
                uniform float thicknessAttenuation;
                ${shader.fragmentShader}
            `.replace(
                'void main() {',
                `
                void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
                    vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
                    float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
                    #ifdef USE_COLOR
                        vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
                    #else
                        vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
                    #endif
                    reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
                }
                void main() {
                `
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <lights_fragment_begin>',
                THREE.ShaderChunk.lights_fragment_begin.replaceAll(
                    'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
                    `
                    RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
                    RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
                    `
                )
            );
        };
    }
}

const DEFAULT_CONFIG = {
    count: 35,
    colors: [0x8b5cf6, 0x6366f1, 0xec4899],
    ambientColor: 0xffffff,
    ambientIntensity: 1,
    lightIntensity: 250,
    materialParams: {
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transmission: 0,
        ior: 1.5,
        thickness: 0.5
    },
    minSize: 0.5,
    maxSize: 1.2,
    size0: 1.5,
    gravity: 0,
    friction: 0.999,
    wallBounce: 0.95,
    maxVelocity: 0.05,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true
};

class SpheresSystem extends THREE.InstancedMesh {
    constructor(renderer, config = {}) {
        const conf = { ...DEFAULT_CONFIG, ...config };
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        
        const geometry = new THREE.SphereGeometry(1, 48, 48);
        const material = new ScatteringMaterial({ envMap, ...conf.materialParams });
        
        super(geometry, material, conf.count);
        
        this.config = conf;
        this.physics = new PhysicsSystem(conf);
        
        this.ambientLight = new THREE.AmbientLight(conf.ambientColor, conf.ambientIntensity);
        this.add(this.ambientLight);
        
        this.pointLight = new THREE.PointLight(conf.colors[0], conf.lightIntensity);
        this.add(this.pointLight);
        
        this.setColors(conf.colors);
    }

    setColors(colors) {
        if (!colors || colors.length === 0) return;
        const colorObjs = colors.map(c => new THREE.Color(c));
        const tempColor = new THREE.Color();

        for (let i = 0; i < this.count; i++) {
            const ratio = i / (this.count - 1 || 1);
            const idx = Math.floor(ratio * (colorObjs.length - 1));
            const start = colorObjs[idx];
            const end = colorObjs[Math.min(idx + 1, colorObjs.length - 1)];
            const alpha = (ratio * (colorObjs.length - 1)) - idx;
            
            tempColor.copy(start).lerp(end, alpha);
            this.setColorAt(i, tempColor);
            
            if (i === 0) {
                this.pointLight.color.copy(tempColor);
            }
        }
        if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }

    update(time) {
        this.physics.update(time);
        const dummy = new THREE.Object3D();
        const pos = new THREE.Vector3();

        for (let i = 0; i < this.count; i++) {
            pos.fromArray(this.physics.positionData, i * 3);
            dummy.position.copy(pos);
            const s = this.physics.sizeData[i];
            dummy.scale.setScalar(s);
            dummy.updateMatrix();
            this.setMatrixAt(i, dummy.matrix);

            if (i === 0) {
                this.pointLight.position.copy(pos);
            }
        }
        this.instanceMatrix.needsUpdate = true;
    }
}

const Ballpit = ({ className = '', followCursor = true, colors, ...props }) => {
    const canvasRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let sceneControl;
        let spheres;

        try {
            sceneControl = new ThreeScene({ canvas, size: 'parent' });
            sceneControl.camera.position.set(0, 0, 15);
            sceneControl.camera.lookAt(0, 0, 0);

            spheres = new SpheresSystem(sceneControl.renderer, { followCursor, ...(colors ? { colors } : {}), ...props });
            sceneControl.scene.add(spheres);

            const raycaster = new THREE.Raycaster();
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            const mousePos = new THREE.Vector3();

            const interactionData = {
                position: new THREE.Vector2(),
                nPosition: new THREE.Vector2(),
                hover: false,
                onMove: () => {
                    if (!spheres) return;
                    raycaster.setFromCamera(interactionData.nPosition, sceneControl.camera);
                    raycaster.ray.intersectPlane(plane, mousePos);
                    spheres.physics.center.copy(mousePos);
                    spheres.config.controlSphere0 = true;
                },
                onLeave: () => {
                    if (!spheres) return;
                    spheres.config.controlSphere0 = false;
                }
            };

            setupInteractions(canvas, interactionData);

            sceneControl.onBeforeRender = (time) => {
                if (spheres) spheres.update(time);
            };

            sceneControl.onAfterResize = (size) => {
                if (spheres) {
                    spheres.config.maxX = size.wWidth / 2;
                    spheres.config.maxY = size.wHeight / 2;
                }
            };

            instanceRef.current = { sceneControl, spheres };
        } catch (error) {
            console.error("Ballpit: Failed to initialize WebGL scene", error);
        }

        return () => {
            if (sceneControl) sceneControl.dispose();
            interactions.delete(canvas);
        };
    }, []);

    return <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%', pointerEvents: 'auto' }} />;
};

export default Ballpit;
