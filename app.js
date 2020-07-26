var program;
var gl;
var shaderDir;
var baseDir;
var lastUpdateTime;

var boatModel;
var rockModel;
var rock2Model;
var riverModel;
var grassModel;
var GameOver = false;

var objectsWorldMatrix = [];
var objectsIndices = [];

var eyePosVector = [];

//attributes and uniforms
var positionAttributeLocation;
var uvAttributeLocation;
var matrixLocation;
var textLocation;
var normalAttributeLocation;

var materialDiffColorHandle;
var lightDirectionHandle;
var lightPositionHandle;
var lightColorHandle;

var ambientLightcolorHandle;
var ambientMatcolorHandle;

var vao = new Array();
var textures = new Array();

var viewMatrix;
var perspectiveMatrix;

//dir light
var directionalDirTheta = -utils.degToRad(50);
var directionalDirPhi = -utils.degToRad(135);
//var directionalLightDir = [Math.cos(directionalDirTheta) * Math.cos(directionalDirPhi),Math.sin(directionalDirTheta),Math.cos(directionalDirTheta) * Math.sin(directionalDirPhi)];
  directionalLightDir = [Math.cos(directionalDirTheta) * Math.cos(directionalDirPhi),Math.sin(directionalDirTheta),Math.cos(directionalDirTheta) * Math.sin(directionalDirPhi)];

var directionalLightColor = [0.6, 0.6, 0.6];

//ambient light
var ambientLight = [0.807843137254902, 0.792156862745098, 0.792156862745098];
var ambientMatColor = [1.0,1.0,1.0];

//diffuse light 
var diffuseColor = [0.6, 0.6, 0.6];

//camera
var cx;
var cy;
var cz;
var camAngle;
var camElev;

//boat kinematics
var linearDir = 0;
var linearVel = 0;
var velX = 0;
var velZ = 0;
var maxLinearVel = 0.14;
var linearAcc = 0.0002;
var linearDrag = 0.005;

var turningDir = 0;
var angularVel = 0.0;
var maxAngularVel = 0.3;
var angularAcc = 0.01;
var angularDrag = 0.01;

boatStr = 'Assets/Boat/Boat.obj';
rock1Str = 'Assets/Rocks/Rock1/rock1.obj';
rock2Str = 'Assets/Rocks/Rock2/Rock_1.obj';

boatText = 'Assets/Boat/textures/boat_diffuse.bmp';
rock1Text = 'Assets/Rocks/Rock1/textures/rock_low_Base_Color.png';
rock2Text = 'Assets/Rocks/Rock2/Rock_1_Tex/Rock_1_Base_Color.jpg';
riverText = 'Assets/River/river.png'
grassText = 'Assets/Grass/grass.jpg'

var nFrame = 0;
var pageReady = false;

var rockObjCount = 30.0;
var rockObjlimit = 10.0;
var riverObjCount = 5.0;
var grassObjCount = 0;

//var aspectRatioDesired = 1.346;

function main() {

  window.onresize = doResize;
  gl.canvas.height = window.innerHeight-240;
  //gl.canvas.width  = aspectRatioDesired * gl.canvas.height;
  gl.canvas.width = window.innerWidth - 16;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  setBuffers();

  buildObjects();
  
  Camera()
  
  drawScene();
}

function doResize() {
    // set canvas dimensions
  //var canvas = document.getElementById("my-canvas");
    if((window.innerWidth > 40) && (window.innerHeight > 240)) {
      gl.canvas.height = window.innerHeight-240;
      //gl.canvas.width  = aspectRatioDesired * gl.canvas.height;
      gl.canvas.width = window.innerWidth - 16;
      var w=gl.canvas.clientWidth;
      var h=gl.canvas.clientHeight;
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.viewport(0.0, 0.0, w, h);
      
      aspectRatio = w/h;
    }
}

function Camera() {

  perspectiveMatrix = utils.MakePerspective(60, gl.canvas.width / gl.canvas.height, 0.1, 50.0);
  cx = 0.0;
  cy = 1.5;
  cz = 0.0;
  camElev = -35.0;
  camAngle = 0.0;
	// Creates in {out} a view matrix. The camera is centerd in ({cx}, {cy}, {cz}).
	// It looks {ang} degrees on y axis, and {elev} degrees on the x axis.
  viewMatrix = utils.MakeView(cx + boat_X, cy + boat_Y, cz + boat_Z, camElev, camAngle);

}

