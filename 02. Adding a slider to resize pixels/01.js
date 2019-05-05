let map;												// color map image

let textImg;
let font;
let tileWidth = 10;

let radiusSlider;
let radius = tileWidth / 2;

let checkbox;
let fillChecked = true;

// ---------------------------------------------------------------------------------------------
function preload() {
	font = loadFont('data/FreeSansBold.ttf'); 			// load p5 font
	map  = loadImage('data/colorMap.png');				// load color map image (360x360)
}

// ---------------------------------------------------------------------------------------------
function setup() {
	// let canvasWidth = document.getElementById('canvasHolder').offsetWidth;
	// let canvasHeight = document.getElementById('canvasHolder').offsetHeight;

	var canvas = createCanvas(360, 360);
	canvas.parent("canvasHolder"); 						// расположить канву в указанном <div>

	radiusSlider = createSlider(1, tileWidth, radius); 	// создать слайдер
	radiusSlider.parent("radiusController"); 			// расположить слайдер в указанном <div>
	radiusSlider.mouseReleased(update); 				// обработчик действия

	checkbox = createCheckbox('Fill', true); 			// создать чекбокс
	checkbox.parent("fillController"); 					// расположить чекбокс в этом <div>
	checkbox.changed(update); 							// обработчик действия

	setupTextImg();										// создать графический объект с текстом
	map.loadPixels();									// получить набор пикселей изображения color map
}

// ---------------------------------------------------------------------------------------------
function draw() {
	background(250, 220, 220); 							// розовый фон канвы

	for (let y = 0; y < height; y += tileWidth) {
		for (let x = 0; x < width; x += tileWidth) {

			// stroke(0);
			// noFill();
			// rect(x, y, tileWidth, tileWidth);
			// ellipseMode(CORNER);						// to place the circle inside the (unvisible) tile

			let i = (y * textImg.width + x) * 4;		// calculate the current pixel position

			if (textImg.pixels[i] != 255) {				// draw only the text, not the background
				if (fillChecked) {						// check the color in color map
					let r = map.pixels[i];
					let g = map.pixels[i + 1];
					let b = map.pixels[i + 2];
					let a = map.pixels[i + 3];
					let c = color(r, g, b, a);
					stroke(c);
					fill(c);
				} else {
					stroke(0);
					noFill();
				}
				ellipse(x, y, radius * 2, radius * 2);
			}
		}
	}
}

// ---------------------------------------------------------------------------------------------
function update() {

	radius = radiusSlider.value();

	if (checkbox.checked() == 1) {
		fillChecked = true;
	} else {
		fillChecked = false;
	}
}

// ---------------------------------------------------------------------------------------------
function setupTextImg() {
	textImg = createGraphics(width, height); 	// делаем размер изображения равным размеру канвы
	textImg.pixelDensity(1);					// плотность пикселей изображения
	textImg.background(255);					// изображение имеет белый background, а канва розовый
	textImg.textFont(font);
	textImg.textSize(150);
	textImg.text("ABC", 20, 50, 15, 15);		// 15 - ???
	textImg.loadPixels();
}