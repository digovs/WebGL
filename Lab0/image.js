var triangleVertexPositionBuffer;
var triangleTextureBuffer;
var triangleColorBuffer;
var triangleIndexFaceBuffer;
var texture=null;

// ********************************************************
// ********************************************************
function initGL(canvas) {
	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return (null);
		}
	
	gl.viewportWidth 	= canvas.width;
	gl.viewportHeight 	= canvas.height;
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	return gl;
}

// ********************************************************
// ********************************************************
function initBuffers(gl) {
var vPos = new Array;
var vTex = new Array;

	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V1
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0); 	// V0
	vPos.push(-1.0);
	vPos.push( 0.0);
	vPos.push( 1.0);	// V2
	vPos.push( 1.0);
	vPos.push( 0.0);
	vPos.push(-1.0);	// V3
	vPos.push( 1.0);
	vPos.push( 0.0);
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vPos.length/triangleVertexPositionBuffer.itemSize;
		
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V1
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0); 	// V0
	vTex.push( 0.0);
	vTex.push( 1.0);	// V2
	vTex.push( 1.0);
	vTex.push( 0.0);	// V3
	vTex.push( 1.0);
	triangleTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
	triangleTextureBuffer.itemSize = 2;
	triangleTextureBuffer.numItems = vTex.length/triangleTextureBuffer.itemSize;
}

// ********************************************************
// ********************************************************
var rgb = 0;
var red = 1;
var green = 2;
var blue = 3;
var width = 512;
var height = 512;

function drawScene(gl, shader, type) {

	gl.useProgram(shader);
   	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shader.SamplerUniform, 0);
	switch (type) {
		case 0:
			gl.viewport(0, width*1/3, gl.viewportWidth, gl.viewportHeight);
			gl.uniform1i(shader.newColor, 0);
			gl.uniformli(shader.bright, 35);
			break;

		case 1:
			gl.viewport(0, 0, gl.viewportWidth*1/3, gl.viewportHeight*1/3);
			gl.uniform1i(shader.newColor, 1);
			break;

		case 2:
			gl.viewport(width*1/3, 0, gl.viewportWidth*1/3, gl.viewportHeight*1/3);
			gl.uniform1i(shader.newColor, 2);
			break;

		case 3:
			gl.viewport(width*2/3, 0, gl.viewportWidth*1/3, gl.viewportHeight*1/3);
			gl.uniform1i(shader.newColor, 3);
			break;
	}
	
	gl.enableVertexAttribArray(shader.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.vertexAttribPointer(shader.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(shader.vertexTextAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextureBuffer);
	gl.vertexAttribPointer(shader.vertexTextAttribute, triangleTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
	
	
}

// ********************************************************
// ********************************************************


function initTexture(gl, shader) {

	texture = gl.createTexture();
	
	var image = new Image();
	image.onload = function(){
		var canvas 			= document.getElementById("imagem");
		var text 			= document.getElementById("output");
		canvas.width 		= image.width;
		canvas.height 		= image.width * 4 / 3;
		gl.viewportWidth 	= canvas.width;
		gl.viewportHeight 	= image.height;
		text.innerHTML 		= 	"Imagem :" + image.src + 
								"<br/> Dimensao = " + image.height +
								" <i>x</i> " + image.width;		
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		drawScene(gl, shader, rgb);
		drawScene(gl, shader, red);
		drawScene(gl, shader, green);
		drawScene(gl, shader, blue);

		width = image.width;
		height = image.height;
		}
	image.src = "images/lena.png";
}

// ********************************************************
// ********************************************************
function webGLStart() {

	var canvas = document.getElementById("imagem");
	var gl = initGL(canvas);
	
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
		}
		
	var shader = initShaders("shader", gl);
	if (shader == null) {
		alert("Erro na iniciliza��o do shader!!");
		return;
		}

	shader.vertexPositionAttribute 	= gl.getAttribLocation(shaderProgram, "aVertexPosition");
	shader.vertexTextAttribute 		= gl.getAttribLocation(shaderProgram, "aVertexTexture");
	shader.SamplerUniform	 		= gl.getUniformLocation(shader, "uSampler");
	shader.newColor					= gl.getUniformLocation(shader, "newColor");

	if ( 	(shader.vertexPositionAttribute < 0) ||
			(shader.vertexTextAttribute < 0) ||
			(shader.SamplerUniform < 0) ) {
		alert("Shader attribute ou uniform n�o localizado!");
		return;
		}
	initBuffers(gl);
	initTexture(gl, shader);
}

