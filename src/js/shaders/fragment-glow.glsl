uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

varying vec3 vLayer0;
varying vec3 vLayer1;
varying vec3 vLayer2;
varying vec3 eyeVector;
varying vec3 vNormal;

vec3 brigthnessToColor(float b) {
    b *= 0.25;

    return (vec3(b, b*b, b*b*b*b) / 0.25) * 0.6;
}

void main() {
    float radial = 1. - vPosition.z;
    radial *= radial;

    float brightness = 1.0 + radial * 0.83;

    float shrinkGlow = pow(radial, 2.0);

    gl_FragColor.rgb = brigthnessToColor(brightness) * shrinkGlow;
    gl_FragColor.a = shrinkGlow * radial;
}