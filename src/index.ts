/*
MIT License

Copyright (c) Bryan Hughes <bryan@nebri.us>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { EventEmitter } from 'events';

export enum Value {
  HIGH = 1,
  LOW = 0
}

export enum PeripheralType {
  GPIO = 'gpio',
  PWM = 'pwm',
  I2C = 'i2c',
  SPI = 'spi',
  UART = 'uart'
}

export interface IPinInfo {
  pins: string[];
  peripherals: PeripheralType[];
}

// raspi-peripheral

export interface IPeripheral extends EventEmitter {
  readonly alive: boolean;
  readonly pins: number[];
  destroy(): void;
  validateAlive(): void;
}

// raspi

export interface IBaseModule {
  init(cb: (err?: Error) => void): void;
  getActivePeripherals(): { [ pin: number ]: IPeripheral };
  getActivePeripheral(pin: number): IPeripheral | undefined;
  setActivePeripheral(pin: number, peripheral: IPeripheral): void;
  getPinNumber(alias: string | number): number | null;
}

// raspi-gpio, split into two

export interface IGPIOConfig {
  pin: number | string;
  pullResistor?: number;
}
export interface IDigitalOutput extends IPeripheral {
  readonly value: number;
  write(value: Value): void;
}
export interface IDigitalInput extends IPeripheral {
  readonly value: Value;
  readonly pullResistor: number;
  read(): number;
}
export interface IGPIOModule {
  PULL_NONE: number;
  PULL_DOWN: number;
  PULL_UP: number;
  createDigitalInput: (config: number | string | IGPIOConfig) => IDigitalInput;
  createDigitalOutput: (config: number | string | IGPIOConfig) => IDigitalOutput;
}

// raspi-i2c

export type I2CReadBufferCallback = (err: null | Error | string, data: null | Buffer) => void;
export type I2CReadNumberCallback = (err: null | Error | string, data: null | number) => void;
export type I2CWriteCallback = (err: null | Error | string) => void;
export interface II2C extends IPeripheral {
  read(address: number, length: number, cb: I2CReadBufferCallback): void;
  read(address: number, register: number, length: number, cb: I2CReadBufferCallback): void;
  readByte(address: number, cb: I2CReadNumberCallback): void;
  readByte(address: number, register: number, cb: I2CReadNumberCallback): void;
  readWord(address: number, cb: I2CReadNumberCallback): void;
  readWord(address: number, register: number, cb: I2CReadNumberCallback): void;
  write(address: number, buffer: Buffer, cb?: I2CWriteCallback): void;
  write(address: number, register: number, buffer: Buffer, cb?: I2CWriteCallback): void;
  writeByte(address: number, byte: number, cb?: I2CWriteCallback): void;
  writeByte(address: number, register: number, byte: number, cb?: I2CWriteCallback): void;
  writeWord(address: number, word: number, cb?: I2CWriteCallback): void;
  writeWord(address: number, register: number, word: number, cb?: I2CWriteCallback): void;
}

export interface II2CModule {
  createI2C: () => II2C;
}

// raspi-led

export interface ILED extends IPeripheral {
  hasLed(): boolean;
  read(): Value;
  write(value: Value): void;
}

export interface ILEDModule {
  createLED: () => ILED;
}

// raspi-pwm

export interface IPWMConfig {
  pin: number | string;
  frequency?: number;
  range?: number;
}
export interface IPWM extends IPeripheral {
  readonly frequency: number;
  readonly range: number;
  readonly dutyCycle: number;
  write(dutyCycle: number): void;
}
export interface IPWMModule {
  createPWM: (config: number | string | IPWMConfig) => IPWM;
}

// raspi-serial

export interface ISerialOptions {
    portId?: string;
    baudRate?: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 |
      1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
    dataBits?: 8 | 7 | 6 | 5;
    stopBits?: 1 | 2;
    parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';
}
export type SerialCallback = () => void;
export type SerialErrorCallback = (err?: Error | string) => void;
export interface ISerial extends IPeripheral {
    readonly port: string;
    readonly baudRate: number;
    readonly dataBits: number;
    readonly stopBits: number;
    readonly parity: string;
    open(cb?: SerialCallback): void;
    close(cb?: SerialErrorCallback): void;
    write(data: Buffer | string, cb?: SerialCallback): void;
    flush(cb?: SerialErrorCallback): void;
}

export interface ISerialModule {
  createSerial: (options?: ISerialOptions) => ISerial;
}
