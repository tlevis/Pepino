#!/usr/bin/python
import serial, time
ser = serial.Serial('/dev/ttyAMA0',  9600, timeout = 0.1)

def receive( theinput ):
  while True:
    try:
      time.sleep(0.01)
      state = ser.readline()
      print state
      return state
    except:
      pass
  time.sleep(0.1)

while 1 :
    receive('1')