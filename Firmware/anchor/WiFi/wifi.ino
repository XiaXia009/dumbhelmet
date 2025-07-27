#include <U100.h>

#include "BMC81M001.h"

#define IP "172.20.10.2"     // TCP 伺服器 IP
#define IP_Port 8888         // TCP 伺服器 Port
#define RES_MAX_LENGTH 200   // 最大序列緩衝區長度

char SerialBuff[RES_MAX_LENGTH];
int resLen = 0;

String tcpBuff;

BMC81M001 Wifi(&Serial1);

void setup() {
  Serial.begin(115200);
  Wifi.begin();

  Serial.print("TCP Connect Result：");
  if (!Wifi.connectToAP("Wen", "RayLi97420")) {
    Serial.print("WIFI fail,");
  } else {
    Serial.print("WIFI success,");
  }

  if (!Wifi.connectTCP(IP, IP_Port)) {
    Serial.print("IP fail");
  } else {
    Serial.print("IP success");
  }
  String id = get_id();
  Serial.print("id:" +id);
  
}

void loop() {
  // 接收 TCP 資料
  tcpBuff = Wifi.readDataTcp();
  if (tcpBuff != "") {
    Serial.println(tcpBuff);
  }

  // 接收 Serial 串口資料並發送到 TCP
  while (Serial.available() > 0 && resLen < RES_MAX_LENGTH) {
    SerialBuff[resLen++] = Serial.read();
    delay(10);  // 防止資料過快
  }

  if (resLen > 0) {
    if (Wifi.writeDataTcp(resLen, SerialBuff)) {
      Serial.println("Send data success");
    }
    clearBuff();
  }
}

void clearBuff() {
  memset(SerialBuff, 0, RES_MAX_LENGTH);
  resLen = 0;
}

String get_id(){
  const char* initMsg = "/id";
  if (Wifi.writeDataTcp(strlen(initMsg), (char*)initMsg)) {
    Serial.println("Initial TCP data sent.");
  } else {
    Serial.println("Initial TCP data send failed.");
  }

  // 等待伺服器回傳
  delay(300); // 給伺服器一點時間處理，太快你收不到
  String response = Wifi.readDataTcp();
  if (response != "") {
    response.trim();
    return response;
  } else {
    Serial.println("No response from server.");
  }
}