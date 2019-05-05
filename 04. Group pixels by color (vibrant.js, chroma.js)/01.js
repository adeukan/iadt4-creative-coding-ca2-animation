let map;                                            // color map image
let textImage;                                      // text image
let cellSize = 5;                                   // cell width & height (density)
let font;

let radiusSlider;                                   // control variables and their initial values
let radius = cellSize / 2;
let textSizeSlider;
let textSize = 150;
let randomSlider;
let randomValue = 0;
let fillCheckbox;
let fillChecked = true;
let animateCheckbox;
let animateChecked = false;

let startArray = [];                                // arrays of start and finish points
let finalArray = [];

var palette = [];                                   // palette with 6 dominant colors of the color map

let xNow;                                           // current position of each point
let yNow;
let counter = 0;                                    // animation step counter


// ----------------------------------------------------------------------------------------------------------------
function preload() {                                                            
    map = loadImage('data/colorMap.png');                                                    // preload color map          
    font = loadFont('data/FreeSansBold.ttf');                                                // preload text font

    Vibrant.from('data/colorMap.png').getPalette().then( p => {                              // get palette from color map

        palette = [                                                                          // save as HEX palette
            rgbToHex(p.DarkMuted._rgb[0], p.DarkMuted._rgb[1], p.DarkMuted._rgb[2]),
            rgbToHex(p.DarkVibrant._rgb[0], p.DarkVibrant._rgb[1], p.DarkVibrant._rgb[2]),
            rgbToHex(p.LightMuted._rgb[0], p.LightMuted._rgb[1], p.LightMuted._rgb[2]),
            rgbToHex(p.LightVibrant._rgb[0], p.LightVibrant._rgb[1], p.LightVibrant._rgb[2]),
            rgbToHex(p.Muted._rgb[0], p.Muted._rgb[1], p.Muted._rgb[2]),
            rgbToHex(p.Vibrant._rgb[0], p.Vibrant._rgb[1], p.Vibrant._rgb[2])
        ];
                           
        setupTextImg();                                                                      // setup text image
        map.loadPixels();                                                                    // load the color map pixels
        createArrays();                                                                      // create start and finish arrays
    });

}

// ----------------------------------------------------------------------------------------------------------------
function setup() {

    var canvas = createCanvas(360, 360);
    canvas.parent("canvasHolder");
                                                            
    radiusSlider = createSlider(1, cellSize, radius);                  // control element and its initial value
    radiusSlider.parent("radiusController");                           // location of the control element
    radiusSlider.mouseReleased(update);                                // event handler

    cellSizeSlider = createSlider(-20, -1, -cellSize);                 // slider range from '20' to '1'
    cellSizeSlider.parent("cellSizeController");
    cellSizeSlider.mouseReleased(update);

    textSizeSlider = createSlider(50, 200, 150);
    textSizeSlider.parent("textSizeController");
    textSizeSlider.mouseReleased(update);

    randomSlider = createSlider(0, 100, randomValue);
    randomSlider.parent("randomController");
    randomSlider.mouseReleased(update);

    fillCheckbox = createCheckbox('Fill', true);
    fillCheckbox.parent("fillController");
    fillCheckbox.changed(update);

    animateCheckbox = createCheckbox('Animate', false);
    animateCheckbox.parent("animationController");
    animateCheckbox.changed(update);
}

