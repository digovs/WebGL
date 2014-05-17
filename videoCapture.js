var vertPosBuf;
var vertTextBuf;
var gl;
var shader;

var video, videoImage, videoImageContext, videoTexture;
var image;

// default values
var brightValue = 0;
var contrastValue = 0;
var saturationValue = 0;
var kernel = [0, 0, 0,
			  0, 1, 0,
			  0, 0, 0];
			  
var warholSelected = false;

var radiusValue = 0;
var strengthValue = 0;
var centerXValue = 120;
var centerYValue = 160;

var background = 2;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

// ********************************************************
// ************   FIRST QUESTION BEGIN   ******************
// ********************************************************
function changeBright(bValue) {
	var text = document.getElementById("brightOutput");
	text.innerHTML = "Bright Value = " + bValue;
	brightValue = bValue;
}

// ********************************************************
// ********************************************************
function changeContrast(cValue) {
	var text = document.getElementById("contrastOutput");
	text.innerHTML = "Contrast Value = " + cValue;
	contrastValue = cValue;
}

// ********************************************************
// ********************************************************
function changeSaturation(satValue) {
	var text = document.getElementById("saturationOutput");
	text.innerHTML = "Saturation Value = " + satValue;
	saturationValue = satValue;
}

// ********************************************************
// ********************************************************
function changeSharpen(sValue) {
	var text = document.getElementById("sharpenOutput");
	text.innerHTML = "Sharpen Value = " + sValue;
	if (sValue == 0) {
		kernel = [0, 0, 0,
			  	  0, 1, 0,
			  	  0, 0, 0];
	} else if (sValue > 0) {
		kernel = [0,    -1,    0,
				 -1,  sValue, -1,
				  0,    -1,    0];
	}
}

// ********************************************************
// ******************QUESTÂO 4 ANDY WARHOL*****************
// ********************************************************

function checkWarhol() {
	 if (warholSelected) {
	 	document.getElementById('warholButton').value = "Apply Warhol's Effect";
	 	warholSelected = false;

	 }
	 else{
	 	document.getElementById('warholButton').value = "Disable Warhol's Effect";
		warholSelected = true;
	}
}

// ********************************************************
// ******************QUESTÂO 3 CHROMA KEY***************
// ********************************************************

function applyChroma() {
	var radioButtons = document.getElementsByName("color");
	var checked;
    for(var x = 0; x < radioButtons.length; x++) {
     	if(radioButtons[x].checked) {
      		checked = radioButtons[x].id; 
       	}
    }

    if(checked == "colorR") {
      	background = 0;
    } else if(checked == "colorB") {
       	background = 1;
    } else {
       	background = 2;
    }
}

// ********************************************************
// ******************QUESTÂO 2 TRANSFORMAÇÂO***************
// ********************************************************
function changeStrength(sValue){
	var text = document.getElementById("strengthOutput");
	text.innerHTML = "strength Value = " + sValue;
	strengthValue = sValue;
}

function changeRadius(sValue){
	var text = document.getElementById("radiusOutput");
	text.innerHTML = "Radius Value = " + sValue;
	radiusValue = sValue;
}

function changeCenterX(sValue){
	var text = document.getElementById("centerXOutput");
	text.innerHTML = "CenterX Value = " + sValue;
	centerXValue = sValue;
}

function changeCenterY(sValue){
	var text = document.getElementById("centerYOutput");
	text.innerHTML = "centerY Value = " + sValue;
	centerYValue = sValue;
}

function reset() {
	changeBright(0);
	changeContrast(0);
	changeSaturation(0);
	changeSharpen(0);
	document.getElementById('warholButton').value = "Apply Warhol's Effect";
	warholSelected = false;
	background = 2;
	var rb = document.getElementById("colorD");
	rb.checked = true;
}

function gotStream(stream)  {
	if (window.URL) {   
		video.src = window.URL.createObjectURL(stream);   
	} else {   
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
function drawScene(gl, shader) {
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (!videoTexture.needsUpdate) 
		return;
	
   	gl.useProgram(shader);

   	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, videoTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoImage);
	videoTexture.needsUpdate = false;

	gl.uniform2f(shader.vTextureSize, gl.viewportWidth, gl.viewportHeight);
	gl.uniform1i(shader.SamplerUniform, 0);
	
	// APPLY USER VALUES
	gl.uniform1f(shader.brightValue, brightValue);
	gl.uniform1f(shader.contrastValue, contrastValue);
	gl.uniform1f(shader.saturationValue, saturationValue);
	gl.uniform1fv(shader.kernel, kernel);

			
	gl.enableVertexAttribArray(shader.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertPosBuf);
	gl.vertexAttribPointer(shader.vertexPositionAttribute, vertPosBuf.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.enableVertexAttribArray(shader.vertexTextAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertTextBuf);
	gl.vertexAttribPointer(shader.vertexTextAttribute, vertTextBuf.itemSize, gl.FLOAT, false, 0, 0);

	if (warholSelected == true) {
		gl.uniform1f(shader.saturationValue, 0.85);
		var text = document.getElementById("saturationOutput");
		text.innerHTML = "Saturation Value = " + 0.85;
		gl.uniform1i(shader.warholSelected, 1);
		gl.viewport(0, 0, gl.viewportWidth/2.0, gl.viewportHeight/2.0);
		gl.uniform1i(shader.warholColors, 0);
		gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);

		gl.viewport(0, gl.viewportHeight/2.0, gl.viewportWidth/2.0, gl.viewportHeight/2.0);
		gl.uniform1i(shader.warholColors, 1);
		gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);

		gl.viewport(gl.viewportWidth/2.0, 0, gl.viewportWidth/2.0, gl.viewportHeight/2.0);
		gl.uniform1i(shader.warholColors, 2);
		gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);

		gl.viewport(gl.viewportWidth/2.0, gl.viewportHeight/2.0, gl.viewportWidth/2.0, gl.viewportHeight/2.0);
		gl.uniform1i(shader.warholColors, 3);
		gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);
		
	} else {
		gl.uniform1i(shader.warholSelected, 0);
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.drawArrays(gl.TRIANGLES, 0, vertPosBuf.numItems);
	}

	gl.uniform1f(shader.strengthValue, strengthValue);
	gl.uniform1f(shader.radiusValue, radiusValue);
	gl.uniform2f(shader.centerVector, centerXValue, centerYValue);

	gl.uniform1i(shader.background,background);
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
	
	// background c if no video present
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
	shader.contrastValue			= gl.getUniformLocation(shader, "contrastValue");
	shader.saturationValue 			= gl.getUniformLocation(shader, "saturationValue");

	shader.radiusValue				= gl.getUniformLocation(shader, "radiusValue");
	shader.strengthValue			= gl.getUniformLocation(shader, "strengthValue");
	shader.centerVector				= gl.getUniformLocation(shader, "centerVector");

	shader.warholColors 			= gl.getUniformLocation(shader, "warholColors");
	shader.warholSelected 			= gl.getUniformLocation(shader, "warholSelected");
	shader.vTextureSize				= gl.getUniformLocation(shader, "vTextureSize");
	shader.kernel					= gl.getUniformLocation(shader, "kernel[0]");

	shader.background				= gl.getUniformLocation(shader, "background");

	if (	(shader.vertexPositionAttribute < 0) ||
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
	drawScene(gl, shader);
}


