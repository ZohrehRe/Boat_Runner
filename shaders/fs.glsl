#version 300 es

precision mediump float;

in vec3 fs_pos;
in vec3 fsNormal;
in vec2 uvFS;

uniform sampler2D u_texture;
uniform vec3 eyePos;

uniform vec3 DirectionalLightColor; 
uniform vec4 diffuseColor;
uniform vec4 ambientMatColor;
uniform vec4 specularColor;

uniform float SpecShine;
uniform vec3 DirectionalLightDir; 

uniform float DTexMix;

out vec4 outColor;


vec4 compDiffuse(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec4 diffColor) {
	// Diffuse
	float LdotN = max(0.0, dot(normalVec, lightDir));
	vec4 LDcol = lightCol * diffColor;
	// --> Lambert
	vec4 diffuseLambert = LDcol * LdotN;
	
	return diffuseLambert;
}


vec4 compSpecular(vec3 lightDir, vec4 lightCol, vec3 normalVec, vec3 eyedirVec) {
	// Specular
	float LdotN = max(0.0, dot(normalVec, lightDir));
	vec3 reflection = -reflect(lightDir, normalVec);
	float LdotR = max(dot(reflection, eyedirVec), 0.0);
	vec3 halfVec = normalize(lightDir + eyedirVec);
	float HdotN = max(dot(normalVec, halfVec), 0.0);
	
	vec4 LScol = lightCol * specularColor * max(sign(LdotN),0.0);
	// --> Blinn
	vec4 specularBlinn = LScol * pow(HdotN, SpecShine);

	return specularBlinn;
}

vec4 compAmbient(vec4 ambColor) {
	// --> Ambient
	vec4 ambientAmbient = ambColor;
	return ambientAmbient;
}


void main() {

	vec4 texcol = texture(u_texture, uvFS);
	vec4 diffColor = diffuseColor * (1.0-DTexMix) + texcol * DTexMix;
	vec4 ambColor = ambientMatColor * (1.0-DTexMix) + texcol * DTexMix;
	
	
	vec3 normalVec = normalize(fsNormal);
	vec3 eyedirVec = normalize(eyePos - fs_pos);


	//directional lights
	vec3 lightDir = DirectionalLightDir;
	vec4 lightCol = DirectionalLightColor;
	
	// Diffuse
	vec4 diffuse = compDiffuse(lightDir, lightCol, normalVec, diffColor);
	
	// Specular
	vec4 specular = compSpecular(lightDir, lightCol, normalVec, eyedirVec);

	// Ambient
	vec4 ambient = compAmbient(ambColor);

    // final steps
	vec4 out_color = clamp(ambient + diffuse + specular, 0.0, 1.0);

	outColor = texture(u_texture,uvFS) * vec4(out_color.rgb, 1.0);
}