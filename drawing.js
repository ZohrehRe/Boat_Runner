var program0;
var program1;
var gl;
var shaderDir;
var baseDir;
var lastUpdateTime;

var boatModel;
var rockModel;
var rock2Model;
var oceanModel;
var lost = false;


var cubeMaterialColor = [0.0, 0.0, 0.5];
var cubeWorldMatrix = utils.MakeWorld(0.0, -0.15, 0.0, 90.0, 0.0, 0.0, 50.0);
var cubeNormalMatrix = utils.invertMatrix(utils.transposeMatrix(cubeWorldMatrix));

var object = [];
var objectsWorldMatrix = [];
var objectsIndices = [];

//attributes and uniforms
var positionAttributeLocation = Array();
var uvAttributeLocation = Array();
var matrixLocation = Array();
var textLocation = Array();
var normalAttributeLocation = Array();
var normalMatrixPositionHandle = Array();
var worldMatrixLocation = Array();


var materialDiffColorHandle = Array();
var lightDirectionHandle = Array();
var lightColorHandle = Array();
var ambientLightcolorHandle = Array();
var specularColorHandle = Array();
var specShineHandle = Array();
var eyePositionHandle = Array();


var vaos = new Array();
var textures = new Array();
var modelStr = Array();
var modelTexture = Array();

//matrices
var viewMatrix;
var perspectiveMatrix;

//lights
//define directional light
var dirLightAlpha = -utils.degToRad(322);
var dirLightBeta = -utils.degToRad(91);
var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
Math.sin(dirLightAlpha),
Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
];
var directionalLightColor = [1.0, 1.0, 1.0];
var ambientLight = [0.807843137254902, 0.792156862745098, 0.792156862745098];
var specularColor = [0.5, 0.5, 0.5];
var specShine = 100;

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
var maxLinearVel = 0.04;
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
oceanStr = 'Assets/ocean-obj/ocean.obj';

//modelStr[3] = 'Assets/ocean2/hdri-ca-sky.obj';

boatText = 'Assets/Boat/textures/boat_diffuse.bmp';
rock1Text = 'Assets/Rocks/Rock1/textures/rock_low_Base_Color.png';
rock2Text = 'Assets/Rocks/Rock2/Rock_1_Tex/Rock_1_Base_Color.jpg';
oceanText = 'Assets/ocean-obj/woter.jpg';

//modelTexture[3] = 'Assets/ocean2/CA-Sky-2016-04-15-11-30-am.jpg';


//modelTexture[4] = 'Assets/sky/crate.png';


var nFrame = 0;
var pageReady = false;


/***********************************************************************************************/

//creating the scene objects

//var boat = new Item(0.0, -0.15, 0.0, 90.0, 0.0, 0.0, 1.0 / 1000.0, boatStr, boatText);
var boat_X = 0.0;
var boat_Y = -0.15;
var boat_Z = 0.0;
var boat_Rx = 90.0;
var boat_Ry = 0.0;
var boat_Rz = 0.0;
var boat_S = 1.0 / 1000.0;
var boat_Radius = 0.25;
var boat_indices = 0;
var boat_materialColor = [1.0, 1.0, 1.0];
var boat_WorldMatrix = utils.MakeWorld(boat_X, boat_Y, boat_Z, boat_Rx, boat_Ry, boat_Rz, boat_S);

//var ocean = new Item(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
var ocean_X = 0.0;
var ocean_Y = 0.0;
var ocean_Z = 0.0;
var ocean_Rx = 0.0;
var ocean_Ry = 0.0;
var ocean_Rz = 0.0;
var ocean_S = 5.0;
var ocean_indices = 0;
var ocean_materialColor = [1.0, 1.0, 1.0];
var ocean_WorldMatrix = utils.MakeWorld(ocean_X, ocean_Y, ocean_Z, ocean_Rx, ocean_Ry, ocean_Rz, ocean_S);

