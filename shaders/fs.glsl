#version 300 es

precision mediump float;

in vec3 fsNormal;
in vec2 uvFS;

out vec4 outColor;

uniform vec3 mDiffColor;

uniform vec3 lightDirection; 
uniform vec3 lightColor; 

uniform vec3 ambientLightColor;
uniform vec3 ambientMatColor;


uniform sampler2D u_texture;

void main() {

    vec3 nNormal = normalize(fsNormal);
    vec3 lDir = (lightDirection); 

    vec4 lambertColor = vec4(mDiffColor * lightColor * dot(-lDir,nNormal),1.0);

    vec4 ambient = vec4(ambientLightColor * ambientMatColor, 1.0);

    outColor = texture(u_texture,uvFS) * clamp(lambertColor + ambient, 0.0, 1.0);
}