// ----------------------------------------------------------------------------------------------------------------
function createArrays() {

    startArray = [];                                                   // start point positions
    finalArray = [];                                                   // final point positions

    for (let y = 0; y < width; y += cellSize) {                        // use standard grid loop to populate arrays
        for (let x = 0; x < width; x += cellSize) {

            let i = (y * textImage.width + x) * 4;                     // the index of left-top pixel of the cell 

            if (textImage.pixels[i] != 255) {                          // set pixel color according to the same pixel of the map             
                                                                       // process only text pixels, not the background (255)                           
                let r = map.pixels[i];                          
                let g = map.pixels[i + 1];
                let b = map.pixels[i + 2];
                let a = map.pixels[i + 3];
                var c = color(r, g, b, a);

                var colour = rgbToHex(r, g, b);                        // hex color used to calculate distance between two colors                                        
                var distance = 255;                                    // maximum distance between two colors in RGB cube
                var nearestColor;                                      // index of nearest colour from the palette
                palette.forEach((pColor, index) => {                   // find nearest pallete colour
                    if(chroma.distance(colour, pColor) < distance) {   // chroma.js used to calculate colour distance
                        distance = chroma.distance(colour, pColor);
                        nearestColor = index;
                    }
                });

                startArray.push({
                    xPos: x + random(-randomValue, randomValue),       // randomize the start position
                    yPos: y + random(-randomValue, randomValue),
                    color: c,
                    nearest: nearestColor                              // the color group
                });

                finalArray.push({
                    xPos: x,
                    yPos: y,
                    color: c,
                    nearest: nearestColor                              // the color group
                });
            }
        }
    }
}

// ----------------------------------------------------------------------------------------------------------------
function draw() {

    background(220, 220, 220);                                              // grey background                                                 

    // stroke(0);                                                           // show how the density slider works
    // noFill();
    // for (let y = 0; y < width; y += cellSize) {
    //     for (let x = 0; x < width; x += cellSize)
    //         rect(x, y, cellSize, cellSize);
    // }

    if (animateChecked) {                                                   // IF ANIMATION REQUIRED
        startArray.forEach((point, i) => {                                  // display all points at their current position

            xNow = lerp(point.xPos, finalArray[i].xPos, 0.01 * counter);    // calculate current point position
            yNow = lerp(point.yPos, finalArray[i].yPos, 0.01 * counter);

            if (fillChecked) {                                              // setup the color
                fill(point.color);
                stroke(point.color);
            } else {
                noFill();
                stroke(0);
            }
            ellipse(xNow, yNow, radius * 2, radius * 2);                    // display point at current position
        });

        if (counter > 100) {                                                // if the last step of animation is reached
            noLoop();                                                       // stop animation
            animateChecked = false;                                         // reset 'Animate' checkbox
            animateCheckbox.checked(false);
            randomValue = 0;                                                // reset 'Randomness' slider
            randomSlider.value(0);
        }
    } else {                                                                // IF ANIMATION IS NOT REQUIRED
        
        noLoop();
        startArray.forEach( point => {                                      // just display start points
            
            if (fillChecked) {                                              // setup the color
                fill(point.color);
                stroke(point.color);
            } else {
                noFill();
                stroke(0);
            }
            ellipse(point.xPos, point.yPos, radius * 2, radius * 2);        // display point at start position
        });
    }

    counter++;                                                              // next animation step
}

// ----------------------------------------------------------------------------------------------------------------
function update() {

    counter = 0;                                // reset animation counter
                                                // update all control values
    if (fillCheckbox.checked() == 1)            
        fillChecked = true;
    else
        fillChecked = false;

    if (animateCheckbox.checked() == 1)
        animateChecked = true;
    else
        animateChecked = false;

    radius = radiusSlider.value();
    randomValue = randomSlider.value();
    cellSize = -cellSizeSlider.value();
    textSize = textSizeSlider.value();

    setupTextImg();                             // setup image according to new text size
    createArrays();                             // create new arrays
    loop();                                     // start looping 
}

// ----------------------------------------------------------------------------------------------------------------
function setupTextImg() {
    textImage = createGraphics(width, height);
    textImage.pixelDensity(1);
    textImage.background(255);
    textImage.textFont(font);
    textImage.textSize(textSize);
    textImage.text("ABC", 20, 50, 100, 100);
    textImage.loadPixels();
}

// ----------------------------------------------------------------------------------------------------------------
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