//var ocean2 = new Item(0.0, 0.0, -9.5, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
//var ocean3 = new Item(0.0, 0.0, -19.0, 0.0, 0.0, 0.0, 5.0, oceanStr, oceanText);
var rocks = [];
var rocksWorldMatrix = [];
var rockModelSelector = [];
function createRocks() {

  let min = -5;
  let max = +5;

  objectsIndices[2] = rockModel.indices;
  objectsIndices[3] = rock2Model.indices;

  for (i = 0; i < 15; i++) {
    var rock_X = (Math.random() * (max - min) + min);
    var rock_Y = -0.15;
    var rock_Z = (Math.random() * (max - min) + min);
    var rock_Rx = 0.0;
    var rock_Ry = 0.0;
    var rock_Rz = 0.0;
    var rock_Radius = 0.25;
    var rock_S = 1.0 / 20.0;
    //rock1 = new Item(, , , 0.0, 0.0, 0.0, 1.0 / 20.0, rock1Str, rock1Text);
    //rock2 = new Item((Math.random() * (max - min) + min), -0.15, (Math.random() * (max - min) + min), 0.0, 0.0, 0.0, 1.0 / 5.0, rock2Str, rock2Text);
    rock_WorldMatrix = utils.MakeWorld(rock_X, rock_Y, rock_Z, rock_Rx, rock_Ry, rock_Rz, rock_S);
    rocksWorldMatrix.push(rock_WorldMatrix);
    var randomModel;

    if(Math.random() > 0.5) randomModel = 1;
    else randomModel = 2;
    rockModelSelector.push(randomModel);

    objectsWorldMatrix.push(rock_WorldMatrix);
    // rock1.setAttr(rockModel.vertices, rockModel.vertexNormals, rockModel.indices, rockModel.textures);
    // rock1.setMaterialColor([1.0, 1.0, 1.0]);

    // rock2.setAttr(rock2Model.vertices, rock2Model.vertexNormals, rock2Model.indices, rock2Model.textures);
    // rock2.setMaterialColor([1.0, 1.0, 1.0]);


    // rocks.push(rock1);
    // rocks.push(rock2);
    // object.push(rock1);
    // object.push(rock2);


  }

  //console.log(rocks);
  //console.log(object);

}



function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function main() {
  document.getElementById("t").style.visibility = "hidden";

  utils.resizeCanvasToDisplaySize(gl.canvas);
  //how to go from normalized coordinate to screen coordinate
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  //background color
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //boat_Obj.setAttr(boatModel.vertices, boatModel.vertexNormals, boatModel.indices, boatModel.textures);
  //boat_Obj.setMaterialColor([1.0, 1.0, 1.0]); // set material color for boat  
  boat_materialColor = [1.0, 1.0, 1.0];

  //ocean.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  //ocean.setMaterialColor([1.0, 1.0, 1.0]);
  ocean_materialColor = [1.0, 1.0, 1.0];

  //ocean2.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  //ocean2.setMaterialColor([1.0, 1.0, 1.0]);

  //ocean3.setAttr(oceanModel.vertices, oceanModel.vertexNormals, oceanModel.indices, oceanModel.textures);
  //ocean3.setMaterialColor([1.0, 1.0, 1.0]);

  /* Load corresponding information from the models */
  //object[0] = boat_Obj;
  objectsWorldMatrix[0] = boat_WorldMatrix;
  objectsIndices[0] = boatModel.indices;
  objectsWorldMatrix[1] = ocean_WorldMatrix;
  objectsIndices[1] = oceanModel.indices;
  //object[0] = ocean;
  //object[1] = ocean;
  //object[2] = ocean2;
  //object[3] = ocean3;

  createRocks();
  /* Retrieve the position of the attributes and uniforms */
  getShadersPos()



  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

  cx = 0.0;
  cy = 0.0;
  cz = 2.5;
  camElev = 15.0;
  camAngle = 0.0;


  viewMatrix = utils.MakeView(cx + boat_X, cy + 1, 2 + boat_Z, camElev, 0);

  setBuffers();
  drawScene();

}

