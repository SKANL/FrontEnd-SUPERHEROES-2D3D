// Renderizador 3D usando Three.js
import * as THREE from 'three';

export class ThreeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arena = null;
    }

    async init() {
        this.scene = new THREE.Scene();
        // Fondo gradiente (simulado con plano y material)
        const bgGeometry = new THREE.PlaneGeometry(100, 50);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x6ec6f7,
            side: THREE.DoubleSide
        });
        const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
        bgPlane.position.set(0, 10, -10);
        this.scene.add(bgPlane);

        // Cámara ortográfica para vista lateral
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 10;
        this.camera = new THREE.OrthographicCamera(
            -viewSize * aspect,
            viewSize * aspect,
            viewSize,
            -viewSize,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x6ec6f7);
        // Luz cálida y ambiental
        const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.8);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffe082, 1.2);
        directionalLight.position.set(0, 10, 20);
        this.scene.add(directionalLight);
        // Arena ajustada al ancho de pantalla, color vivo
        const arenaWidth = viewSize * aspect * 2;
        // Suelo más presente y cercano al personaje
        const geometry = new THREE.BoxGeometry(arenaWidth, 0.6, 2.5);
        const material = new THREE.MeshPhongMaterial({ color: 0x222222 });
        this.arena = new THREE.Mesh(geometry, material);
        this.arena.position.y = -3.8;
        this.scene.add(this.arena);
        // Bordes/columnas laterales con detalles
        const columnMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const leftColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 16), columnMaterial);
        leftColumn.position.set(-arenaWidth / 2, -2.5, 0.8);
        this.scene.add(leftColumn);
        const rightColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 16), columnMaterial);
        rightColumn.position.set(arenaWidth / 2, -2.5, 0.8);
        this.scene.add(rightColumn);
        // Sombra bajo el luchador (círculo plano)
        const shadowGeometry = new THREE.CircleGeometry(1.2, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.35, transparent: true });
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.position.set(0, -4.3, 1.3);
        shadow.rotation.x = -Math.PI / 2;
        this.scene.add(shadow);
    }

    // Convierte una coordenada Y del mundo 3D a coordenada Y de pantalla (canvas)
    getScreenYFromWorldY(worldY) {
        const vector = new THREE.Vector3(0, worldY, 0);
        vector.project(this.camera);
        const screenY = (1 - vector.y) * 0.5 * window.innerHeight;
        return screenY;
    }
    // Convierte una coordenada X del mundo 3D a coordenada X de pantalla (canvas)
    getScreenXFromWorldX(worldX) {
        const vector = new THREE.Vector3(worldX, 0, 0);
        vector.project(this.camera);
        const screenX = (vector.x + 1) * 0.5 * window.innerWidth;
        return screenX;
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
