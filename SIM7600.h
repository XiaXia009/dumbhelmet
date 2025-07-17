#ifndef _SIM7600_H_
#define _SIM7600_H_

#include <Arduino.h>

#define SIM7600_BAUD_RATE 115200
#define SEND_SUCCESS 1
#define SEND_FAIL 0
#define RES_MAX_LENGTH 200

class SIM7600
{
public:
    SIM7600(HardwareSerial *theSerial = &Serial);
    void begin(uint32_t baud = SIM7600_BAUD_RATE);

    int sendATCommand(String cmd, int timeout, uint8_t retry);
    String getIMEI();

private:
    void readResponse();
    void clearResponse();

    HardwareSerial *_serial = NULL;

    char responseBuffer[RES_MAX_LENGTH];
    uint16_t resLength = 0;
};

#endif // _SIM7600_H_

