/**
 * Jdigi
 *
 * Copyright 2014, Bob Jamison
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
                                                               

var Mode = require("../mode").Mode;




/**
 * These are the ITU codes for 5-bit Baudot code and 7-bit SITOR
 * in the same table
 */
var Baudot = (function() {

    var table = [
        ['Q',  '1',  0x17 /*10111*/,  0x3a /*0111010*/],
        ['W',  '2',  0x13 /*10011*/,  0x72 /*1110010*/],
        ['E',  '3',  0x01 /*00001*/,  0x35 /*0110101*/],
        ['R',  '4',  0x0a /*01010*/,  0x55 /*1010101*/],
        ['T',  '5',  0x10 /*10000*/,  0x17 /*0010111*/],
        ['Y',  '6',  0x15 /*10101*/,  0x6a /*1101010*/],
        ['U',  '7',  0x07 /*00111*/,  0x39 /*0111001*/],
        ['I',  '8',  0x06 /*00110*/,  0x59 /*1011001*/],
        ['O',  '9',  0x18 /*11000*/,  0x47 /*1000111*/],
        ['P',  '0',  0x16 /*10110*/,  0x5a /*1011010*/],
        ['A',  '-',  0x03 /*00011*/,  0x71 /*1110001*/],
        ['S',  '\'', 0x05 /*00101*/,  0x69 /*1101001*/],
        ['D',  '$',  0x09 /*01001*/,  0x65 /*1100101*/],
        ['F',  '!',  0x0d /*01101*/,  0x6c /*1101100*/],
        ['G',  '&',  0x1a /*11010*/,  0x56 /*1010110*/],
        ['H',  '#',  0x14 /*10100*/,  0x4b /*1001011*/],
        ['J',    7,  0x0b /*01011*/,  0x74 /*1110100*/], //7=bell
        ['K',  '[',  0x0f /*01111*/,  0x3c /*0111100*/],
        ['L',  ']',  0x12 /*10010*/,  0x53 /*1010011*/],
        ['Z',  '+',  0x11 /*10001*/,  0x63 /*1100011*/],
        ['X',  '/',  0x1d /*11101*/,  0x2e /*0101110*/],
        ['C',  ':',  0x0e /*01110*/,  0x5c /*1011100*/],
        ['V',  '=',  0x1e /*11110*/,  0x1e /*0011110*/],
        ['B',  '?',  0x19 /*11001*/,  0x27 /*0100111*/],
        ['N',  ',',  0x0c /*01100*/,  0x4d /*1001101*/],
        ['M',  '.',  0x1c /*11100*/,  0x4e /*1001110*/]
    ];
    
    var baudLtrsToCode = [];
    var baudFigsToCode = [];
    var baudCodeToSym  = [];
    var ccirLtrsToCode = [];
    var ccirFigsToCode = [];
    var ccirCodeToSym  = [];

    table.forEach(function(e) {
        baudLtrsToCode[e[0]] = e[2];
        baudFigsToCode[e[1]] = e[2];
        baudCodeToSym[e[2]]  = [e[0],e[1]];
        ccirLtrsToCode[e[0]] = e[3];
        ccirFigsToCode[e[1]] = e[3];
        ccirCodeToSym[e[3]]  = [e[0],e[1]];
    });

    this.baudControl = {
        NUL   : 0x00,
        SPACE : 0x04,
        CR    : 0x08,
        LF    : 0x02,
        LTRS  : 0x1f,
        FIGS  : 0x1b
    };
    
    var ccirControl = {
        NUL    : 0x2b,
        SPACE  : 0x1d,
        CR     : 0x0f,
        LF     : 0x1b,
        LTRS   : 0x2d,
        FIGS   : 0x36,
        ALPHA  : 0x78,
        BETA   : 0x66,
        SYNC   : 0x00,
        REPEAT : 0x33
    };

    //TODO:  this is for Navtex
    //var ccirAllCodes = table.map(_._4).toSet ++ ccirControl
    
    //def ccirIsvarid(code: Int) =
    //    ccirAllCodes.contains(code)

})();


/**
 * Enumerations for parity types
 */ 
var Parity = {
    None : 0,
    One  : 1,
    Zero : 2,
    Odd  : 3,
    Even : 4
};



/**
 * Mode for Radio teletype.  Sends a standard
 * async code with a start bit, 5 data bits and
 * a stop bit.  Whether a parity bit is sent or
 * interpreted should be adjustable.
 *  
 * @see http://en.wikipedia.org/wiki/Radioteletype
 * @see http://en.wikipedia.org/wiki/Asynchronous_serial_communication
 *   
 */    
