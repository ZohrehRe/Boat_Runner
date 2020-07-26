#version 300 es

precision mediump float;

in vec3 fsNormal;
in vec2 uvFS;

in vec3 fs_pos;

out vec4 outColor;

uniform vec3 mDiffColor;

uniform vec3 lightDirection; 
uniform vec3 lightColor; 

uniform vec3 ambientLightColor;
uniform vec3 ambientMatColor;

uniform vec3 eyePosition;
uniform float SpecShine;
uniform vec4 specularColor;

uniform sampler2D u_texture;

void main() {
    vec3 eyeDir = normalize(eyePosition - fs_pos);

    vec3 nNormal = normalize(fsNormal);
    vec3 lDir = (lightDirection); 

//    vec3 r = -reflect(lDir,nNormal);
//    vec4 sLcontr = pow(clamp(dot(eyeDir,r), 0.0, 1.0), SpecShine) * vec4(lightColor,1.0);
//    vec4 specular = specularColor * sLcontr;

	// specular
	vec3 halfVec = normalize(eyeDir + lDir);
	vec4 specular = specularColor * pow(max(dot(halfVec, nNormal),0.0),SpecShine);

    vec4 lambertColor = vec4(mDiffColor * lightColor * dot(-lDir,nNormal),1.0);

    vec4 ambient = vec4(ambientLightColor * ambientMatColor, 1.0);

    outColor = texture(u_texture,uvFS) * clamp(lambertColor + specular + ambient, 0.0, 1.0);
}