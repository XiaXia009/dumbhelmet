#include <U100.h>
#include <BMC81M001.h>

#define IP "172.20.10.3"
#define IP_Port 8888
#define RES_MAX_LENGTH 200

char SerialBuff[RES_MAX_LENGTH];
int resLen = 0;
String tcpBuff;

BMC81M001 Wifi(&Serial1);
U100 uwb(&Serial3);
String id = "";

// ===== 伺服器心跳時間 =====
static unsigned long lastServerRX = 0;
static unsigned long lastPingAt   = 0;

// ===== 狀態機 =====
enum Mode { MODE_UNKNOWN, MODE_ANCHOR, MODE_TAG };
volatile Mode currentMode = MODE_UNKNOWN;
volatile bool sentThisPhase = false;   // 這一輪是否已經送過（tag 只送一次）

// ===== 批次暫存（只在 tag 狀態會用到）=====
static String batchBuff = "";
static int pairCount = 0;

void reset_batch() {
  batchBuff = "";
  pairCount = 0;
}

auto is_valid_pair = [](const String& a, const String& b) -> bool {
  return ( (a=="an0" && b=="an1") || (a=="an1" && b=="an0") ||
           (a=="an1" && b=="an2") || (a=="an2" && b=="an1") ||
           (a=="an0" && b=="an2") || (a=="an2" && b=="an0") );
};

void set_mode_anchor() {
  currentMode = MODE_ANCHOR;
  sentThisPhase = false;     // anchor 不會送，但仍把旗標清乾淨
  reset_batch();
  uwb.sendATCommand("AT+switchdis=0", 1000, 3);
  uwb.sendATCommand("AT+anchor_tag=1," + id, 1000, 3);
  uwb.sendATCommand("AT+RST", 1000, 3);
  delay(1000);
  uwb.sendATCommand("AT+switchdis=1", 1000, 3);
}

void set_mode_tag() {
  currentMode = MODE_TAG;
  sentThisPhase = false;     // 新的一輪，準備收一次就好
  reset_batch();
  uwb.sendATCommand("AT+switchdis=0", 1000, 3);
  uwb.sendATCommand("AT+anchor_tag=0," + id, 1000, 3);
  uwb.sendATCommand("AT+RST", 1000, 3);
  delay(1000);
  uwb.sendATCommand("AT+switchdis=1", 1000, 3);
}

void setup() {
  Serial.begin(115200);
  uwb.begin(115200);
  Wifi.begin(115200);

  while (1) {
    Serial.print("------------------------------------\n");
    Serial.print("[INFO]Try connect to server\n");
    if (!Wifi.connectToAP("Wen", "11223344")) {
      Serial.print("[ERROR]WIFI Fail\n");
    } else {
      Serial.print("[INFO]WIFI Success\n");
    }

    if (!Wifi.connectTCP(IP, IP_Port)) {
      Serial.print("[ERROR]Server Fail\n");
    } else {
      Serial.print("[INFO]Server Success\n");
    }

    // 關閉偵測，設定常數
    uwb.sendATCommand("AT+switchdis=0", 1000, 3);
    uwb.sendATCommand("AT+interval=5", 1000, 3);

    id = get_id();
    Serial.print("[INFO]UWB ID:" + id + "\n");
    if (id != "") {
      if (uwb.sendATCommand("AT+RST", 1000, 3) != 0) {
        currentMode = MODE_ANCHOR;   // 先當 anchor 待命
        break;
      } else {
        Serial.print("[ERROR]Cant set UWB id\n");
      }
    }
  }

  // 主循環在 loop() 做；這裡不再卡死 while(1)
}

void loop() {
  // 先做一次非阻塞撿伺服器
  poll_server_once();

  if (currentMode == MODE_TAG && !sentThisPhase) {
    String uwbBuff = "";
    unsigned long startTime = millis();
    unsigned long lastPoll = startTime;

    while (millis() - startTime < 1000) {
      while (Serial3.available()) {
        char c = (char)Serial3.read();
        uwbBuff += c;
      }
      // 每 50ms 撿一次伺服器，避免整秒鴕鳥
      if (millis() - lastPoll >= 50) {
        poll_server_once();
        lastPoll = millis();
      }
      // 小小喘息，避免把 MCU 燒滿
      delay(1);
    }

    if (uwbBuff.length() > 0) {
      Serial.println(uwbBuff);

      String pendingTag = "";
      String pendingLine = "";

      int i = 0;
      while (i < (int)uwbBuff.length()) {
        int j = uwbBuff.indexOf('\n', i);
        String line = (j == -1) ? uwbBuff.substring(i) : uwbBuff.substring(i, j);
        line.trim();
        i = (j == -1) ? uwbBuff.length() : j + 1;
        if (line.length() == 0) continue;

        String tag = "";
        if (line.startsWith("an0:")) tag = "an0";
        else if (line.startsWith("an1:")) tag = "an1";
        else if (line.startsWith("an2:")) tag = "an2";
        else continue;

        if (pendingTag == "") {
          pendingTag  = tag;
          pendingLine = line;
        } else {
          if (is_valid_pair(pendingTag, tag)) {
            if (batchBuff.length() > 0) batchBuff += "\n";
            batchBuff += pendingLine + "\n" + line;
            pairCount++;
            pendingTag  = "";
            pendingLine = "";

            if (pairCount >= 3) {
              if (send_to_server(batchBuff)) {
                sentThisPhase = true;
                // 送完立刻撿一次，很多模組這裡就有回包
                delay(20);
                poll_server_once();
              }
              reset_batch();
              break;
            }
          } else {
            pendingTag  = tag;
            pendingLine = line;
          }
        }
      }
    }
  } else {
    // anchor 或已送過：清空 UWB，保持輕量輪詢 TCP
    while (Serial3.available()) { (void)Serial3.read(); }
    delay(10);
  }

  // 低頻轉發 USB->TCP（不影響主流程）
  while (Serial.available() > 0 && resLen < RES_MAX_LENGTH) {
    SerialBuff[resLen++] = Serial.read();
    delay(2);
  }
  if (resLen > 0) {
    if (Wifi.writeDataTcp(resLen, SerialBuff)) {
      Serial.print("Send data success");
    }
    clearBuff();
  }

  // 每圈跑一下看門狗
  comm_watchdog();
}


