uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;
varying vec3 vNormal;

mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}
 
void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    eyeVector = normalize(worldPosition.xyz - cameraPosition);

    float t = time * 0.002;

    mat2 rot0 = rotate(t);
    vec3 p0 = position;
    p0.yz *= rot0;
    vLayer0 = p0;

    mat2 rot1 = rotate(t + 10.0);
    vec3 p1 = position;
    p1.xz *= rot1;
    vLayer1 = p1;

    mat2 rot2 = rotate(t + 20.0);
    vec3 p2 = position;
    p2.xy *= rot2;
    vLayer2 = p2;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
} 