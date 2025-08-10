#include "SIM7600.h"

SIM7600::SIM7600(HardwareSerial *serial)
{
  _serial = serial;
}

void SIM7600::begin(uint32_t baud)
{
  _serial->begin(baud);
}

int SIM7600::sendATCommand(String cmd, int timeout, uint8_t retry)
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

String SIM7600::getIMEI()
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

String SIM7600::getPhoneNumber()
{
  clearResponse();

  _serial->println("AT+CNUM");

  unsigned long startTime = millis();
  while (millis() - startTime < 1000)
  {
    readResponse();
  }

  String resp = String(responseBuffer);
  resp.trim();

  int idx1 = resp.indexOf("+CNUM:");
  if (idx1 != -1)
  {
    int firstQuote = resp.indexOf("\"", idx1);
    int secondQuote = resp.indexOf("\"", firstQuote + 1);
    int thirdQuote = resp.indexOf("\"", secondQuote + 1);
    int fourthQuote = resp.indexOf("\"", thirdQuote + 1);

    if (thirdQuote != -1 && fourthQuote != -1)
    {
      String number = resp.substring(thirdQuote + 1, fourthQuote);
      number.trim();
      return number;
    }
  }

  return "";
}

void SIM7600::readResponse()
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

void SIM7600::clearResponse()
{
  memset(responseBuffer, 0, RES_MAX_LENGTH);
  resLength = 0;
}

String SIM7600::httpGet(const String &url)
{
  sendATCommand("AT+HTTPINIT", 200, 3);
  sendATCommand("AT+HTTPPARA=\"CID\",1", 2000, 3);
  sendATCommand("AT+HTTPPARA=\"URL\",\"" + url + "\"", 2000, 3);
  sendATCommand("AT+HTTPACTION=0", 5000, 3);

  unsigned long t = millis();
  int contentLen = 0;

  while (millis() - t < 5000)
  {
    readResponse();
    String resp(responseBuffer);
    delay(50);
    if (resp.indexOf("+HTTPACTION:") >= 0)
    {
      int c1 = resp.indexOf(',');
      int c2 = resp.indexOf(',', c1 + 1);
      contentLen = resp.substring(c2 + 1).toInt();
      break;
    }
  }

  if (contentLen <= 0)
  {
    sendATCommand("AT+HTTPTERM", 2000, 3);
    return "[ERROR] No content";
  }

  clearResponse();

  _serial->println("AT+HTTPREAD=" + String(contentLen));

  String httpContent;
  httpContent.reserve(contentLen + 16); // 提前分配空間，不要像智障一樣瘋狂 realloc
  bool reading = false;

  unsigned long t2 = millis();
  bool finished = false;

  while (millis() - t2 < 5000 && !finished)
  {
    if (_serial->available())
    {
      String line = _serial->readStringUntil('\n');
      line.trim();

      if (line.startsWith("+HTTPREAD:"))
      {
        reading = true;
        continue;
      }

      if (reading)
      {
        if (line == "OK")
        {
          finished = true; // 已經讀完
          break;
        }

        httpContent.concat(line);

        // 可選：如果你知道讀多少字，這裡也可以檢查長度提早跳
        if (httpContent.length() >= contentLen)
        {
          finished = true;
          break;
        }
      }
    }
  }

  sendATCommand("AT+HTTPTERM", 500, 3);
  httpContent.trim();
  return httpContent;
}

String SIM7600::httpPost(const String &url, const String &json)
{
  Serial.println("Starting HTTP POST to: " + json);
  sendATCommand("AT+HTTPINIT", 200, 3);
  sendATCommand("AT+HTTPPARA=\"CID\",1", 2000, 3);
  sendATCommand("AT+HTTPPARA=\"URL\",\"" + url + "\"", 2000, 3);
  sendATCommand("AT+HTTPPARA=\"CONTENT\",\"application/json\"", 2000, 3);

  _serial->println("AT+HTTPDATA=" + String(json.length()) + ",10000");

  unsigned long tStart = millis();
  while (millis() - tStart < 5000)
  {
    if (_serial->available())
    {
      String resp = _serial->readStringUntil('\n');
      resp.trim();
      if (resp.indexOf("DOWNLOAD") >= 0)
      {
        sendATCommand(json, 500, 3); // 等到 DOWNLOAD 才送
        break;
      }
    }
  }

  sendATCommand("AT+HTTPACTION=1", 5000, 3);

  unsigned long t = millis();
  int contentLen = 0;

  while (millis() - t < 5000)
  {
    readResponse();
    String resp(responseBuffer);
    delay(50);
    if (resp.indexOf("+HTTPACTION:") >= 0)
    {
      int c1 = resp.indexOf(',');
      int c2 = resp.indexOf(',', c1 + 1);
      contentLen = resp.substring(c2 + 1).toInt();
      break;
    }
  }

  if (contentLen <= 0)
  {
    sendATCommand("AT+HTTPTERM", 2000, 3);
    return "[ERROR] No content";
  }

  clearResponse();

  _serial->println("AT+HTTPREAD=" + String(contentLen));

  String httpContent;
  httpContent.reserve(contentLen + 16);

  bool reading = false;
  unsigned long start = millis();

  while (millis() - start < 5000)
  {
    if (_serial->available())
    {
      String line = _serial->readStringUntil('\n');
      line.trim();

      if (line.startsWith("+HTTPREAD:"))
      {
        if (line.indexOf("DATA") >= 0)
        {
          reading = true;
          continue;
        }
        if (line == "+HTTPREAD: 0")
        {
          break;
        }
      }

      if (reading)
      {
        if (line == "OK")
        {
          break;
        }

        httpContent.concat(line);

        if (httpContent.length() >= contentLen)
        {
          break;
        }
      }
    }
  }

  sendATCommand("AT+HTTPTERM", 500, 3);

  httpContent.trim();
  return httpContent;
}
