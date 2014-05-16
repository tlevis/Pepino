#!/bin/bash
sudo cat /dev/zero > /dev/fb1
mplayer -nolirc -vo fbdev2:/dev/fb1 -vf scale=156:-3,rotate=1  /var/www/system-scripts/welcome.mp4
sudo python /var/www/python-scripts/show-ip.py
sudo fbi -d /dev/fb1 -T 1 -noverbose -a /var/www/system-scripts/system-logo.jpg