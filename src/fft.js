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


 var Complex = require("./math").Complex;
 
 
/**
 * Perform a relatively-efficient FFT
 */
function FFT(N) {

    var N2 = N/2;
    var nrStages = Math.log(N) / Math.LN2;
    //todo: validate power-of-2, throw IAE if not

    function createBitReversedIndices(n) { 
		var xs = [];
		for (var i=0 ; i < n ; i++) {
		   var np = n;
		   var index = i;
		   var bitreversed = 0;
		   while (np > 1) {
			   bitreversed <<= 1;
			   bitreversed += index & 1;
			   index >>= 1;
			   np >>= 1;
		   }
		   xs[xs.length] = bitreversed;
		}
		return xs;
	}
	var bitReversedIndices = createBitReversedIndices(N);

    /**
     * This piece does not need to be fast, just correct
     */
    function generateStages() {
		var xs = [];
		var span  = 1;
		var wspan = N2;
		var ninv = 1 / N;
		for (var stage=0 ; stage < nrStages ; stage++, span <<= 1, wspan >>= 1) {
			var stageData  = [];
			for (submatrix=0; submatrix<N2/span; submatrix++) {
				var np = submatrix * span * 2;
				var ni = np;
				for (node=0; node<span ; node++) {
				   var l = ni;
				   var r = ni + span;
				   var idx = node * wspan;
				   var wr = Math.cos(Math.PI*2.0*node*wspan * ninv);
				   var wi = Math.sin(Math.PI*2.0*node*wspan * ninv);
				   stageData.push({l:l,r:r,wr:wr,wi:wi,idx:idx});
				   ni++;
				}
			}
			xs[xs.length] = stageData;
		}
		return xs;
	}
	var stages = generateStages();
    this.stages = stages;


    function apply(input) {
    
        //local refs
        var n2     = N2;
        var nrStgs = nrStages;
        var stgs   = stages;

        var outr = [];
        var outi = [];
        for (var idx = 0 ; idx<N ; idx++) {
            //todo:  apply Hann window here
            var bri = bitReversedIndices[idx];
            var v = input[bri];
            //console.log("v:" + bri + " : " + v);
            //outr.push(v);
            //outi.push(0);
            outr[outr.length] = v;
            outi[outi.length] = 0;
        }
        
        for (var stage=0 ; stage<nrStgs ; stage++) {
            var stageData = stgs[stage];
            for (var i = 0; i < n2; i++) {
                var parms   = stageData[i];
                var wr      = parms.wr;
                var wi      = parms.wi;
                var left    = parms.l;
                var right   = parms.r;
                var leftr   = outr[left];
                var lefti   = outi[left];
                var rightr  = wr * outr[right] - wi * outi[right];
                var righti  = wi * outr[right] + wr * outi[right];
                outr[left]  = leftr + rightr;
                outi[left]  = lefti + righti;
                outr[right] = leftr - rightr;
                outi[right] = lefti - righti;
            }
        }

        var output = { r : outr, i: outi };
        return output;
    }
      
    function powerSpectrum(input) {
    
        var out  = apply(input);
        var rarr = out.r;
        var iarr = out.i;
        var len  = N2;
        
        var ps = [];
        for (var j=0 ; j<len ; j++) {
            var r = rarr[j];
            var i = iarr[j];
            ps[j] = r*r + i*i;
        }
        return ps;
    }
    this.powerSpectrum = powerSpectrum;

} //FFT




