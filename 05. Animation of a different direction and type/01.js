let colorMap;                    // color map image
let textImage;                   // text image
let cellSize = 10;               // cell width & height (density)
let font;

let radiusSlider;                // controls and their initial values
let radius = 4;
let textSizeSlider;
let textSize = 250;
let groupRadio;
let fillCheckbox;
let fillChecked = true;
let animateCheckbox;
let animateChecked = false;

let pointsArray = [];            // arrays of points, each element is a point with full info
var palette = [];                // 6 prominent colors from the color map (color groups)

let counter = 0;                 // animation step counter

// ----------------------------------------------------------------------------------------------------------------
function preload() {                                                            
    colorMap = loadImage('data/colorMap.jpg');                                             // preload color map          
    font = loadFont('data/FreeSansBold.ttf');                                              // preload font for text image

    Vibrant.from('data/colorMap.jpg').getPalette().then( p => {                            // get palette from color map
        palette = [                                                                        // save as HEX palette
            rgbToHexColor(p.DarkMuted._rgb[0], p.DarkMuted._rgb[1], p.DarkMuted._rgb[2]),
            rgbToHexColor(p.DarkVibrant._rgb[0], p.DarkVibrant._rgb[1], p.DarkVibrant._rgb[2]),
            rgbToHexColor(p.LightMuted._rgb[0], p.LightMuted._rgb[1], p.LightMuted._rgb[2]),
            rgbToHexColor(p.LightVibrant._rgb[0], p.LightVibrant._rgb[1], p.LightVibrant._rgb[2]),
            rgbToHexColor(p.Muted._rgb[0], p.Muted._rgb[1], p.Muted._rgb[2]),
            rgbToHexColor(p.Vibrant._rgb[0], p.Vibrant._rgb[1], p.Vibrant._rgb[2])
        ];
                           
        createTextImage();                                                                 // crete text image
        colorMap.loadPixels();                                                             // create array of colorMap pixels
        createPoints();                                                                    // create array of points
        loop();
    });
}

// ----------------------------------------------------------------------------------------------------------------
function setup() {

    let canvas = createCanvas(600, 600);
    canvas.parent("canvasHolder");
                                                            
    radiusSlider = createSlider(2, 10, radius);                             // control element and its initial value
    radiusSlider.class("slider").parent("radiusSlider");                    // location of the control element
    radiusSlider.mouseReleased(updateImage);                                // event handler

    cellSizeSlider = createSlider(-20, -4, -cellSize);                      // slider range from '20' to '4'
    cellSizeSlider.class("slider").parent("cellSizeSlider");
    cellSizeSlider.mouseReleased(updateImage);

    textSizeSlider = createSlider(150, 250, 250);
    textSizeSlider.class("slider").parent("textSizeSlider");
    textSizeSlider.mouseReleased(updateImage);

    groupRadio = createRadio();
    groupRadio.option('Group by Colour', 'color');
    groupRadio.option('Group by Position', 'position').checked = true;
    groupRadio.parent("groupRadio");
    // groupRadio.changed(updateImage);

    fillCheckbox = createCheckbox('Fill', true);
    fillCheckbox.parent("fillCheckbox");
    fillCheckbox.changed(updateImage);

    animateCheckbox = createCheckbox('Animate', false);
    animateCheckbox.parent("animateCheckbox");
    animateCheckbox.changed(updateImage);
}