async function init() {

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir + "shaders/";

  var canvas = document.getElementById("c");

  lastUpdateTime = (new Date).getTime();

  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program0 = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  await utils.loadFiles([shaderDir + 'vs_unlit.glsl', shaderDir + 'fs_unlit.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    program1 = utils.createProgram(gl, vertexShader, fragmentShader);
  });



  //###################################################################################
  //This loads the obj model in the boatModel variable
  var boatObjStr = await utils.get_objstr(baseDir + boatStr);
  boatModel = new OBJ.Mesh(boatObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rockObjStr = await utils.get_objstr(baseDir + rock1Str);
  rockModel = new OBJ.Mesh(rockObjStr);
  //###################################################################################

  //###################################################################################
  //This loads the obj model in the rockModel variable
  var rock2ObjStr = await utils.get_objstr(baseDir + rock2Str);
  rock2Model = new OBJ.Mesh(rock2ObjStr);
  //###################################################################################

  var oceanObjStr = await utils.get_objstr(baseDir + oceanStr);
  oceanModel = new OBJ.Mesh(oceanObjStr);

  initControls(canvas);

  main();
}



function getShadersPos() {
  //to pass the position of the vertices that is in the vbo/ input of the glsl comes from vbo 
    //where glsl expects to find input data
  positionAttributeLocation[0] = gl.getAttribLocation(program0, "a_position");
  uvAttributeLocation[0] = gl.getAttribLocation(program0, "a_uv");
  matrixLocation[0] = gl.getUniformLocation(program0, "matrix");
  worldMatrixLocation[0] = gl.getUniformLocation(program0, "worldmatrix");

  textLocation[0] = gl.getUniformLocation(program0, "u_texture");

  normalAttributeLocation[0] = gl.getAttribLocation(program0, "inNormal");
  //handel to normal matrix
  normalMatrixPositionHandle[0] = gl.getUniformLocation(program0, 'nMatrix');

  eyePositionHandle[0] = gl.getUniformLocation(program0, "eyePos");

  materialDiffColorHandle[0] = gl.getUniformLocation(program0, 'mDiffColor');
  lightDirectionHandle[0] = gl.getUniformLocation(program0, 'lightDirection');
  lightColorHandle[0] = gl.getUniformLocation(program0, 'lightColor');
  ambientLightcolorHandle[0] = gl.getUniformLocation(program0, 'ambientLightcolor');
  specularColorHandle[0] = gl.getUniformLocation(program0, 'specularColor');
  specShineHandle[0] = gl.getUniformLocation(program0, 'SpecShine');

  positionAttributeLocation[1] = gl.getAttribLocation(program1, "a_position");
  matrixLocation[1] = gl.getUniformLocation(program1, "matrix");

  //var colorLocation = gl.getUniformLocation(program1, "u_color");
}

function setBuffers() {

  vaos[100] = gl.createVertexArray();
  gl.bindVertexArray(vaos[100]);

  //creat vbo(vertex obj buffer)
  var positionBuffer = gl.createBuffer();
  //bind it to array buf(data assosiated to vertices) = set it as the active buf
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //puting vertexes in the positionBuffer/ static draw cause we do not change the data in the buf
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  //enable attr to be able to use them
  gl.enableVertexAttribArray(positionAttributeLocation[1]);
  //how glsl should interpret the data array, size for each vertex, type of data, normalize?,how to jump, index to start
  gl.vertexAttribPointer(positionAttributeLocation[1], 3, gl.FLOAT, false, 0, 0);


  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


  //set the buffer for the boat
  gl.useProgram(program0);
  vaos[0] = gl.createVertexArray(); //0 for boat
  gl.bindVertexArray(vaos[0])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[0]);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation[0]);
  gl.vertexAttribPointer(uvAttributeLocation[0], 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boatModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boatModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation[0]);
  gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  textures[0] = gl.createTexture();

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

  //set the buffer for ocean
  gl.useProgram(program0);
  vaos[1] = gl.createVertexArray(); //1 for ocean
  gl.bindVertexArray(vaos[1])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oceanModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[0]);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oceanModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation[0]);
  gl.vertexAttribPointer(uvAttributeLocation[0], 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(oceanModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(oceanModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation[0]);
  gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  textures[1] = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);

  image = new Image();
  image.crossOrigin = "anonymous";
  image.src = baseDir + oceanText;

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
  gl.useProgram(program0);
  vaos[2] = gl.createVertexArray(); //2 for rock model 1
  gl.bindVertexArray(vaos[2])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[0]);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation[0]);
  gl.vertexAttribPointer(uvAttributeLocation[0], 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rockModel.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rockModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation[0]);
  gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

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
  gl.useProgram(program0);
  vaos[3] = gl.createVertexArray(); //3 for rock model 2
  gl.bindVertexArray(vaos[3])

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation[0]);
  gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation[0]);
  gl.vertexAttribPointer(uvAttributeLocation[0], 2, gl.FLOAT, false, 0, 0);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rock2Model.indices), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rock2Model.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation[0]);
  gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

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
  pageReady = true;
  pageLoader();
}