function FFTSR(N) {
    "use strict";

    var power = (Math.log(N) / Math.LN2) | 0;
	var N2 = N >> 1;

    function generateBitReversedIndices(n) { 
		var xs = [];
		for (var i=0 ; i < n ; i++) {
		   var np = n;
		   var index = i;
		   var bitreversed = 0;
		   while (np > 1) {
			   bitreversed <<= 1;
			   bitreversed += index & 1;
			   index >>= 1;
			   np >>= 1;
		   }
		   xs[xs.length] = bitreversed;
		}
		return xs;
	}
	var bitReversedIndices = generateBitReversedIndices(N);
	
	//let's pre-generate anything we can
	function generateStageData(pwr) {
	    var xs = [];
	    for (var k=1, n2=4 ; k<pwr ; k++, n2<<=1) {
		    var stage = [];
		    var n4 = n2 >> 2;
			var e = -2.0 * Math.PI / n2; 
			for (var j=1; j<n4; j++) {
				var a = j * e;
				var w1 = new Complex(Math.cos(a), Math.sin(a));
				var w3 = new Complex(Math.cos(a*3), Math.sin(a*3));
				stage[stage.length] = { w1: w1, w3: w3 };
		    }
		    xs[xs.length] = stage;
		}
	    return xs;
	}
	
	var stages = generateStageData(power);

	function apply(input) {
	    var ix, id, i0, i1, i2, i3;
		var j,k;
		var t, t0, t1;
		var n2, n4;

        var x = [];
        for (var idx = 0 ; idx<N ; idx++) {
            var bri = bitReversedIndices[idx];
            x[x.length] = new Complex(input[bri], 0);
        }
		
		for (ix=0, id=4 ;  ix<N ;  id<<=2) { 
			for (i0=ix; i0<N; i0+=id) {
			    i1 = i0+1;
				t = x[i1].sub(x[i0]);
				x[i0] = x[i0].add(x[i1]);
				x[i1] = t;
			}
			ix = id + id - 2; //2*(id-1);
		}
		
		var stageidx = 0;
		n2 = 4; // == 4, 8, 16, ..., n
		n4 = 1; // == 1, 2, 4, 8
		for (k=1 ; k<power ; k++, n2<<=1, n4<<=1) {
		
		    var stage = stages[stageidx++];

		    // first part : j==0:
			id = (n2<<1);
			//j=0 ; ix=j
			for (ix=0 ; ix<N ; ix = (id<<1)-n2, id <<= 2) {
				for (i0=ix; i0<N; i0+=id)	{
					i1 = i0 + n4;
					i2 = i1 + n4;
					i3 = i2 + n4;

					t0 = x[i3];
					t1 = x[i2];

					//sumdiff(t0, t1);
					t  = t1.sub(t0);
					t0 = t0.add(t1);
					t1 = t;
					
					// t1 *= Complex(0, 1);  // -isign
					t1 = t1.isign();

					//sumdiff3(x[i0], t0, x[i2]);
					x[i0] = x[i0].add(t0);
					x[i2] = x[i0].sub(t0);
					//sumdiff3(x[i1], t1, x[i3]);
					x[i1] = x[i1].add(t1);
					x[i3] = x[i1].sub(t1);
			   }
			}

			var dataidx = 0;
			for (j=1; j<n4; j++) {
				
				var data = stage[dataidx++];
				var w1 = data.w1;
				var w3 = data.w3;
				
				id = (n2<<1);
				for (ix=j ; ix<N ; ix = (id<<1)-n2+j, id <<= 2) {
					for (i0=ix; i0<N; i0+=id)	{
						i1 = i0 + n4;
						i2 = i1 + n4;
						i3 = i2 + n4;

						t0 = x[i3].mul(w3);
						t1 = x[i2].mul(w1);
						
						//sumdiff(t0, t1);
						t  = t1.sub(t0);
						t0 = t0.add(t1);
						t1 = t;
						
						// t1 *= Complex(0, 1);  // -isign
                        t1 = t1.isign();
						//sumdiff3(x[i0], t0, x[i2]);
						x[i0] = x[i0].add(t0);
						x[i2] = x[i0].sub(t0);
						//sumdiff3(x[i1], t1, x[i3]);
						x[i1] = x[i1].add(t1);
						x[i3] = x[i1].sub(t1);
				    }
				}
			}
		}
		return x;
	}//apply
	
    function powerSpectrum(input) {
    
        var x  = apply(input);
        var len  = N2;
        
        var ps = [];
        for (var j=0 ; j<len ; j++) {
            ps[ps.length] = x[j].mag();
        }
        return ps;
    }
    this.powerSpectrum = powerSpectrum;
	
	
} //FFTSR




module.exports.FFT=FFT;
module.exports.FFTSR=FFTSR;