// ----------------------------------------------------------------------------------------------------------------
function createPoints() {

    pointsArray = [];                                              // clear array of points

    var loopCounter = 0;                                           // used to divide points into groups
    for (let y = 0; y < width; y += cellSize) {                    // standard grid loop to populate the array with points
        for (let x = 0; x < width; x += cellSize) {                // move to top-left corner of the next cell at each iteration

            var i = (y * textImage.width + x) * 4;                 // index of corresponding pixel in the map and text image

            if (textImage.pixels[i] != 255) {                      // process the pixels with text, not the background (255)
                                                                                                
                let r = colorMap.pixels[i];                        // find the color of corresponding pixel
                let g = colorMap.pixels[i + 1];
                let b = colorMap.pixels[i + 2];
                let a = colorMap.pixels[i + 3];

                var c = color(r, g, b, a);                         // p5 color for current point
                var colour = rgbToHexColor(r, g, b);               // hex color for calculations 

                var dist = 100;                                    // max distance between two hex colors in RGB cube
                var groupColor;                                    // the palette color nearest to current point  
                var groupName;                                     // index of nearest color used as group name
                                                  
                palette.forEach((palColor, index) => {             // find the palette color nearest to current point
                                                                   // chroma.js used to calculate distance between two colors        
                    if(chroma.distance(colour, palColor) < dist) {    
                        dist = chroma.distance(colour, palColor);
                        groupName = index;
                        groupColor = hexToP5Color(palColor);
                    }
                });

                if(groupRadio.value() == 'position')               // if radio is checked
                    groupName = loopCounter % 6;                   // group points by their position instead the color

                let yFinish, xFinish;
                switch(groupName) {                                // each group has its own direction of movement
                    case 0:
                        yFinish = y + height;
                        break;
                    case 1:
                        yFinish = y - height;
                        break;
                    case 2:
                        xFinish = x + width;
                        break;
                    case 3:
                        xFinish = x - width;
                        break;
                    case 4:
                        yFinish = y + height;
                        xFinish = x + width;
                        break;
                    case 5:
                        yFinish = y - height;
                        xFinish = x - width;
                        break;
                }

                pointsArray.push({                                 // add new point to the array
                    xPos: x,                                       // initial position is never changed
                    yPos: y,
                    xStart: x,                                     // start and finish positions are changed at canvas edge
                    yStart: y,                                     
                    xFinish: xFinish,
                    yFinish: yFinish,
                    xNow: x,                                       // current point position at each animation frame
                    yNow: y,
                    counter: 1,                                    // should be reset when reaching the canvas edge   
                    group: groupName,                              // group (from 0 to 5)
                    groupColor: groupColor,                        // nearest color from the palette
                    color: c                                       // point color
                });
            }

            loopCounter = loopCounter + 5;                         // different visual effects are possible
            // loopCounter=+0;                                     // all points as one selected group
            // loopCounter=+1;
            // loopCounter=+2;
            // loopCounter=+3;
            // loopCounter=+4;
            // loopCounter=+5;
        }  
    }

    // for (let i = 0; i < 6; i++) {
    //     this['group_' + i] = pointsArray.filter(point => point.group == i);
    // }
}

