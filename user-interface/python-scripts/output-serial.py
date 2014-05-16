import os
import sys
import time
import pygame
import socket
import fcntl
import struct
import serial
import RPi.GPIO as GPIO




ser = serial.Serial('/dev/ttyAMA0',  9600, timeout = 0.1)
time_stamp_prev=0

os.environ["SDL_FBDEV"] = "/dev/fb1"
os.environ['SDL_VIDEODRIVER']="fbcon"

def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,  # SIOCGIFADDR
        struct.pack('256s', ifname[:15])
    )[20:24])

	
def displaytext(text,size,line,color,clearscreen):
  if clearscreen:
    screen.fill((255,255,255))

  font = pygame.font.Font(None,size)
  text = font.render(text,0,color)
  rotated = pygame.transform.rotate(text,-90)
  textpos = rotated.get_rect()
  textpos.centery = 80
  if line == 1:
    textpos.centerx = 99
    screen.blit(rotated,textpos)
  elif line == 2:
    textpos.centerx = 61
    screen.blit(rotated,textpos)
  elif line == 3:
    textpos.centerx = 25
    screen.blit(rotated,textpos)

def main():
    global screen

    GPIO.setmode(GPIO.BCM)
    GPIO.setup(2, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    loop_forever = True
    prev_input = 1
    pygame.init()
    pygame.mouse.set_visible(0)
    size = width,height = 128,160
    screen = pygame.display.set_mode(size)
    
    while loop_forever:
        state = ser.readline().strip()
        if (state != ""):
            #print state        
            displaytext(state,40,2,(0,0,0),True)
            pygame.display.flip()        
        input = GPIO.input(2)
        print state
        if ( prev_input and (not input)):
            print "Pressed\n"
            loop_forever = False
        prev_input = input
        time.sleep(0.05)        
        
    #displaytext(get_ip_address('eth0'),40,3,(0,0,0),False)
    #pygame.display.flip()
    #time.sleep(5)

if __name__ == '__main__':
  main()
