import os
import sys
import time

import subprocess


def main():
	subprocess.call('make upload -C /var/piduino/sketch', shell=True)

if __name__ == '__main__':
  main()