function drawObjects() {

  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var j = 0;
  for (let i = 0; i < objectsWorldMatrix.length ; ++i) {
    gl.useProgram(program0);
    //for each obj compute world matrix
    var worldViewMatrix = utils.multiplyMatrices(viewMatrix, objectsWorldMatrix[i]);
    //compute projection matrix =projection matrix
    var worldViewProjection = utils.multiplyMatrices(perspectiveMatrix, worldViewMatrix);
    //set the projection matrix in the uniform
    gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(worldViewProjection));
    gl.uniformMatrix4fv(worldMatrixLocation[0], gl.FALSE, utils.transposeMatrix(objectsWorldMatrix[i]));
    //set invert transpose of world matrix as normal , fekr konam hazf
    var objNormalMatrix = utils.invertMatrix(utils.transposeMatrix(objectsWorldMatrix[i]));
    gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(objNormalMatrix));

    //ezafe kardan e light dir

    //setting the unifirms
    gl.uniform3fv(materialDiffColorHandle[0], [1.0,1.0,1.0]);
    gl.uniform3fv(lightColorHandle[0], directionalLightColor);
    gl.uniform3fv(lightDirectionHandle[0], directionalLight);
    gl.uniform3fv(ambientLightcolorHandle[0], ambientLight);
    gl.uniform3fv(specularColorHandle[0], specularColor);
    gl.uniform1f(specShineHandle[0], specShine);
    gl.uniform3f(eyePositionHandle[0], cx, cy, cz);

    if (i > 3){
      if(rockModelSelector[i] == 1)
        j = 2;
      else 
        j = 3;
    } else {
      j = i;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[j]);
    gl.uniform1i(textLocation[0], textures[j]);

    //bind vertex array and draw
    gl.bindVertexArray(vaos[j]);
    gl.drawElements(gl.TRIANGLES, objectsIndices[j].length, gl.UNSIGNED_SHORT, 0);
  }
}

var counter = 0;

//az ru tamrin 4
var jj = 0;
function animate() {
  var currentTime = (new Date).getTime();
  if (lastUpdateTime != null) {
    //khodeshun
    //rocks.forEach(rock => circleCollision(rock));
    //rockPlacement();
    //oceanPlacement();
    var min = -5.0;
    var max = 5.0;
    // if (objectsWorldMatrix[2][11] > boat_Z + 2) {
    //       //var dz = boat_Z - drawDistance;
    //       //var dx = Math.random() * (max - min) + min;
    //       //var rockTranslation = utils.MakeTranslateMatrix(0.0,0.0,-3.0);
    //       //objectsWorldMatrix[2] = utils.multiplyMatrices(rockTranslation,objectsWorldMatrix[2]);
    //       objectsWorldMatrix[2][11] = objectsWorldMatrix[2][11] - 3.0;
    //     }
    for(let i = 2; i < objectsWorldMatrix.length; i++)
    {
        var drawDistance = 10;
        if (objectsWorldMatrix[i][11] > boat_Z + 2) {
          objectsWorldMatrix[i][11] = boat_Z - drawDistance;
          objectsWorldMatrix[i][3] = Math.random() * (max - min) + min;
          // var rockTranslation = utils.MakeTranslateMatrix(dx,0.0,dz);
          // objectsWorldMatrix[i] = utils.multiplyMatrices(rockTranslation, objectsWorldMatrix[i]);
        }

        // rocks.forEach(rock => {
        //   if (rock.z > boat_Z + 2) {
        //     rock.z = boat_Z - drawDistance;
        //     rock.x = Math.random() * (max - min) + min;
        //   }
    }
    boatDynamic(currentTime);
  }

  /* depending on which object we want to animate we change the worldmatrix of the object */
  //objectWorldMatrix[0] = utils.MakeWorld(0.0, item.y, item.z, item.Rx, item.Ry, item.Rz, item.S);
  counter += 0.005;
  //item.z = counter % 2;
  //item.y = counter;

  //(0, -1, 2, 45, 0)
  //item.z -= 0.002;
  viewMatrix = utils.MakeView(cx + boat_X, cy + 1, 2 + boat_Z, camElev, 0);


  //<---- la barca si muove verso la z negativa
  //item.y += 0.002;

  //set world matrix and last updatetime

  objectsWorldMatrix[0] = utils.MakeWorld(boat_X, boat_Y, boat_Z, boat_Rx, boat_Ry, boat_Rz, boat_S);

  //for (let i = 1; i < object.length; i++) {
    //objectsWorldMatrix[i] = object[i].buildWorldMatrix();
  objectsWorldMatrix[1] = utils.MakeWorld(ocean_X, ocean_Y, ocean_Z, ocean_Rx, ocean_Ry, ocean_Rz, ocean_S);
  //}
  lastUpdateTime = currentTime;
}

