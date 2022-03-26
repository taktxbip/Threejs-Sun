uniform sampler2D uImage;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

float fbm(vec4 p) {
    int iterations = 7;

    float amp = 1.;
    float scale = 1.;

    float result = 0.;
    for (int i = 0; i < iterations; i++) {
        result += snoise(p * scale) * amp;
        p.w += 100.;
        amp *= 0.9;
        scale *= 2.0;
    }
    return result;
}

void main() {
    vec4 p = vec4(vPosition * 4., time * 0.005);
    float noisy = fbm(p);

    vec4 p1 = vec4(vPosition * 3., time * 0.005);
    float spots = max(snoise(p1), 0.2);
    float newSpots = mix(1., spots, 0.7);

    gl_FragColor = vec4(vec3(noisy), 1.);
    gl_FragColor *= vec4(vec3(newSpots), 1.);
}