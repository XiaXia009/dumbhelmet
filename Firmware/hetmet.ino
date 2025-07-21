#include <SIM7600.h>

SIM7600 sim(&Serial4);

bool SIM4G_init() {
    sim.begin(115200);

    String imei = sim.getIMEI();
    if (imei != "") {
        Serial.println("IMEI: " + imei);

        if (sim.sendATCommand("AT+COPS?", 1000, 3) == 1) {
            String number = sim.getPhoneNumber();
            if (number != ""){
              Serial.println("Number: " + number);
            }
        } else {
            Serial.println("[ERROR] Cant find operator, No Internet connection");
            return false;
        }
    } else {
        Serial.println("[ERROR] Cannot get IMEI");
        return false;
    }
}

void setup() {
    Serial.begin(115200);
    String URL = "https://fea92163f039.ngrok-free.app/";
    if (SIM4G_init()) {
        Serial.println("[INFO] SIM7600 init success!");
    } else {
        Serial.println("[ERROR] SIM7600 init failed!");
        while (1);
    }


  //POST TEST
  String payload = "{\"imei\":\"" + sim.getIMEI() + "\",\"helmet_phone\":\"" + sim.getPhoneNumber() +"\"}";
  Serial.println(payload);
  String data = sim.httpPost(URL+"update_helmet_phone", payload);
  Serial.println(data);



  //GET TEST
    // data = sim.httpGet(URL);
    // Serial.println(data);
    // delay(100);
    // data = sim.httpGet(URL);
    // Serial.println(data);
}

void loop() {
    delay(1000);
}
