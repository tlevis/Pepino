#!/bin/bash
sudo echo 'lock' > /var/www/lock.lock
sudo fbi -d /dev/fb1 -T 1 -noverbose -a /var/www/system-scripts/uploading.jpg
#value=$(<compile-libs.txt)
#ARDUINO_LIBS="$value"
sudo make upload -C /var/pepino/sketch ARDUINO_DIR="/usr/share/arduino" ARDUINO_PORT="/dev/ttyAMA0" BOARD="uno"
#sudo cat /dev/zero > /dev/fb1
sudo rm /var/www/lock.lock
sudo fbi -d /dev/fb1 -T 1 -noverbose -a /var/www/system-scripts/system-logo.jpg