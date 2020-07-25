#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fsNormal;
out vec2 uvFS;
out vec3 fs_pos;

uniform mat4 matrix;

void main() {
    fsNormal = inNormal;
    uvFS = a_uv;
    fs_pos = (matrix * vec4(inPosition, 1.0)).xyz;
    gl_Position = matrix * vec4(inPosition, 1.0);
    

}
