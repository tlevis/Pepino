import RPi.GPIO as GPIO # always needed with RPi.GPIO  
from time import sleep  # pull in the sleep function from time module  
GPIO.setmode(GPIO.BCM)  # choose BCM or BOARD numbering schemes. I use BCM  
GPIO.setup(23, GPIO.OUT)# set GPIO 25 as output for white led  
white = GPIO.PWM(23, 100)    # create object white for PWM on port 25 at 100 Hertz  
white.start(100)              # start white led on 0 percent duty cycle (off)  
pause_time = 0.02           # you can change this to slow down/speed up  
try:  
    while True:
        for i in range(30, 101):      # 101 because it stops when it finishes 100  
            white.ChangeDutyCycle(i)  
            sleep(pause_time)  
        for i in range(100,30,-1):      # from 100 to zero in steps of -1  
            white.ChangeDutyCycle(i)  
            sleep(pause_time)

except KeyboardInterrupt:  
    white.stop()            # stop the white PWM output  
    GPIO.cleanup()   
