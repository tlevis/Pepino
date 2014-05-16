function getI2C()
{
    var include = "#include <Wire.h>";
    
    var setup = "Wire.begin();";
    
    var code = "\
void writeTo(int deviceAddress, byte address, byte buffer[], int num = 1)\n\
{\n\
    Wire.beginTransmission(deviceAddress);\n\
    Wire.write(address);\n\
    for (int i = 0; i < num; i++)\n\
    {\n\
        Wire.write(buffer[i]);\n\
    }\n\
    Wire.endTransmission();\n\
}\n\
void readFrom(int deviceAddress, byte address, byte buffer[], int num)\n\
{\n\
    writeTo(deviceAddress, address, 0, 0);\n\
    Wire.beginTransmission(deviceAddress);\n\
    Wire.requestFrom(deviceAddress, num);\n\
    while (Wire.available() < num);\n\
    for (int i = 0; i < num; i++)\n\
    {\n\
        buffer[i] = Wire.read();\n\
    }\n\
    Wire.endTransmission();\n\
}\n";
    
    return { Name: "i2c", Include: include, Setup: setup, Functions: code};
}