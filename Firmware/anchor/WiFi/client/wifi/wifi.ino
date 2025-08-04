#include <U100.h>
#include <BMC81M001.h>

#define IP "172.20.10.2"     // TCP 伺服器 IP
#define IP_Port 8888         // TCP 伺服器 Port
#define RES_MAX_LENGTH 200   // 最大序列緩衝區長度

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
  
  while (1){
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

    id = get_id();
    Serial.print("ID:"+id);
    
    if (id != ""){
      if(uwb.sendATCommand("AT+anchor_tag=1,"+id, 1000, 3) != 0){
        break;
      }
    }
  }

  // 創建一個背景線程持續接收資料
  while (1){
    String uwbBuff = "";
    unsigned long startTime = millis();
    while (millis() - startTime < 1000) {  // 最多等 1 秒
      while (Serial3.available()) {
        char c = Serial3.read();
        uwbBuff += c;
      }
    }
    if (uwbBuff.length() > 0) {
      Serial.println("[UWB] " + uwbBuff);
    }
    check_for_server_data();
    delay(100);  // 減少資源消耗
  }
}

void loop() {
  // 接收 Serial 資料並發送到 TCP
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

void check_for_server_data() {
  String serverData = Wifi.readDataTcp();
  if (serverData != "") {
    serverData.trim();
    Serial.print("[Server] " + serverData);
    if (serverData == "tag"){
      Serial.print(uwb.sendATCommand("AT+anchor_tag=0,"+id, 1000, 3));
      Serial.print(uwb.sendATCommand("AT+switchdis=1", 1000, 3));
    } else if (serverData == "anchor"){
      uwb.sendATCommand("AT+anchor_tag=1,"+id, 1000, 3);
    }
  }
}

void clearBuff() {
  memset(SerialBuff, 0, RES_MAX_LENGTH);
  resLen = 0;
}

String get_id() {
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