void check_for_server_data() {
  String serverData = Wifi.readDataTcp();
  if (serverData == "") return;

  serverData.trim();
  Serial.print("[Server] " + serverData + "\n");

  // 可能一次回多筆，用換行拆一下以免吃到殘渣
  int start = 0;
  while (start < serverData.length()) {
    int nl = serverData.indexOf('\n', start);
    String tok = (nl == -1) ? serverData.substring(start) : serverData.substring(start, nl);
    tok.trim();
    start = (nl == -1) ? serverData.length() : nl + 1;
    if (tok.length() == 0) continue;

    if (tok == "tag") {
      set_mode_tag();
    } else if (tok == "anchor") {
      set_mode_anchor();
    } else if (tok == "/id") {
      // 伺服器不會主動要 /id，但放這裡避免誤判
      String resp = String(find_ip_position_placeholder()); // 佔位；實際不用
      Wifi.writeDataTcp(resp.length(), (char*)resp.c_str());
    } else {
      // 其它無視
    }
  }
}

void clearBuff() {
  memset(SerialBuff, 0, RES_MAX_LENGTH);
  resLen = 0;
}

// 你的環境沒有 find_ip_position，這裡只是避免編譯器抱怨（不會用到）
int find_ip_position_placeholder() { return -1; }

String get_id() {
  const char* initMsg = "/id";
  if (Wifi.writeDataTcp(strlen(initMsg), (char*)initMsg)) {
    Serial.println("[INFO]Try to get UWB id.");
  } else {
    Serial.println("[ERROR]Cant get UWB id from server");
  }

  // 等待伺服器回傳
  unsigned long t0 = millis();
  while (millis() - t0 < 1000) { // 最多等 1 秒
    String response = Wifi.readDataTcp();
    if (response.length() > 0) {
      response.trim();
      return response;
    }
    delay(50);
  }
  Serial.println("[ERROR]No response from server.");
  return ""; // 別再留未定義 return 了
}

bool send_to_server(const String& payload) {
  if (payload.length() == 0) return true;
  String framed = payload;
  if (!framed.endsWith("\n")) framed += "\n";
  bool ok = Wifi.writeDataTcp(framed.length(), (char*)framed.c_str());
  if (!ok) {
    Serial.println("[ERROR] send_to_server fail");
    return false;
  }
  Serial.println("[INFO] send_to_server ok");
  return true;
}

void comm_watchdog() {
  unsigned long now = millis();

  // 10 秒沒任何伺服器資料：丟個 /ping 或 /id 看看（你伺服器只認 /id 就用它）
  if (now - lastServerRX > 10000 && now - lastPingAt > 2000) {
    const char* pingMsg = "/id"; // 你要換成 /ping 也可以
    Wifi.writeDataTcp(strlen(pingMsg), (char*)pingMsg);
    lastPingAt = now;
  }

  // 20 秒都沒回應，重連 TCP（你模組若有 isTcpAlive 可先判斷）
  if (now - lastServerRX > 20000) {
    Serial.println("[WARN] No server RX for 20s. Reconnecting TCP...");
    // 視你的 BMC81M001 API 有沒有關閉函數，沒有就直接嘗試重連
    Wifi.connectTCP(IP, IP_Port);
    lastServerRX = now; // 避免一直狂重連
  }
}

void poll_server_once() {
  String serverData = Wifi.readDataTcp();
  if (serverData.length() == 0) return;

  lastServerRX = millis();
  serverData.trim();
  Serial.print("[Server] " + serverData + "\n");

  int start = 0;
  while (start < serverData.length()) {
    int nl = serverData.indexOf('\n', start);
    String tok = (nl == -1) ? serverData.substring(start) : serverData.substring(start, nl);
    tok.trim();
    start = (nl == -1) ? serverData.length() : nl + 1;
    if (tok.length() == 0) continue;

    if (tok == "tag") {
      set_mode_tag();
    } else if (tok == "anchor") {
      set_mode_anchor();
    } else if (tok == "/id") {
      String resp = String(find_ip_position_placeholder());
      Wifi.writeDataTcp(resp.length(), (char*)resp.c_str());
    }
  }
}