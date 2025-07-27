#include "U100.h"

U100::U100(HardwareSerial *serial)
{
  _serial = serial;
}

void U100::begin(uint32_t baud)
{
  _serial->begin(baud);
}

int U100::sendATCommand(String cmd, int timeout, uint8_t retry)
{
  unsigned long t;
  const char *ok = "OK";

  for (uint8_t i = 0; i < retry; i++)
  {
    clearResponse();

    _serial->println(cmd);

    t = millis();
    while (millis() - t < (unsigned long)timeout)
    {
      readResponse();
      if (strstr(responseBuffer, ok) != NULL)
      {
        return SEND_SUCCESS;
      }
    }
  }

  return SEND_FAIL;
}

String U100::getIMEI()
{
  clearResponse();

  _serial->println("AT+GSN");

  unsigned long startTime = millis();
  while (millis() - startTime < 1000)
  {
    readResponse();
  }

  String resp = String(responseBuffer);
  resp.trim();

  int idx1 = resp.indexOf("\n");
  int idx2 = resp.indexOf("\n", idx1 + 1);
  if (idx1 != -1 && idx2 != -1)
  {
    String imei = resp.substring(idx1, idx2);
    imei.trim();
    return imei;
  }

  return "";
}

void U100::readResponse()
{
  while (_serial->available())
  {
    responseBuffer[resLength++] = _serial->read();
    if (resLength >= RES_MAX_LENGTH)
    {
      clearResponse();
    }
  }
}

void U100::clearResponse()
{
  memset(responseBuffer, 0, RES_MAX_LENGTH);
  resLength = 0;
}