function RttyMode(par) {
    Mode.call(this, par, 1000.0);

    this.name = "rtty"
    this.tooltip ="Radio teletype"
    
    var rates = [
        [  "45",  45.45 ],
        [  "50",  50.0 ],
        [  "75",  75.0 ],
        [ "100", 100.0 ]
    ];
    var shifts = List[
        [  "85",  85.0 ],
        [ "170", 170.0 ],
        [ "450", 450.0 ],
        [ "850", 850.0 ]
    ];
    
    /*
    override var properties = new PropertyGroup(name,
        new RadioProperty("rate", "Rate", rates.map(_._1), "Baud rate for sending mark or space") ( idx => rate = rates(idx)._2 ),
        new RadioProperty("shift", "Shift", shifts.map(_._1), "Spacing in hertz between mark and space", 1) ( idx => shift = shifts(idx)._2 ),
        new BooleanProperty("uos", "UoS", "Unshift on space")(b=> unshiftOnSpace = b),
        new BooleanProperty("inv", "Inv", "Invert mark and space for USB and LSB")(b=> inverted = b)
    )
    */
    
    var inverted = false;
    
    var shiftval = 170.0;
    
    this.getShift = function()
        { return shiftval; }
    
    this.setShift = function(v) {
        shiftval = v;
        adjust();
    }
        
    this.rateChanged = function(v) {
        adjust();
    }
    
    this.getBandwidth = function() { return shift; }
        
    this.unshiftOnSpace = false;
    
    rate          = 45.0;
    shiftval      = 170.0;
    var spaceFreq = new Complex(twopi * (-shift * 0.5) / this.sampleRate);
    var markFreq  = new Complex(twopi * ( shift * 0.5) / this.sampleRate);
    
    var sf = Fir.bandPass(13, -0.75 * shift, -0.25 * shift, this.sampleRate);
    var mf = Fir.bandPass(13,  0.25 * shift,  0.75 * shift, this.sampleRate);
    //var dataFilter = Iir2.lowPass(rate, this.sampleRate);
    var dataFilter = Fir.boxcar(samplesPerSymbol);
    var txlpf = Fir.lowPass(31,  shift * 0.5, this.sampleRate);
    
    var avgFilter = Iir2.lowPass(rate / 100, this.sampleRate);


    function adjust() {
        sf = Fir.bandPass(13, -0.75 * shift, -0.25 * shift, this.sampleRate);
        mf = Fir.bandPass(13,  0.25 * shift,  0.75 * shift, this.sampleRate);
        spaceFreq = Complex(twopi * (-shift * 0.5) / this.sampleRate);
        markFreq  = Complex(twopi * ( shift * 0.5) / this.sampleRate);
        //dataFilter = Iir2.lowPass(rate, this.sampleRate);
        dataFilter = Fir.boxcar(samplesPerSymbol.toInt);
        txlpf = Fir.lowPass(31,  shift * 0.5, this.sampleRate);
    }
        
    

    status("sampleRate: " + sampleRate + " samplesPerSymbol: " + samplesPerSymbol);


    var loHys = -0.5;
    var hiHys =  0.5;

    var bit = false;
    
    var debug = false;

    var lastval = new Complex(0,0);
    
        
    /**
     * note: multiplying one complex sample of an
     * FM signal with the conjugate of the previous
     * value gives the instantaneous frequency change of
     * the signal.  This is called a polar discrminator.
     */             
    this.receive = function(isample) {
        var space  = sf.update(isample);
        var mark   = mf.update(isample);
        var sample = space + mark;
        var prod   = sample * lastVal.conj();
        lastvar    = sample;
        var demod  = prod.arg();
        var comp   = Math.signum(demod) * 10.0;
        var sig    = dataFilter.update(comp);
        //trace("sig:" + sig + "  comp:" + comp)

        par.updateScope(sig, 0)

        //trace("sig:" + sig)
        if (sig > hiHys) {
            bit = true;
        } else if (sig < loHys) {
            bit = false;
        }

        process(bit);
        
        return sig;
    };

    
    var parityType = Parity.None;

    function bitcount(n) {
        var c = 0;
        while (n) {
            n &= n-1;
            c++;
        }
        return c;
    }

    function parityOf(c) {
        switch (parityType) {
            case Parity.Odd  : return (bitcount(c) & 1) !== 0; 
            case Parity.Even : return (bitcount(c) & 1) === 0;
            case Parity.Zero : return false;
            case Parity.One  : return true;
            default          : return false;   //None or unknown
        }
    }
    

    var Rx = {
        Idle   : 0,
        Start  : 1,
        Stop   : 2,
        Stop2  : 3,
        Data   : 4,
        Parity : 5
    };
    
    var state     = Rx.Idle;
    var counter   = 0;
    var code      = 0;
    var parityBit = false;
    var bitMask   = 0;
   
    function process(inbit) {

        var bit = inbit ^ inverted; //LSB/USB flipping
        var symbollen = samplesPerSymbol;

        switch (state) {

            case Rx.Idle :
                //trace("RxIdle")
                if (!bit) {
                    state   = Rx.Start;
                    counter = symbollen / 2;
                }
                break;
            case Rx.Start : 
                //trace("RxStart")
                counter -= 1
                //keep idling until half a period of mark has passed
                if (bit) {
                    state = Rx.Idle;
                } else if (counter <= 0) {
                    //half a period has passed
                    //still unset? then we have received a start bit
                    state     = Rx.Data;
                    counter   = symbollen;
                    code      = 0;
                    parityBit = false;
                    bitMask   = 1;
                }
                break;
            case Rx.Data : 
                //trace("RxData")
                counter -= 1;
                if (counter <= 0) {
                    if (bit) code += bitMask;
                    bitMask <<= 1;
                    counter = symbollen;
                }
                if (bitMask >= 0x20) {
                    if (parityType == Parity.None) // todo:  or zero or 1
                        state = Rx.Stop;
                    else
                        state = Rx.Parity;
                }
                break;
            case Rx.Parity : 
                //trace("RxParity")
                counter -= 1
                if (counter <= 0) {
                    state     = Rx.Stop;
                    parityBit = bit;
                    counter   = symbollen;
                }
                break;
            case Rx.Stop :
                //trace("RxStop")
                counter -= 1;
                if (counter <= 0) {
                    if (bit)
                        outCode(code);
                    state = Rx.Stop2;
                    counter = symbollen / 2;
                }
                break;
            case Rx.Stop2 :
                //trace("RxStop2")
                counter -= 1;
                if (counter <= 0)
                    state = Rx.Idle;
                break;
            }
    } // switch
    
    var shifted = false;
    
       
    function reverse(v, size) {
        var a = v;
        var b = 0;
        while (size--)
            {
            b += a & 1;
            b <<= 1;
            a >>= 1; 
            }
        return b;
    }
    
    
    
    var cntr = 0;
    var bitinverter = 0;
    
    //cache a copy of these here
    var NUL   = Baudot.baudControl.NUL;
    var SPACE = Baudot.baudControl.SPACE;
    var CR    = Baudot.baudControl.CR;
    var LF    = Baudot.baudControl.LF;
    var LTRS  = Baudot.baudControl.LTRS;
    var FIGS  = Baudot.baudControl.FIGS;

    function outCode(rawcode) {

        //println("raw:" + rawcode)
        var code = rawcode & 0x1f;
        if (code != 0) {
            if (code === FIGS)
                shifted = true;
            else if (code === LTRS)
                shifted = false;
            else if (code === SPACE) {
                par.puttext(" ")
                if (unshiftOnSpace)
                    shifted = false
            }
            else if (code === CR || code === LF) {
                par.puttext("\n")
                if (unshiftOnSpace)
                    shifted = false
            }
            var v = Baudot.baudCodeToSym(code);
            var c = (shifted) ? v[1] : v[0];
            if (c != 0)
                par.puttext(String.fromCharCode(c));
            }
            
        }
    
    //################################################
    //# T R A N S M I T
    //################################################
    /*
    var txShifted = false;
    function txencode(str) {
        var buf = [];
        var chars = str.split("");
        var len = chars.length;
        for (var cn=0 ; cn<len ; cn++) {
            var c = chars[cn];
            if (c === ' ')
                buf.push(SPACE);
            else if (c === '\n')
                buf.push(LF);
            else if (c === '\r')
                buf.push(CR);
            else {
                var uc = c.toUpper;
                var code = Baudot.baudLtrsToCode[uc];
                if (code) {
                    if (txShifted) {
                        txShifted = false;
                        buf.push(LTRS);
                    }
                buf.push(code)
                } else {
                    code = Baudot.baudFigsToCode[uc];
                    if (code) {  //check for zero?
                        if (!txShifted) {
                            txShifted = true;
                            buf.push(FIGS);
                        }
                        buf.push(code);
                    }
                }
            }
        }
        return buf;
    }
    
    function txnext() {
        //var str = "the quick brown fox 1a2b3c4d"
        var str = par.gettext;
        var codes = txencode(str);
        return codes;
    }
    
    
    var desiredOutput = 4096;

    */
    /**
     * Overridden from Mode.  This method is called by
     * the audio interface when it needs a fresh buffer
     * of sampled audio data at its sample rate.  If the
     * mode has no current data, then it should send padding
     * in the form of what is considered to be an "idle" signal
     */   
     /*                          
    this.transmit = function() {

        var symbollen = samplesPerSymbol;
        var buf = [];
        var codes = txnext();
        var len = codes.length;
        for (var idx = 0 ; idx < len ; idx++) {
            var code = codes[i];
            for (var s=0 ; s<symbollen ; s++) buf.push(spaceFreq);
            var mask = 1;
            for (var ib=0 ; ib < 5 ; ib++) {
                var bit = (code & mask) === 0;
                var f = (bit) ? spaceFreq : markFreq;
                for (j=0 ; j < symbollen ; j++) buf.push(f);
                mask <<= 1;
                }
            for (var s2=0 ; s2<symbollen ; s2++) buf.push(spaceFreq);
            }
        
        var pad = desiredOutput - buf.length;
        while (pad--)
            buf.push(spaceFreq);
        //var res = buf.toArray.map(txlpf.update)
        //todo
    };
    */

}// RttyMode



