WebGL仅仅是一个光栅化引擎. WebGL在电脑的GPU中运行.需要使用能够在GPU上运行的代码:一个叫顶点着色器， 另一个叫片断着色器.组合起来称作一个 program（着色程序）.使用强类型的语言 GLSL.

顶点着色器的作用是计算顶点的位置。根据计算出的一系列顶点位置，对这些图元进行光栅化处理时需要使用片元着色器方法。片元着色器的作用是计算出当前绘制图元中每个像素的颜色值。

然后通过调用gl.drawArrays 或 gl.drawElements 运行一个着色方法对，使得你的着色器对能够在GPU上运行，对所需的任何数据都发送到GPU。

着色器获取数据的4种方法：

（1）属性（Attributes）和缓冲：

（2）全局变量（Uniforms）：全局变量在着色程序运行前赋值，在运行过程中全局有效。

（3）纹理（Textures）:

  (4)可变量（Varyings）:可变量是一种顶点着色器给片断着色器传值的方式，依照渲染的图元是点， 线还是三角形，顶点着色器中设置的可变量会在片断着色器运行中获取不同的插值。

WebGL只关心两件事：裁剪空间中的坐标值和颜色值. 顶点着色器提供裁剪空间坐标值，片元着色器提供颜色值。

无论画布有多大，裁剪空间的坐标范围永远是 -1 到 1。





步骤：

1.获取webgl上下文：

 <canvas id="c"> </canvas> 

let  canvas = document.getElementById("c");

let gl = canvas.getContext("webgl2");

if(!gl){console.log("no webgl2 for you");}

2.顶点着色器GLSL字符串：

let vertexShaderSource = `#version 300 es

in vec2 a_position; //an attribute that receive data from a buffer

uniform vec2 u_resolution;

void main(){

	//必须是裁剪坐标

	//gl_Position = a_position;

	//可以使a_position为像素坐标即可,翻转y轴

	vec2  clipSpace = (a_position/u_resolution)*2.0-1.0;

	gl_Position = vec4(clipSpace*vec2(1, -1), 0, 1);

}

`;

3.片元着色器GLSL字符串

let fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 u_color;

out vec4 outColor;

void main(){

	outColor = u_color;

}

`;

4.创建着色器

function createShader(gl,type,source){

	let shader = gl.createShader(type);

	gl.shaderSource(shader, source);

	gl.compileShader(shader);

	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	if(success){

		return  shader;

	}else{

		console.log(gl.getShaderInfoLog(shader));

		gl.deleteShader(shader);

	}

}

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

5.创建着色程序，将着色器放入着色程序

function createProgram(gl, vertexShader, fragmentShader){

	let program = gl.createProgram();

	gl.attachShader(program,vertexShader);

	gl.attachShader(program,fragmentShader);

	gl.linkProgram(program);

	let success = gl.getProgramParameter(program,gl.LINK_STATUS);

	if(success){

		return program;	

	}else{

		console.log(gl.getProgramInfoLog(program));		

		gl.deleteProgram(program);

	}

}

let program = createProgram(gl, vertexShader, fragmentShader);

6.提供数据

（1）查阅在program中的a_position变量的位置

let positionLocation = gl.getAttribLocation(program, "a_position");

let uniformLocation = gl.getUniformLocation(program, "u_resolution");

let colorLocation = gl.getUniformLocation(program, "u_color");

 (2)创建buffer

let positionBuffer = gl.createBuffer();

(3)将绑定点绑定到buffer上

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

（4）通过绑定点向缓冲存放数据。

let  positions = [

	0,0, 0,0.5, 0.7,0

];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

（5）取数据

//gl中用vao来记录数据

let vao = gl.createVertexArray();

 gl.bindVertexArray(vao);

//开启buffer，往出输数据

gl.enableVertexAttribArray(positionLocation );



//设置怎么输数据（参数：positionLocation,size,  type，normal,stride,offset）

positionLocation：着色器获取数据位置

size：每个顶点是几个数据

type：每个数据类型

normal：要不要对数据归一化

stride：取完上个点数据，隔几个后取下个点数据。

offset：这个buffer的开头从哪里取数据。

gl.vertexAttribPointer(positionLocation,2,gl.FLOAT,false,0,0);

以上为 初始化代码。这些代码在页面加载时只会运行一次。 接下来的代码是渲染代码，渲染代码在我们每次要渲染或者绘制时执行。

7.画布

画布像图片一样有两个尺寸：

（1） 一个是它拥有的实际像素个数

设置方式有两种：

一种是html设置<canvas width="200" height="300"></canvas>

一种是js设置canvas.width = 200;  canvas.height=300;

（2）另一个是它显示的大小。

CSS决定画布显示大小: style="width:200px; height:300px;"



所以在渲染前检查一下像素大小==显示大小：

function resize(canvas){

	let displayWidth = canvas.clientWidth;

	let displayHeight = canvas.clientHeigth;

	if(canvas.width !== displayWidth || canvas.height !== displayHeight){

		canvas.width = displayWidth;

		canvas.height = displayHeight;		

	}

}

（3）调用gl.viewport设置视域

gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

将裁剪空间（-1 到 +1）对应到画布的像素空间（x轴的 0 -> gl.canvas.width 和y轴的 0 -> gl.canvas.height）。当你改变画布大小就需要告诉WebGL新的视域设置。

注意：最好用下面的方法设置：

    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    
    gl.canvas.width = width;
    gl.canvas.height = height;

注意：

    var buffer = gl.createBuffer();
    buffer.itemSize = 3;        // 不好!!
    buffer.numComponents = 75;  // 不好!!
    
    var program = gl.createProgram();
    ...
    program.u_matrixLoc = gl.getUniformLocation(program, "u_matrix");  // 不好!!
    原因是WebGL可能“丢失上下文”，这样在大多数情况下没问题，但假如浏览器发现太多GPU资源被使用时， 可能会故意丢失WebGLRenderingContext的上下文用来释放一些空间。
    应该使用 JavaScript 对象。

（4）清空画布

gl.clearColor(0,0,0,0);

gl.clear(gl.COLOR_BUFFER_BIT);或者gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

用0, 0, 0, 0清空画布，分别对应 r, g, b, alpha值， 让画布变透明了.

8.渲染

gl.useProgram(program);

gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

gl.uniform2f(uniformLocation, gl.canvas.width, gl.canvas.height);

gl.bindVertexArray(vao);

//参数（绘制形状，起始点偏移 ，顶点个数）

//因为是三角形，所以每隔三个点就会画一个三角形。

gl.drawArrays(gl.TRIANGLES, 0, 3);

矩阵：

平移矩阵：

  1         	0         	0   
  0         	1         	0   
  translateX	translateY	1   

旋转矩阵：

  cos 	-sin	0   
  sin 	cos 	0   
  0   	0   	1   

缩放矩阵：

  sX  	0   	0   
  0   	sY  	0   
  0   	0   	1   


