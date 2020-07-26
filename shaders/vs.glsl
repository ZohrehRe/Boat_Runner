#version 300 es

in vec3 a_position;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fs_pos;

out vec3 fsNormal;
out vec2 uvFS;

uniform mat4 matrix;


void main() {
    fs_pos = a_position;
    
    fsNormal = inNormal;
    uvFS = a_uv;
    gl_Position = matrix * vec4(a_position, 1.0);
}
