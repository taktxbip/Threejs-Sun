uniform float time;
uniform samplerCube uPerlin;
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

float superSun() {
    float sum = 0.;
    sum += textureCube(uPerlin, vLayer0).r;
    sum += textureCube(uPerlin, vLayer1).r;
    sum += textureCube(uPerlin, vLayer2).r;
    sum *= 0.33;
    return sum;
}

void main() {
    float brightness = superSun();

    float fres = Fresnel(eyeVector, vNormal);
    brightness = brightness * 3.0 + 1.0 + pow(fres, 1.6);
    // brightness = brightness * 3.0 + 1.0 + fres;

    gl_FragColor = vec4(brigthnessToColor(brightness), 1.);
    // gl_FragColor = vec4(vec3(fres), 1.0);
}