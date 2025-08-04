#include <U100.h>
#include <BMC81M001.h>


char SerialBuff[RES_MAX_LENGTH];
int resLen = 0;

String tcpBuff;

BMC81M001 Wifi(&Serial1);
U100 uwb(&Serial3);
String id = "";

void setup() {
  Serial.begin(115200);
  uwb.begin(115200);
  Wifi.begin(115200);
  

  uwb.sendATCommand("AT+anchor_tag=1,2", 1000, 3);
}

void loop(){
  delay(100);
}