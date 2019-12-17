import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-logic',
  templateUrl: './logic.component.html',
  styleUrls: ['./logic.component.css']
})
export class LogicComponent implements OnInit {

  constructor(private app : AppComponent) {}
  
  //startTypes
  burst : string = 'Burst';
  step : string = 'Step';

  //methods
  restoring: string = 'Restoring';
  notRest: string = 'Without';

  startMethods: Array<string> = [this.restoring, this.notRest];
  selectedMethod: string = this.startMethods[0];

  startTypes: Array<string> = [this.burst, this.step];
  selectedType: string = this.startTypes[0];

  //InputModes
  binary : string = 'Binary';
  decimal : string = 'Decimal';

  inputModes: Array<string> = [this.binary, this.decimal];
  selectedInput: string = this.inputModes[0];

  //actions
  shft: string = 'LS';
  subB: string = 'sub B';
  lsb0: string = 'LSB = 0';
  lsb1: string = 'LSB = 1';
  addB: string = 'add B';
  restore: string = ' ';

  logicArr: Array<tableRow> = []

  //variables
  started: boolean = false;
  i: number = 0;
  ra: number;
  raCpy: number;
  rb: number;
  rbCpy: number;

  ngOnInit() {
    this.app.selectedType = this.selectedType || this.startTypes[0];
  }

  reverseNumber(num : string, base = 2) {
    return num.split('').map(s => base - 1 - parseInt(s, 2)).join('')
  }

  stepStart() {
    if (!this.started) {
      this.started = true;
    }
    let len = this.logicArr.length;
    let row = this.logicArr[len-1]
    if (row) {
      switch (row.action) {
        case this.shft:
          this.doSubB(len);
          break;
        case this.subB:
          this.doLSB(row, len);
          break;
        case this.lsb0:
          switch (this.selectedMethod) {
            case this.restoring:
              this.doAddB(len);
              break;
            case this.notRest:
              this.doShift(len);
              break;
          }
          break;
        case this.lsb1:
          this.doShiftAftLSB1(len);
          break;
        case this.addB:
          this.doRestore(len);
          break;
        case this.restore:
          this.doShift(len);
          break;
      }
    } else {
      this.doShift(len);
    }
  }

  fillNumber(num: number, from, to = 16) : string {
    var strNum;
    switch (this.selectedInput) {
      case this.decimal:
        strNum = this.bin(num);
        break;
      default:
        strNum = String(num);
        break;
    }
    return strNum.padStart(16, '0').substring(from, to);
  }

  shift() {
    switch (this.selectedInput) {
      case this.binary:
        this.ra *= 10
        break;
      case this.decimal:
        this.ra *= 2;
        break;
    }
  }
  shiftLSB1(num: string) {
    return num.concat('0')
  }

  startSwitch() {
    switch (this.selectedType) {
      case this.burst:
        this.burstStart()
        break;
      case this.step:
        this.stepStart()
    }
  }

  start() {
    if (!this.raCpy) this.raCpy = this.ra;
    if (!this.rbCpy) this.rbCpy = this.rb;
    switch (this.selectedInput) {
      case this.decimal:
        if (!this.started) {
          if (this.ra > 255 || this.ra < 1) {
            this.ra = null;
            alert('RA must be between 1 and 255')
            return
          }
          if (this.rb > 255 || this.rb < 1) {
            this.rb = null;
            alert('RB must be between 1 and 255')
            return
          }
        }
        this.startSwitch()
        break;
      case this.binary:
        if (!this.started) {
          if (this.ra > 11111111 || this.ra < 1) {
            this.ra = null;
            alert('RA must be between 1 and 11111111')
            return
          }
          if (!(/^[0-1]{1,}$/.test(String(this.ra)))) {
            this.ra = null;
            alert('RA must be binary number')
            return
          }
          if (this.rb > 11111111 || this.rb < 1) {
            this.rb = null;
            alert('RB must be between 1 and 11111111')
            return
          }
          if (!(/^[0-1]{1,}$/.test(String(this.rb)))) {
            this.rb = null;
            alert('RB must be binary number')
            return
          } 
        }
        this.startSwitch()
        break;
    }
  }

  burstStart() {
    while (this.i < 9) {
      this.stepStart()
    }
  }

  reset() {
    this.ra = null;
    this.raCpy = null;
    this.rb = null;
    this.rbCpy = null;
    this.started = false;
    this.i = 0;
    this.logicArr = [];
  }

  bin(value, change?: boolean) {
    if (!change && this.selectedInput !== this.decimal) {
      return String(value)
    }
    return (value >>> 0).toString(2)
  }


  binPlusOne(num: string) {
    num = this.bin(parseInt(num, 2) + 1, true).padStart(9, '0')
    if (num.length > 9) {
      return num.substring(num.length - 9, num.length)
    }
    return num
  }

  doSubB(len) {
    let bb = this.reverseNumber(this.bin(this.rb).padStart(8, '0'));
    bb = this.binPlusOne('1'.concat(bb));
    this.logicArr[len] = {
      left: bb.substring(0, 1),
      mid: bb.substring(1,9),
      right: null,
      action: this.subB 
    }
  }

  doAddB(len) {
    this.logicArr[len] = {
      left: '0',
      mid: this.fillNumber(this.rb, 8),
      right: null,
      action: this.addB
    }
  }

  doLSB(row, len) {
    let a = parseInt(this.logicArr[len - 2]['mid'], 2)
    let b = parseInt(row['left'].concat(row['mid']), 2)
    let c = this.bin(a+b, true).padStart(9, '0')
    if (c.length > 9) {
      c = c.substring(c.length-9, c.length)
    }
    let action, right = this.logicArr[len - 2]['right'];
    switch (c[0]) {
      case '0':
        action = this.lsb1;
        right = right.substring(0, right.length - 1).concat('1')
        this.ra++;
        break;
      case '1':
        action = this.lsb0;
        right = right.substring(0, right.length - 1).concat('0');
        break;
    }
    this.logicArr[len] = {
      left: c[0],
      mid: c.substring(1, 9),
      right: right,
      action: action
    }
  }

  doRestore(len) {
    let a = parseInt(this.logicArr[len-2]['left'].concat(this.logicArr[len-2]['mid']), 2);
    let b = parseInt(this.logicArr[len-1]['mid'], 2);
    let c = this.bin(a + b, true).padStart(9, '0')
    if (c.length > 9) {
      c = c.substring(c.length - 9, c.length)
    }
    this.logicArr[len] = {
      left: c.substring(0, 1),
      mid: c.substring(1,9),
      right: this.logicArr[len-2]['right'],
      action: this.restore
    }
  }

  doShift(len) {
    this.i++;
    if (this.i == 9) return
    this.shift();
    this.logicArr[len] = {
      left: '0',
      mid: this.fillNumber(this.ra, 0, 8),
      right: this.fillNumber(this.ra, 8),
      action: this.shft
    }
  }

  doShiftAftLSB1(len) {
    this.i++;
    if (this.i == 9) return
    let a = this.logicArr[len-1]['mid'].concat(this.logicArr[len-1]['right'])
    a = a.concat('0');
    this.logicArr[len] = {
      left: '0',
      mid: a.substring(1,9),
      right: a.substring(9, 17),
      action: this.shft
    }
  }

  changeGlobalType() {
    this.app.selectedType = this.selectedType;
  }
}
    
interface tableRow {
  left: string,
  mid: string,
  right: string,
  action: string
}