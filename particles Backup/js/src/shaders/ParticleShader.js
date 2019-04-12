var ParticleShader = {

    uniforms: {
        "tPos": { type: "t", value: null },
        "uTime" : { type: "f", value: 0.0 },
        "uPointSize": { type: "f", value: 1.8 },
        "uAlpha": { type: "f", value: 0.2 },
        "uColor1": { type: "v3", value: new THREE.Vector3(0.05, 0.26, 0.47) },
        "uColor2": { type: "v3", value: new THREE.Vector3(0.3, 0.65, 0.68) },
        "uColorFreq": { type: "f", value: 1.0 },
        "uColorSpeed": { type: "f", value: 2.0 },
    },

    vertexShader: Utils.loadTextFileInject(
        "shaders/ParticleShader.vs.glsl"
    ),

    fragmentShader: Utils.loadTextFileInject(
        "shaders/ParticleShader.fs.glsl"
    )

};

var BasicParticleShader = {

    defines: {
        "POINT_SIZE": Utils.isMobile ? "5.0" : "1.0",
    },

    uniforms: {
        "tPos": { type: "t", value: null },
        "uColor": { type: "v4", value: new THREE.Vector4(1.0, 0.6, 0.1, 0.2) },
    },

    vertexShader: Utils.loadTextFile(
        "shaders/BasicParticleShader.vs.glsl"
    ),

    fragmentShader: Utils.loadTextFile(
        "shaders/BasicParticleShader.fs.glsl"
    )

};