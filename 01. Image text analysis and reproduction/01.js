let font;
let img;

function preload() {
	font = loadFont('data/FreeSansBold.ttf');
}

function setup() {
	createCanvas(500,500);
	setUpText();
}

function draw(){
	noLoop();

	background(250, 220, 220); 				// pink canvas background
	image(img, 0, 0);						// show graphics
}

function setUpText() {

	img = createGraphics(width, height);	// делаем размер изображения равным размеру канвы

	img.pixelDensity(1); 					// плотность пикселей изображения
	img.background(255);					// изображение имеет белый background, а канва розовый

	img.textFont(font);
	img.textSize(200);
	img.text("ABC", 30, 100, 15, 15);		// 15 - ???

	img.loadPixels();
}