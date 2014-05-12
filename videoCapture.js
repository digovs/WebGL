var vertPosBuf;
var vertTextBuf;
var gl;
var shader;

var video, videoImage, videoImageContext, videoTexture;

var actualFunction = 0;
var kernelFunction = 0;
var brightFunction = 1;
var contrastFunction = 2;
var sharpenFunction = 3;
var actualParameter = 0;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

// ********************************************************
// ********************************************************
function changeBright(bValue) {
	var text = document.getElementById("brightOutput");
	text.innerHTML = "Bright Value = " + bValue;
	actualFunction = brightFunction;
	actualParameter = bValue;
	drawScene(gl, shader, brightFunction, bValue);
}

// ********************************************************
// ********************************************************
function changeContrast(cValue) {
	var text = document.getElementById("contrastOutput");
	text.innerHTML = "Contrast Value = " + cValue;
	actualFunction = contrastFunction;
	actualParameter = cValue;
	drawScene(gl, shader, contrastFunction, cValue);
}

// ********************************************************
// ********************************************************
function changeSharpen(sValue) {
	var text = document.getElementById("sharpenOutput");
	text.innerHTML = "Sharpen Value = " + sValue;
	actualFunction = sharpenFunction;
	actualParameter = sValue;
	drawScene(gl, shader, sharpenFunction, sValue);
}

// ********************************************************
// ********************************************************
function gotStream(stream)  {
	if (window.URL) {   
		video.src = window.URL.createObjectURL(stream);   } 
	else {   
		video.src = stream;   
		}

	video.onerror = function(e) {   
							stream.stop();   
							};
	stream.onended = noStream;
}

// ********************************************************
// ********************************************************
function noStream(e) {
	var msg = "No camera available.";
	
	if (e.code == 1) {   
		msg = "User denied access to use camera.";   
		}
	document.getElementById("output").textContent = msg;
}

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
	vertPosBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPos), gl.STATIC_DRAW);
	vertPosBuf.itemSize = 3;
	vertPosBuf.numItems = vPos.length/vertPosBuf.itemSize;
		
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
	vertTextBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertTextBuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTex), gl.STATIC_DRAW);
	vertTextBuf.itemSize = 2;
	vertTextBuf.numItems = vTex.length/vertTextBuf.itemSize;
}

// ********************************************************
// ********************************************************
function drawScene(gl, shader, functionId, param) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (!videoTexture.needsUpdate) 
		return;
	
   	gl.useProgram(shader);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoImage);
	videoTexture.needsUpdate = false;

	gl.uniform2f(shader.vTextureSize, videoImage.width, videoImage.height);

	gl.uniform1i(shader.SamplerUniform, 0);
	
	switch (functionId) {
   		case brightFunction:
   			gl.uniform1i(shader.functionId, brightFunction);
   			gl.uniform1i(shader.brightFunctionId, brightFunction);
   			gl.uniform1f(shader.brightValue, param);
   			break;

   		case contrastFunction:
   			var filter = [
		 		-1, -1, -1,
		    	-1,  param, -1,
		    	-1, -1, -1
			];
			gl.uniform1i(shader.functionId, kernelFunction);
			gl.uniform1i(shader.kernelFunctionId, kernelFunction);
			gl.uniform1fv(shader.kernel, filter);
			break;

		case sharpenFunction:
   			var filter = [
		 		-2, -1,  0,
     			-1,  9,  1,
     			 0,  1,  2
			];
			gl.uniform1i(shader.functionId, kernelFunction);
			gl.uniform1i(shader.kernelFunctionId, kernelFunction);
			gl.uniform1fv(shader.kernel, filter);
			break;
   	}

	gl.enableVertexAttribArray(shader.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
	gl.vertexAttribPointer(shader.vertexPositionAttribute, vertPosBuf.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(shader.vertexTextAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertTextBuf);
	gl.vertexAttribPointer(shader.vertexTextAttribute, vertTextBuf.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);
}

// ********************************************************
// ********************************************************
function initTexture(gl, shader) {

	videoTexture = gl.createTexture();		
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	videoTexture.needsUpdate = false;
}

// ********************************************************
// ********************************************************
function webGLStart() {

	if (!navigator.getUserMedia) {
		document.getElementById("output").innerHTML = 
			"Sorry. <code>navigator.getUserMedia()</code> is not available.";
		}
	navigator.getUserMedia({video: true}, gotStream, noStream);

	// assign variables to HTML elements
	video = document.getElementById("monitor");
	videoImage = document.getElementById("videoImage");
	videoImageContext = videoImage.getContext("2d");
	
	// background color if no video present
	videoImageContext.fillStyle = "#000000";
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	
	canvas = document.getElementById("videoGL");
	gl = initGL(canvas);
	
	if (!gl) { 
		alert("Could not initialise WebGL, sorry :-(");
		return;
		}
		
	shader = initShaders("shader", gl);
	if (shader == null) {
		alert("Erro na inicilizacao do shader!!");
		return;
		}

	shader.vertexPositionAttribute 	= gl.getAttribLocation(shader, "aVertexPosition");
	shader.vertexTextAttribute 		= gl.getAttribLocation(shader, "aVertexTexture");
	shader.SamplerUniform	 		= gl.getUniformLocation(shader, "uSampler");
	shader.brightValue				= gl.getUniformLocation(shader, "brightValue");
	shader.textureSize				= gl.getUniformLocation(shader, "vTextureSize");
	shader.kernel					= gl.getUniformLocation(shader, "kernel");
	shader.functionId				= gl.getUniformLocation(shader, "functionId");

	shader.brightFunctionId			= gl.getUniformLocation(shader, "brightFunction");
	shader.kernelFunctionId			= gl.getUniformLocation(shader, "kernelFunction");

	if ( 	(shader.vertexPositionAttribute < 0) ||
			(shader.vertexTextAttribute < 0) ||
			(shader.SamplerUniform < 0) ) {
		alert("Shader attribute ou uniform nao localizado!");
		return;
		}
		
	initBuffers(gl);
	initTexture(gl, shader);
	animate(gl, shader);
}

function animate(gl, shader) {
    requestAnimationFrame( animate );
	render();		
}

function render() {	
	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
		videoImageContext.drawImage( video, 0, 0, videoImage.width, videoImage.height );
		videoTexture.needsUpdate = true;

	}
	drawScene(gl, shader, actualFunction, actualParameter);
}