//build boat Object
var boat_X = 0.0;
var boat_Y = -0.15;
var boat_Z = 3.0;
var initialBoat_Z = boat_Z;
var boat_Rx = 90.0;
var boat_Ry = 0.0;
var boat_Rz = 0.0;
var boat_S = 2.0 / 1000.0;
var boat_InflationRadius = 0.25;
var boat_indices = 0;
var boat_materialColor = [1.0, 1.0, 1.0];
var rockModelSelector = [];
var rock1_InflationRadius = 0.4;
var rock2_InflationRadius = 0.2;
var river_S = 4.0;

function buildObjects() {
  
  objectsWorldMatrix.push(utils.MakeWorld(boat_X, boat_Y, boat_Z, boat_Rx, boat_Ry, boat_Rz, boat_S));
  objectsIndices[0] = boatModel.indices.length;

  //build river Objects
  var river_X = 0.0;
  var river_Y = -0.1;
  var river_Z = 0.0;
  var river_Rx = 0.0;
  var river_Ry = 0.0;
  var river_Rz = 0.0;
  
  var river_indices = 0;
  var river_materialColor = [1.0, 1.0, 1.0];
  for (let i = 0; i < riverObjCount; i++){
    objectsWorldMatrix.push(utils.MakeWorld(river_X, river_Y, river_Z, river_Rx, river_Ry, river_Rz, river_S));
    river_Z = river_Z - river_S * 2;
  }
  objectsIndices[1] = riverModel.indices.length; //1 for rivers

  //build rock objects
  for (i = 0; i < rockObjCount; i++) {
    rock_Z = boat_Z - river_S - Math.random() *  5 * river_S;
    rock_X = Math.random() * (2 * river_S) - river_S;
    var rock_Y = -0.25;
    var rock_Rx = 0.0;
    var rock_Ry = 0.0;
    var rock_Rz = 0.0;
    var rock_S = 2 / 20.0;

    if(Math.random() > 0.5) {
      rockModelSelector.push(2); //2 is the bigger rock
      rock_S = 0.1;
      objectsWorldMatrix.push(utils.MakeWorld(rock_X, rock_Y, rock_Z, rock_Rx, rock_Ry, rock_Rz, rock_S));
    }
    else {
      rock_S = 0.2;
      rockModelSelector.push(3); //3 is the smaller rock
      objectsWorldMatrix.push(utils.MakeWorld(rock_X, rock_Y, rock_Z, rock_Rx, rock_Ry, rock_Rz, rock_S));
    }
      
  }
  objectsIndices[2] = rockModel.indices.length;
  objectsIndices[3] = rock2Model.indices.length;

  //build grass Objects
  //var grass_X = -8.0;
  var grass_Y = -0.1;
  var grass_Z = 0.0;
  var grass_Rx = 0.0;
  var grass_Ry = 0.0;
  var grass_Rz = 0.0;
  var grass_S = river_S;
  var grass_indices = 0;
  var grass_materialColor = [1.0, 1.0, 1.0];
  for (let i = 0; i < riverObjCount; i++){ //draw grass according to the number of rivers
    //right side of the river
    objectsWorldMatrix.push(utils.MakeWorld(grass_S * 2, grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    objectsWorldMatrix.push(utils.MakeWorld(grass_S * 4 , grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    objectsWorldMatrix.push(utils.MakeWorld(grass_S * 6 , grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    //left side of the river
    objectsWorldMatrix.push(utils.MakeWorld(-grass_S * 2, grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    objectsWorldMatrix.push(utils.MakeWorld(-grass_S * 4, grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    objectsWorldMatrix.push(utils.MakeWorld(-grass_S * 6, grass_Y, grass_Z, grass_Rx, grass_Ry, grass_Rz, grass_S));
    grassObjCount += 6;
    grass_Z = grass_Z - grass_S * 2;
  }
  objectsIndices[4] = grassModel.indices.length;
}

async function initialize() {
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  var canvas = document.getElementById("my_canvas");

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  //getting the shader handles
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
  matrixLocation = gl.getUniformLocation(program, "matrix");

  textLocation = gl.getUniformLocation(program, "u_texture");

  normalAttributeLocation = gl.getAttribLocation(program, "inNormal");

  eyePositionHandle = gl.getUniformLocation(program, "eyePosition");

  materialDiffColorHandle = gl.getUniformLocation(program, 'mDiffColor');
  lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
  lightPositionHandle = gl.getUniformLocation(program, 'lightPosition');

  lightColorHandle = gl.getUniformLocation(program, 'lightColor');

  ambientLightcolorHandle = gl.getUniformLocation(program, 'ambientLightColor');
  ambientMatcolorHandle = gl.getUniformLocation(program, 'ambientMatColor');

 
  //loading the objects of the scene
  var boatObjStr = await utils.get_objstr(baseDir + boatStr);
  boatModel = new OBJ.Mesh(boatObjStr);
  
  var rock1bjStr = await utils.get_objstr(baseDir + rock1Str);
  rockModel = new OBJ.Mesh(rock1bjStr);
  
  var rock2ObjStr = await utils.get_objstr(baseDir + rock2Str);
  rock2Model = new OBJ.Mesh(rock2ObjStr);
  
  //River Obj Str is included in the index file (river.js file)
  riverModel = new OBJ.Mesh(RiverObjStr);

  //Grass Obj Str is included in the index file (grass.js file)
  grassModel = new OBJ.Mesh(GrassObjStr);
  
  //setting the keyboard events
  window.addEventListener("keyup", keyFunctionUp, false);
  window.addEventListener("keydown", keyFunctionDown, false);

  main();
}

function setBuffers() {
  //set the buffer for the boat
  gl.useProgram(program);
  vao[0] = gl.createVertexArray(); //0 for the boat
  gl.bindVertexArray(vao[0])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boatModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  textures[0] = gl.createTexture(); //0 for the boat

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + boatText;

  image.onload = function (texture, image) {
    return function () {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
  }(textures[0], image);

  //set the buffer for the river
  vao[1] = gl.createVertexArray(); //1 for river
  gl.bindVertexArray(vao[1])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(riverModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(riverModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(riverModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(riverModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  textures[1] = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + riverText;

  image.onload = function (texture, image) {
    return function () {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
  }(textures[1], image);

  //set the buffer for rock 1
  vao[2] = gl.createVertexArray(); //2 for rock model 1
  gl.bindVertexArray(vao[2])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rockModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  textures[2] = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[2]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + rock1Text;

  image.onload = function (texture, image) {
    return function () {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
  }(textures[2], image);

  //set the buffer for rock 2
  vao[3] = gl.createVertexArray(); //3 for rock model 2
  gl.bindVertexArray(vao[3])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rock2Model.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  textures[3] = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[3]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + rock2Text;

  image.onload = function (texture, image) {
    return function () {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
  }(textures[3], image);

    //set the buffer for grass
    vao[4] = gl.createVertexArray(); //4 for grass model
    gl.bindVertexArray(vao[4])
  
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grassModel.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grassModel.textures), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(grassModel.indices), gl.STATIC_DRAW);
  
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grassModel.vertexNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
    textures[4] = gl.createTexture();
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[4]);
  
    image = new Image();
    image.crossOrigin = "anonymous";
    image.src = baseDir + grassText;
  
    image.onload = function (texture, image) {
      return function () {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
      };
    }(textures[4], image);
}

var rock_count
function drawObjects() {

  gl.clearColor(132/265,192/265,17/265, 1.0); //green background
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var j = 0;
  rock_count = 0;
  for (let i = 0; i < objectsWorldMatrix.length ; ++i) {
    gl.useProgram(program);
    var worldViewMatrix = utils.multiplyMatrices(viewMatrix, objectsWorldMatrix[i]);
    var worldViewProjection = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(worldViewProjection));

    //light position for each obj
    // var lightPositionMatrix = utils.invertMatrix(objectsWorldMatrix[i]);
    
    // gl.uniformMatrix4fv(lightPositionHandle, gl.FALSE, lightPositionTransformed);

    //light dir for each obj

	  var lightDirMatrix = utils.sub3x3from4x4(utils.transposeMatrix(objectsWorldMatrix[i]));
	  var directionalLightTransformed=utils.normalizeVec3(utils.multiplyMatrix3Vector3(lightDirMatrix,directionalLightDir));
    gl.uniform3fv(lightDirectionHandle, directionalLightTransformed);

    //eye position for each obj
    var eyePositionMatrix = utils.sub3x3from4x4(utils.invertMatrix(worldViewMatrix));
    var eyePositionTransformed = utils.normalizeVec3(utils.multiplyMatrix3Vector3(eyePositionMatrix,eyePosVector));
    gl.uniformMatrix4fv(eyePositionHandle, gl.FALSE, eyePositionTransformed);

    if (i == 0) gl.uniform3fv(materialDiffColorHandle, boat_materialColor);
    else
      gl.uniform3fv(materialDiffColorHandle, boat_materialColor);

    gl.uniform3fv(lightColorHandle, directionalLightColor);
    gl.uniform3fv(materialDiffColorHandle, diffuseColor);
    gl.uniform3fv(ambientLightcolorHandle, ambientLight);
    gl.uniform3fv(ambientMatcolorHandle, ambientMatColor);


    if (i == 0) {
      j = 0; //drawing boat
    }
    else if (i < riverObjCount + 1) {
      j = 1; //drawing rivers
    }
    else if (i < riverObjCount + rockObjCount + 1) { //drawing rocks
      if(rock_count >= rockObjlimit) {
        continue;
      }
      j = rockModelSelector[rock_count];
      // if( == 2)
      //   j = 2; //rock model 1 (big one)
      // else 
      //   j = 3; //rock model 2 (small one)
      rock_count++;
    }
    else { //drawing grass
      j = 4;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[j]);
    gl.uniform1i(textLocation, textures[j]);

    //bind appropriate vertex array object and draw
    gl.bindVertexArray(vao[j]);
    gl.drawElements(gl.TRIANGLES, objectsIndices[j], gl.UNSIGNED_SHORT, 0);
  }
}


function animate() {
  var currentTime = (new Date).getTime();

  if (lastUpdateTime != null) {

    //placing new river objs
    for(let i = 1; i <= riverObjCount; i ++){ //i starting from 1 because rivers start from 1 to riverObjCount
      if(boat_Z < objectsWorldMatrix[i][11] - river_S - 2) //objectsWorldMatrix[i][11] is the z of the worldmatrix (river i)
        objectsWorldMatrix[i][11] = objectsWorldMatrix[i][11] - river_S * riverObjCount * 2;
    }

    //placing random rocks
    for(let i = riverObjCount + 1; i < riverObjCount + 1 + rockObjlimit; i++) //rocks start from riverObjCount + 1
    {
        //placing random rocks
        if (objectsWorldMatrix[i][11] > boat_Z + 2) {
          rock_Z = boat_Z - river_S * 6 - Math.random() *  2 * river_S;
          objectsWorldMatrix[i][11] = rock_Z
          rock_X = Math.random() * (2 * river_S) - river_S;
          objectsWorldMatrix[i][3] = rock_X; //objectsWorldMatrix[i][3] is the rocks x
          // var rockTranslation = utils.MakeTranslateMatrix(dx,0.0,dz);
          // objectsWorldMatrix[i] = utils.multiplyMatrices(rockTranslation, objectsWorldMatrix[i]);
        }

        //check for collision - considering 3 circle alongside of the boat
        let dx = boat_X - objectsWorldMatrix[i][3]; //objectsWorldMatrix[i][3] is the x of the rock
        let dz1 = boat_Z + boat_InflationRadius - objectsWorldMatrix[i][11];
        let dz2 = boat_Z - objectsWorldMatrix[i][11];
        let dz3 = boat_Z - boat_InflationRadius - objectsWorldMatrix[i][11];
        let distance1 = Math.sqrt(dx * dx + dz1 * dz1);
        let distance2 = Math.sqrt(dx * dx + dz2 * dz2);
        let distance3 = Math.sqrt(dx * dx + dz3 * dz3);
        let limit;
        if(rockModelSelector[i - riverObjCount + 1] == 2)
          limit = boat_InflationRadius + rock1_InflationRadius; //big rock
        else 
          limit = boat_InflationRadius + rock2_InflationRadius; //small rock
        if (distance1 < limit || distance2 < limit || distance3 < limit ) {
          GameOver = true;
          alert("GAME OVER!! \nYour Score: " + points.innerHTML);
          window.location.reload();
        }
    }

    //placing new grass objs
    for(let i = 1 + riverObjCount + rockObjCount; i < objectsWorldMatrix.length; i ++){ //grass starts from riverObjCount + rockObjCount + 1
      if(boat_Z < objectsWorldMatrix[i][11] - river_S - 2)
        objectsWorldMatrix[i][11] = objectsWorldMatrix[i][11] - river_S * riverObjCount * 2;
    }

    kinemtic();
    drawObjects();
  }

  eyePosVector[0] = cx + boat_X;
  eyePosVector[1] = cy + 1;
  eyePosVector[2] = 2 + boat_Z;
  viewMatrix = utils.MakeView(eyePosVector[0], eyePosVector[1], eyePosVector[2], camElev, 0); //eye and camera are the at the same position always
  objectsWorldMatrix[0] = utils.MakeWorld(boat_X, boat_Y, boat_Z, boat_Rx, boat_Ry, boat_Rz, boat_S);

  lastUpdateTime = currentTime;
}

function drawScene() {

  if (!GameOver) {
    animate();
    var points = (-boat_Z + initialBoat_Z) * 5.0; //a simple formula to calculate the points of the player
    computePoints(Math.trunc(points));
  }
  window.requestAnimationFrame(drawScene);
}

//controls
var keys = [];
var vz = 0.0;
var rvy = 0.0;

var keyFunctionDown = function (e) {
  if (!keys[e.keyCode]) {
    keys[e.keyCode] = true;
    switch (e.keyCode) {
      case 37: //LEFT ARROW KEY DOWN
        turningDir = - 1;
        break;

      case 39: //RIGHT ARROW KEY DOWN
        turningDir = + 1;
        break;

      case 38: {
        linearDir = + 1;
        break;
      }

      case 40: //DOWN ARROW KEY DOWN
        linearDir = - 1;

        break;

      //camera controls
      case 87:
        camElev += 5;
        //console.log(camElev)
        break;
      case 83:
        camElev -= 5;
        //console.log(camElev)
        break;
    }
  }
}

var keyFunctionUp = function (e) {
  if (keys[e.keyCode]) {
    keys[e.keyCode] = false;
    switch (e.keyCode) {
      case 37: //LEFT ARROW KEY UP
        turningDir = 0;
        break;
      case 39: //RIGHT ARROW KEY UP
        turningDir = 0;
        break;
      case 38: //UP ARROW KEY UP
        linearDir = 0;
        break;
      case 40: //DOWN ARROW KEY DOWN
        linearDir = 0;
        break;
    }
  }
}

function kinemtic() {
  //boat turning
  angularVel += turningDir * angularAcc;
  if (Math.abs(angularVel) >= maxAngularVel)
    angularVel = Math.sign(angularVel) * maxAngularVel;

  //angular velocity degradation
  angularVel = angularVel * (1 - angularDrag);

  boat_Rx += angularVel;

  //boat speed
  linearVel += linearDir * linearAcc;
  if (Math.abs(linearVel) >= maxLinearVel)
    linearVel = Math.sign(linearVel) * maxLinearVel;

  //linear vel degradation
  linearVel = linearVel * (1 - linearDrag)

  //linear velocity axis decomposition
  velX = - linearVel * Math.cos(utils.degToRad(boat_Rx));
  velZ = - linearVel * Math.sin(utils.degToRad(boat_Rx));

  boat_X += velX;
  boat_Z += velZ;
  
  if(boat_X > river_S) boat_X = river_S;
  if(boat_X < -river_S) boat_X = -river_S;
}

function setGameLevel(level) {
  console.log("changed");
  if (level=="hard") {
    rockObjlimit = 30;
  }
  if (level=="medium") {  
    rockObjlimit = 20;
  }
  if (level=="easy") {
    rockObjlimit = 10;
  }
}

function computePoints(points) {
  document.getElementById("points").innerHTML = points;

}


function onRangeChange(value, id) {
  //console.log(value);
  if (id == 'dirTheta'){
    directionalDirTheta = utils.degToRad(-1*value);
    //conevrt light dir to 3D coordinate ..> valDir
    //window.alert(directionalDirTheta);
    //directionalLightDir = [Math.sin(directionalDirTheta) * Math.sin(directionalDirPhi),Math.cos(directionalDirTheta),Math.sin(directionalDirTheta) * Math.cos(directionalDirPhi)];
  directionalLightDir = [Math.cos(directionalDirTheta) * Math.cos(directionalDirPhi),Math.sin(directionalDirTheta),Math.cos(directionalDirTheta) * Math.sin(directionalDirPhi)];
  }
  else if (id =='dirPhi'){
    directionalDirPhi = utils.degToRad(-1*value);
       // window.alert(directionalDirTheta);
    //directionalLightDir = [Math.sin(directionalDirTheta) * Math.sin(directionalDirPhi),Math.cos(directionalDirTheta),Math.sin(directionalDirTheta) * Math.cos(directionalDirPhi)];
    directionalLightDir = [Math.cos(directionalDirTheta) * Math.cos(directionalDirPhi),Math.sin(directionalDirTheta),Math.cos(directionalDirTheta) * Math.sin(directionalDirPhi)];

  }
  drawObjects();
}

function onColorChange(value, id) {
  //set the color of the boat and light
  //window.alert(value);
  var aRgbHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
var aRgb = [
    parseInt(aRgbHex[1], 16)/255.0,
    parseInt(aRgbHex[2], 16)/255.0,
    parseInt(aRgbHex[3], 16)/255.0,
];
  if (id == 'direcionalLightColor')
    directionalLightColor = aRgb;
  else if (id == 'ambientLightColor'){
    ambientLight = aRgb;
   // window.alert(ambientLight)
  }
  else if (id == 'diffuseColor')
    diffuseColor = aRgb;

  drawObjects();
}


window.onload = initialize;