// ----------------------------------------------------------------------------------------------------------------
function draw() {

    if (counter == 99)
        background(170, 220, 170);                                          // clear the trace at last animation frame
    else
        background(170, 220, 170, 80);                                                               

    if (animateChecked) {                                                    // IF ANIMATION REQUIRED
        pointsArray.forEach( (point, i) => {                                 // each group points has its own behavior

            switch(point.group) {                                            // customize the behavior of each point
                case 0:                                                      // from top to bottom on a sine wave
                    if(point.yNow >= height) {                               // if point is out of canvas
                        let newY = point.yNow - height;                      // how far is the point beyond the canvas
                        point.yNow = newY;                                   // jump and shift new position to get correct finish
                        point.yStart = newY;                                 // distance should remain the same to save the speed
                        point.yFinish = newY + height;                    
                        point.counter = 1;                                   // reset counter to avoid sudden jump
                    } else {
                        point.yNow = lerp(point.yStart, point.yFinish, 0.01 * point.counter);       // current Y
                        point.xNow = random(70, 80) * sin(0.0317 * counter) + point.xStart;         // current X (sine wave)
                    }
                    break;
                case 1:
                    if(point.yNow < 0) {                                     // from bottom to top on a sine wave                            
                        let newY = point.yNow + height;                   
                        point.yNow = newY;                               
                        point.yStart = newY;                             
                        point.yFinish = newY - height;                    
                        point.counter = 1;                                  
                    } else {
                        point.yNow = lerp(point.yStart, point.yFinish, 0.01 * point.counter);
                        point.xNow = random(10, 80) * sin(0.0317 * counter) + point.xStart;
                    }
                    break;
                case 2:
                    if (point.xNow >= width) {                               // from left to right on a sine wave
                        let newX = point.xNow - width;
                        point.xNow = newX;
                        point.xStart = newX;
                        point.xFinish = newX + width;
                        point.counter = 1;
                    } else {
                        point.xNow = lerp(point.xStart, point.xFinish, 0.01 * point.counter);
                        point.yNow = random(50, 60) * sin(0.0317 * counter) + point.yStart;
                    }
                    break;
                case 3:                                                      // from right to left on a sine wave
                    if (point.xNow < 0) { 
                        let newX = point.xNow + width; 
                        point.xNow = newX; 
                        point.xStart = newX; 
                        point.xFinish = newX - width;
                        point.counter = 1; 
                    } else {
                        point.xNow = lerp(point.xStart, point.xFinish, 0.01 * point.counter);
                        point.yNow = random(50, 60) * sin(0.0317 * counter) + point.yStart;
                    }
                    break;
                case 4:                                                      // from left-top to right-bottom
                    if(point.yNow >= height || point.xNow >= width) {                              
                        let newY = point.yNow - height;
                        let newX = point.xNow - width;                   
                        point.yNow = newY;
                        point.xNow = newX;                             
                        point.yStart = newY;
                        point.xStart = newX;                           
                        point.yFinish = newY + height;
                        point.xFinish = newX + height;                     
                        point.counter = 1;                                  
                    } else {
                        point.yNow = lerp(point.yStart, point.yFinish, 0.01 * point.counter);
                        point.xNow = lerp(point.xStart, point.xFinish, 0.01 * point.counter);
                    }
                    break;
                case 5:
                    if(point.yNow < 0 || point.xNow < 0) {                   // from right-bottom to left-top                            
                        let newY = point.yNow + height;
                        let newX = point.xNow + width;                   
                        point.yNow = newY;
                        point.xNow = newX;                             
                        point.yStart = newY;
                        point.xStart = newX;                           
                        point.yFinish = newY - height;
                        point.xFinish = newX - height;                     
                        point.counter = 1;                                  
                    } else {
                        point.yNow = lerp(point.yStart, point.yFinish, 0.01 * point.counter);
                        point.xNow = lerp(point.xStart, point.xFinish, 0.01 * point.counter);
                    }
                    break;
            }

            var colorPos = map(counter, 0, 99, 0, 1);                        // color interpolation
            var startColor = point.color;
            var endColor = point.groupColor;
            var interColor = lerpColor(startColor, endColor, colorPos);

            if (fillChecked) {                                               // setup the color
                fill(interColor);
                stroke(interColor);
            } else {
                noFill();
                stroke(0);
            }
            ellipse(point.xNow, point.yNow, radius * 2, radius * 2);         // draw point

            // OPTIONAL VISUAL EFFECTS
            curve(point.xPos, point.yPos, point.xNow + random(-1,1), point.yNow + random(-1,1), point.xNow + random(-1,1), point.yNow + random(-1,1), point.xNow, point.yNow);
            let xNeighbor = typeof pointsArray[i+1] !== "undefined" ? pointsArray[i+1].xNow : pointsArray[i-1].xNow;
            let yNeighbor = typeof pointsArray[i+1] !== "undefined" ? pointsArray[i+1].yNow : pointsArray[i-1].yNow;
            line(point.xNow, point.yNow, xNeighbor, yNeighbor);
            
            point.counter++;
        });

        if (counter === 99) {                                                // if the last step of animation is reached
            noLoop();                                                        // stop animation
            animateChecked = false;                                          // reset 'Animate' checkbox
            animateCheckbox.checked(false);
        }
    } else {                                                                 // IF ANIMATION IS NOT REQUIRED
        
        noLoop();
        background(170, 220, 170);                                           // not transparent background
        pointsArray.forEach( point => {                                      // display each point at start position
            
            if (fillChecked) {                                               // setup the color
                fill(point.color);
                stroke(point.color);
            } else {
                noFill();
                stroke(0);
            }
            ellipse(point.xStart, point.yStart, radius * 2, radius * 2);     // draw point
        });
    }

    // stroke(0);                                                            // show how the density slider works
    // noFill();
    // for (let y = 0; y < width; y += cellSize) {
    //     for (let x = 0; x < width; x += cellSize)
    //         rect(x, y, cellSize, cellSize);
    // }

    counter++;                                                               // next animation frame counter
}

// ----------------------------------------------------------------------------------------------------------------
function updateImage() {

    counter = 0;                                // reset animation frame counter
                                                
    if (fillCheckbox.checked() == 1)            // update all control values            
        fillChecked = true;
    else
        fillChecked = false;

    if (animateCheckbox.checked() == 1)
        animateChecked = true;
    else
        animateChecked = false;

    radius = radiusSlider.value();
    cellSize = -cellSizeSlider.value();
    textSize = textSizeSlider.value();

    createTextImage();                          // setup image according to new text size
    createPoints();                             // create new point array
    loop();                                     // enable animation 
}

// ----------------------------------------------------------------------------------------------------------------
function createTextImage() {
    textImage = createGraphics(width, height);  // same as canvas size
    textImage.pixelDensity(1);                  // image pixels density
    textImage.background(255);                  // white image background differs from canvas background
    textImage.textFont(font);                   // use the font preloaded
    textImage.textSize(textSize);               // text size in the image
    textImage.text("IADT", 05, 140, 20, 20);    // text and its position (20, 20 - ???)
    textImage.loadPixels();                     // getting array of image pixels
}

// secondary functions --------------------------------------------------------------------------------------------
function rgbToHexColor(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function hexToP5Color(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
}