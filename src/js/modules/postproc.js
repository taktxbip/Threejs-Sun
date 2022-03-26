import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';


composerPass(){
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    var counter = 0.0;
    this.myEffect = {
        uniforms: {
            "tDiffuse": { value: null },
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix 
          * modelViewMatrix 
          * vec4( position, 1.0 );
      }
      `,
        fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main(){
        vec2 newUV = vUv;
        gl_FragColor = texture2D( tDiffuse, newUV);
      }
      `
    }

    this.customPass = new ShaderPass(this.myEffect);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
}

this.composer.render();