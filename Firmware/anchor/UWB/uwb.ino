#include <U100.h>

U100 uwb(&Serial3);

void setup() {
  uwb.begin(115200);

  if(uwb.sendATCommand("AT+anchor_tag=1,0", 1000, 3) == 1)
}

void loop() {
  // put your main code here, to run repeatedly:

}