function drawScene() {

  if (!lost)
    animate();
    //animate(boat_Obj);

  drawObjects();

  //call request at each frame
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
        const element = document.getElementById("chbx");
        /* When the player starts playing, also the music start */
        if (element.checked != true) {
          element.checked = true;
          const e = new Event("change");
          element.dispatchEvent(e);
        }


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

function initControls(canvas) {
  window.addEventListener("keyup", keyFunctionUp, false);
  window.addEventListener("keydown", keyFunctionDown, false);


}


function boatDynamic(currentTime) {
  //console.log(linearVel);
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

  // Need to correctly tune the translation of the cube along the boat translation

  cubeWorldMatrix = utils.multiplyMatrices(cubeWorldMatrix, utils.MakeTranslateMatrix(velZ / 50.0, 0.0, 0.0));


  //simple boat "wobbling" around its y axis, must be implemented better
  if (Math.random() > 0.8) {
    boat_Ry += Math.sin(utils.degToRad(currentTime)) / 8;
  }

}


function dirLightChange(value, type) {
  //console.log(value);
  if (type == 'alpha')
    dirLightAlpha = -utils.degToRad(value);
  else
    dirLightBeta = -utils.degToRad(value);
//conevrt light dir to 3D coordinate
  directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
  Math.sin(dirLightAlpha),
  Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
  ];


  drawObjects();


}

function onColorChange(value, type) {
  //set the color of the boat and light
  let result = HEX2RGB(value);
  var r = result[0] / 255.0;
  var g = result[1] / 255.0;
  var b = result[2] / 255.0;
  if (type == 'ambient')
    ambientLight = [r, g, b];
  else if (type == 'directional')
    directionalLightColor = [r, g, b];
  else if (type == 'material')
    boat_materialColor = [r, g, b];
  else
    specularColor = [r, g, b];

  drawObjects();
}

function onSpecShineChange(value) {
  //console.log(value)
  specShine = value;

  drawObjects();
}

function circleCollision(obj2) {
  let dx = boat_X - rock_X;
  let dz = boat_Z - rock_Z;

  let distance = Math.sqrt(dx * dx + dz * dz);
  //collision happening
  if (distance < boat_Radius + rock_Radius) {
    //console.log("HIT");
    lost = true;
    document.getElementById("Lost").style.visibility = "visible";
    const element = document.getElementById("chbx");
    if (element.checked) {
      element.checked = false;
      const e = new Event("change");
      element.dispatchEvent(e);
    }


  }
}



function rockPlacement() {
  let min = - 5;
  let max = + 5;
  let drawDistance = 10
  //console.log(rocks);
  rocks.forEach(rock => {
    if (rock.z > boat_Z + 2) {
      rock.z = boat_Z - drawDistance;
      rock.x = Math.random() * (max - min) + min;
    }
  })
}

function oceanPlacement() {

  // if (boat_Z < ocean.z - 9.5) {
  //   //console.log("true");
  //   ocean.z -= 28.5;

  // }

  // if (boat_Z < ocean2.z - 9.5) {
  //   //console.log("true");
  //   ocean2.z -= 28.5;

  // }

  // if (boat_Z < ocean3.z - 9.5) {
  //   //console.log("true");
  //   ocean3.z -= 28.5;

  // }


}


window.onload = init;


