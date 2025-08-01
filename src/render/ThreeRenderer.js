// Renderizador 3D usando Three.js
// Three.js se carga desde CDN via script tag en el HTML

export class ThreeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arena = null;
        this.THREE = null;
    }

    async init() {
        // Verificar que Three.js esté disponible
        if (typeof window.THREE === 'undefined') {
            throw new Error('Three.js no está disponible. Asegúrate de que se haya cargado desde el CDN.');
        }
        
        this.THREE = window.THREE;
        
        this.scene = new this.THREE.Scene();
        // Fondo gradiente (simulado con plano y material)
        const bgGeometry = new this.THREE.PlaneGeometry(100, 50);
        const bgMaterial = new this.THREE.MeshBasicMaterial({
            color: 0x6ec6f7,
            side: this.THREE.DoubleSide
        });
        const bgPlane = new this.THREE.Mesh(bgGeometry, bgMaterial);
        bgPlane.position.set(0, 10, -10);
        this.scene.add(bgPlane);

        // Cámara ortográfica para vista lateral
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 10;
        this.camera = new this.THREE.OrthographicCamera(
            -viewSize * aspect,
            viewSize * aspect,
            viewSize,
            -viewSize,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new this.THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x6ec6f7);
        // Luz cálida y ambiental
        const ambientLight = new this.THREE.AmbientLight(0xfff3e0, 0.8);
        this.scene.add(ambientLight);
        const directionalLight = new this.THREE.DirectionalLight(0xffe082, 1.2);
        directionalLight.position.set(0, 10, 20);
        this.scene.add(directionalLight);
        // Arena ajustada al ancho de pantalla, color vivo
        const arenaWidth = viewSize * aspect * 2;
        // Suelo más presente y cercano al personaje
        const geometry = new this.THREE.BoxGeometry(arenaWidth, 0.6, 2.5);
        const material = new this.THREE.MeshPhongMaterial({ color: 0x222222 });
        this.arena = new this.THREE.Mesh(geometry, material);
        this.arena.position.y = -3.8;
        this.scene.add(this.arena);
        // Bordes/columnas laterales con detalles
        const columnMaterial = new this.THREE.MeshPhongMaterial({ color: 0x444444 });
        const leftColumn = new this.THREE.Mesh(new this.THREE.CylinderGeometry(0.4, 0.4, 5, 16), columnMaterial);
        leftColumn.position.set(-arenaWidth / 2, -2.5, 0.8);
        this.scene.add(leftColumn);
        const rightColumn = new this.THREE.Mesh(new this.THREE.CylinderGeometry(0.4, 0.4, 5, 16), columnMaterial);
        rightColumn.position.set(arenaWidth / 2, -2.5, 0.8);
        this.scene.add(rightColumn);
        // Sombra bajo el luchador (círculo plano)
        const shadowGeometry = new this.THREE.CircleGeometry(1.2, 32);
        const shadowMaterial = new this.THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.35, transparent: true });
        const shadow = new this.THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.position.set(0, -4.3, 1.3);
        shadow.rotation.x = -Math.PI / 2;
        this.scene.add(shadow);
    }

    // Convierte una coordenada Y del mundo 3D a coordenada Y de pantalla (canvas)
    getScreenYFromWorldY(worldY) {
        const vector = new this.THREE.Vector3(0, worldY, 0);
        vector.project(this.camera);
        const screenY = (1 - vector.y) * 0.5 * window.innerHeight;
        return screenY;
    }
    // Convierte una coordenada X del mundo 3D a coordenada X de pantalla (canvas)
    getScreenXFromWorldX(worldX) {
        const vector = new this.THREE.Vector3(worldX, 0, 0);
        vector.project(this.camera);
        const screenX = (vector.x + 1) * 0.5 * window.innerWidth;
        return screenX;
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const aspect = window.innerWidth / window.innerHeight;
        const viewSize = 10;
        this.camera.left = -viewSize * aspect;
        this.camera.right = viewSize * aspect;
        this.camera.top = viewSize;
        this.camera.bottom = -viewSize;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
