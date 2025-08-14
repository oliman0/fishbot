const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const avg = (a, b) => (a + b)/2;

function randn_bm(min, max, skew) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  
  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) 
    num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
  
  else{
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}

const caughtFish = {
    weight_max: 40,
    weight_min: 10,
    weight_bias: 0.1
}

var total = 0;
for (var i = 0; i < 1000000; i++) {
    var w = randn_bm(caughtFish.weight_min, caughtFish.weight_max, 1-caughtFish.weight_bias);
    w = clamp(w, caughtFish.weight_min, caughtFish.weight_max);
    w = Math.round(w * 100) / 100;

    //console.log(w)
    total += w;
}

console.log(total/1000000);