let font, img, numOfTiles, tileWidth;

function preload() {
	font = loadFont('data/FreeSansBold.ttf');
}

function setup() {
	createCanvas(500,500);
	setUpText();

	numOfTiles = width; 									// кол-во плиток-пикселей равно кол-ву самих пикселей
	tileWidth = Math.floor(width/numOfTiles);				// ширина каждой плитки-пикселя равна 1px
}

function draw(){

	noLoop();
	background(250, 220, 220);		// pink canvas background

	stroke(255);					// если ширина плитки-пикселя всего 1px, то цвет текста будет определять stroke()
	fill(100);						// а не fill()

	console.log(img);

	// рисуем всю картинку по одной плитке-пикселю
	for(let y = 0; y < height; y+=tileWidth) {
		for(let x = 0; x < width; x+=tileWidth) {

			// номер плитки-пикселя в массиве img.pixels
			let index = (y * img.width + x) * 4;

			// делать прорисовку только плиток-пикселей самого текста, то есть не белых (img.background(255))
			if(img.pixels[index] < 255) {         			
				rect(x, y, tileWidth, tileWidth);
			}
		}
	}
}

function setUpText() {

	img = createGraphics(width, height); 	// делаем размер изображения равным размеру канвы
	img.pixelDensity(1);					// плотность пикселей изображения
	img.background(255);					// изображение имеет белый background, а канва розовый

	img.textFont(font);
	img.textSize(200);
	img.text("ABC", 30, 100, 15, 15);		// 15 - ???

	img.loadPixels();
}