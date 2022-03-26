uniform sampler2D uImage;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
    float noise = snoise(vec4(vPosition * 6., time * 0.5));
    gl_FragColor = vec4(noise, noise, noise, 1.0);
}