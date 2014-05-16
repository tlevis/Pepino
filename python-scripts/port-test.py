import os
import sys
import time
import pygame
import socket
import fcntl
import struct
import serial
import RPi.GPIO as GPIO

time_stamp_prev=0

def main():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    loop_forever = True
    prev_input = 1   
    while True:        
        input = GPIO.input(22)
        print input
        #if ( prev_input and (not input)):
        #    print "Pressed\n"
        #    loop_forever = False
        #prev_input = input
        time.sleep(0.05)        
        
    #displaytext(get_ip_address('eth0'),40,3,(0,0,0),False)
    #pygame.display.flip()
    #time.sleep(5)

if __name__ == '__main__':
  main()
