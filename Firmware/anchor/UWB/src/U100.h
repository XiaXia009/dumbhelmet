#ifndef _U100_H_
#define _U100_H_

#include <Arduino.h>

#define U100_BAUD_RATE 115200
#define SEND_SUCCESS 1
#define SEND_FAIL 0
#define RES_MAX_LENGTH 200

class U100
{
public:
  U100(HardwareSerial *theSerial = &Serial);
  void begin(uint32_t baud = U100_BAUD_RATE);

  int sendATCommand(String cmd, int timeout, uint8_t retry);
  String getIMEI();

private:
  void readResponse();
  void clearResponse();

  HardwareSerial *_serial = NULL;

  char responseBuffer[RES_MAX_LENGTH];
  uint16_t resLength = 0;
};

#endif // _U100_H_
