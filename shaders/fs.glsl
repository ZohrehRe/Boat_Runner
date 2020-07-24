#version 300 es

precision mediump float;

//in vec4 finalColor;

in vec3 fsNormal;
in vec2 uvFS;
//in vec3 specular;
out vec4 outColor;

uniform vec3 mDiffColor;
uniform vec3 lightDirection; 
uniform vec3 lightColor; 


uniform sampler2D u_texture;



void main() {
    //vec4 color = vec4(finalColor.rgb, 0.9);
    //vec4 outColorfs = texture(u_texture,uvFS) * color;
    //outColor = outColorfs + vec4(specular,0.0);
    
    vec3 nNormal = normalize(fsNormal);
    vec3 lDir = (lightDirection); 
    vec3 lambertColor = mDiffColor * lightColor * dot(-lDir,nNormal);
    outColor = texture(u_texture,uvFS) * vec4(clamp(lambertColor, 0.0, 1.0), 1.0);
}