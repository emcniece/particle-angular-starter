/*
 * https://github.com/emcniece/particle-angular-starter
 * This is a basic Particle Core sketch to demonstrate how the AngularJS
 * app can interface to Particle cloud functions and variable interaction.
 *
 * v0.1 02/07/2015 @emcniece
 */

#include "application.h"
//#include "spark_disable_wlan.h" // For faster local debugging only
#include "neopixel/neopixel.h"

#define BUTTON_PIN D1

// IMPORTANT: Set pixel COUNT, PIN and TYPE
#define PIXEL_PIN D0
#define PIXEL_COUNT 72
#define PIXEL_TYPE WS2812B

// State defs
#define RAINBOW         0
#define RAINBOW_CYCLE   1
#define SOLID           2
#define XMAS            3
#define PATTERN1        4
#define BLINKEN         5
#define RUNNER          6


Adafruit_NeoPixel strip = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, PIXEL_TYPE);

uint8_t state = 2;          // State controller
uint8_t oldState = 0;       // publish trigger
int wait = 20;              // general delay
uint8_t lastColorState = 0; // xmas

uint8_t cRed = 0;           // 0-255
uint8_t cGrn = 66;
uint8_t cBlu = 130;

bool colorSet = false;      // used for testing animation completion

void setup()
{
    pinMode(D1, INPUT_PULLDOWN);
    attachInterrupt(D1, doorEvent, RISING);

    Spark.function("setColor", setColor);
    Spark.function("setState", setState);
    Spark.function("setWait", setWait);
    Spark.function("readDoor", readDoor);

    Spark.variable("cRed", &cRed, INT);
    Spark.variable("cGrn", &cGrn, INT);
    Spark.variable("cBlu", &cBlu, INT);
    Spark.variable("wait", &wait, INT);
    Spark.variable("state", &state, INT);

    strip.begin();
    strip.show(); // Initialize all pixels to 'off'

}

void loop()
{

  switch (state) {

    case RAINBOW:           // 0
      rainbow(wait);
      break;
    case RAINBOW_CYCLE:     // 1
      rainbowCycle(wait);
      break;
    case SOLID:             // 2
      solidColor(strip.Color(cRed, cGrn, cBlu));
      break;
    case XMAS:              // 3
      alternatePattern( strip.Color(255,0,0), strip.Color(0,255,0) );
      break;
    case PATTERN1:          // 4
      alternatePattern( strip.Color(0,66,130), strip.Color(0,255,0) );
      break;
    case BLINKEN:           // 5
      blinkenLights(wait);
      break;
    case RUNNER:            // 6
      runner(wait);
      break;

  } // switch

  if( oldState != state){
    Spark.publish("state-change", String(state) );
    oldState = state;
  }

}

void doorEvent()
{
  Spark.publish("button", "pressed");
}
int readDoor(String args)
{
  return digitalRead(D1);
}

/* CLOUD: Adjust Brightness To Value */
int setColor(String args)
{
  state = SOLID;
  colorSet = false;

  cRed = getWord(args, ',' ,0).toInt();
  cGrn = getWord(args, ',' ,1).toInt();
  cBlu = getWord(args, ',' ,2).toInt();

  return cRed+cGrn+cBlu;  // checksum of sorts
}

int setState(String args)
{
  Spark.publish("update", args);
  state = args.toInt();
  return state;
}
int setWait(String args)
{
  Spark.publish("update", args);
  wait = args.toInt();
  return wait;
}

void alternatePattern(uint32_t c1, uint32_t c2)
{
  lastColorState = lastColorState ? 0 : 1;

  for(uint16_t i=lastColorState; i<strip.numPixels(); i++) {
    if(i % 2 == lastColorState)
      strip.setPixelColor(i, c1);
    else
      strip.setPixelColor(i, c2);
  }
  delay(wait);
  strip.show();
}

// Runs single pixels around the string (good for testing order)
void runner(uint8_t wait)
{
  uint16_t i;
  uint32_t c;

  c = strip.Color((int) random(255), (int) random(255), (int) random(255));

  for(i=0; i<strip.numPixels(); i++) {
    if(state != RUNNER) return;
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }

}

// Set all pixels in the strip to a solid color, then wait (ms)
void colorAll(uint32_t c, uint8_t wait)
{
  uint16_t i;

  for(i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
  }
  strip.show();
  delay(wait);
}

void blinkenLights(uint8_t wait)
{
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    if(state != BLINKEN) return;
    strip.setPixelColor(i, strip.Color((int) random(255), (int) random(255), (int) random(255)));
    strip.show();
    delay(wait);
  }
}

// Fill the dots one after the other with a color, wait (ms) after each one
void colorWipe(uint32_t c, uint8_t wait)
{
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }

}

void solidColor(uint32_t c)
{
  if(colorSet) return;

  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
  }
  strip.show();
  colorSet = true;
}

void rainbow(uint8_t wait)
{
  uint16_t i, j;

  for(j=0; j<256; j++) {
    for(i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel((i+j) & 255));
      if(state != RAINBOW) return;
    }

    strip.show();
    delay(wait);
  }
}

// Slightly different, this makes the rainbow equally distributed throughout, then wait (ms)
void rainbowCycle(uint8_t wait)
{
  uint16_t i, j;

  for(j=0; j<256; j++) { // 1 cycle of all colors on wheel
    for(i=0; i< strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
      if(state != RAINBOW_CYCLE) return;
    }

    strip.show();
    delay(wait);
  }
}

// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos)
{
  if(WheelPos < 85) {
   return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  } else if(WheelPos < 170) {
   WheelPos -= 85;
   return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else {
   WheelPos -= 170;
   return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
}

String getWord(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==separator || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}