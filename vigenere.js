var UIElements = {
  cipher: document.getElementById("cipher"),
  decipherBtn: document.getElementsByClassName("vigenere-button")[0],
  frequencies: document.getElementsByClassName("vigenere-frequencies")[0],
  frequencyTemplate: document.getElementsByClassName("vigenere-frequency")[0],
  coincidences: document.getElementsByClassName("vigenere-coincidences")[0],
  coincidenceTemplate: document.getElementsByClassName("vigenere-coincidence")[0],
  keyLength: document.getElementsByClassName("vigenere-key-length")[0],
  key: document.getElementsByClassName("vigenere-key")[0]
};

var Vigenere = (function(){
  var cipher;
  var frequencies = {};
  var english_frequencies = [
    .082,
    .015,
    .028,
    .043,
    .127,
    .022,
    .020,
    .061,
    .070,
    .002,
    .008,
    .040,
    .024,
    .067,
    .075,
    .019,
    .001,
    .060,
    .063,
    .091,
    .028,
    .010,
    .023,
    .001,
    .020,
    .001
  ];

  var key_length;
  var key;

  var MAX_BAR_HEIGHT = 300;
  var MAX_KEY_LENGTH = 8;
  var MIN_KEY_LENGTH = 3;

  var getAlphabet = function(){
    var alphabet = {};
    var l1 = "A".charCodeAt(0);
    var l2 = "Z".charCodeAt(0);
    for(; l1 <= l2; ++l1){
      alphabet[String.fromCharCode(l1)] = 0;
    }

    return alphabet;
  };

  var getFrequencies = function(c){
    var f = getAlphabet();
    for(var i=0; i<c.length; i++){
      var char = c.charAt(i).toUpperCase();
      if(/^[a-zA-Z]+$/.test(char)){
        f[char] = f[char] ? f[char] + 1 : 1;
      }
    }
    return f;
  }

  var setFrequencies = function(){
    frequencies = getFrequencies(cipher);

    for(var f in frequencies){
      var block = UIElements.frequencyTemplate.cloneNode(true);
      block.style.display = "inline-block";

      var bar = block.getElementsByClassName("bar")[0];
      bar.style.height = ((frequencies[f]/cipher.length)*300) + "px";
      bar.getElementsByClassName("letter-count")[0].innerHTML = frequencies[f];

      var letter = block.getElementsByClassName("letter")[0];
      letter.innerHTML = f;

      UIElements.frequencies.appendChild(block);
    }

    UIElements.frequencies.style.display = "block";
  };

  var appendCoincidence = function(d, c, isInitial){
    var block = UIElements.coincidenceTemplate.cloneNode(true);
    block.style.display = "inline-block";
    block.getElementsByClassName("displacement")[0].innerHTML = d;
    block.getElementsByClassName("coincidence")[0].innerHTML = c;
    if(isInitial == true){
      block.setAttribute("id", "vigenere-coincidence-initial");
      block.setAttribute("class", "");
    }
    UIElements.coincidences.appendChild(block);
  };

  var getKeyLength = function(){
    var len = MIN_KEY_LENGTH, coincidences = {};
    var cipherArray = cipher.split("");

    while(len < MAX_KEY_LENGTH){
      var cipherShifted = cipherArray.slice(len-1, cipherArray.length);
      for(var i=0; i<cipherShifted.length; i++){
        if(cipherArray[i] == cipherShifted[i]){
          coincidences[len-1] = (typeof coincidences[len-1] == "undefined") ? 0 : coincidences[len-1];
          coincidences[len-1] += 1;
        }
      }
      len++;
    }

    var max = 0;
    appendCoincidence("Displacement", "Coincidences", true);
    for(var c in coincidences){
      if(coincidences[c] > max){
        max = coincidences[c];
        key_length = c;
      }
      appendCoincidence(c, coincidences[c], false);
    }

    UIElements.keyLength.innerHTML = "Key length is most likely " + key_length;
    UIElements.keyLength.style.display = "block";
    UIElements.coincidences.style.display = "block";
  };

  var normalize = function(arr){
    var sum = 0;
    for(var i=0; i<arr.length; i++){
      sum += arr[i];
    }

    return sum;
  }

  var dotProduct = function(arr1, arr2){
    var prod = [];
    if(arr1.length == arr2.length){
      for(var i=0; i<arr1.length; i++){
        prod.push(arr1[i]*arr2[i]);
      }
    }
    return normalize(prod);
  }

  var getKey = function(){
    var key_len = parseInt(key_length, 10);
    var key_string = "";
    for(var h=0; h<key_len; h++){
      var shiftedCipher = "";
      for(var i=h; i<cipher.length; i=i+key_len){
        shiftedCipher += cipher[i];
      }
      var u = getFrequencies(shiftedCipher);
      var _U = []; //vector
      for(var j in u){
        var factor = u[j]/shiftedCipher.length;
        u[j] = factor;
        _U.push(u[j]);
      }

      var max = 0;
      var kmax = 0;
      for(var k=1; k<26; k++){
        var temp = english_frequencies.slice(-1*k);
        temp = temp.concat(english_frequencies.slice(0, english_frequencies.length-k));
        var p = dotProduct(_U, temp);
        if(p > max){
          max = p;
          kmax = k;
        }
      }

      key_string += String.fromCharCode(97 + kmax);
    }

    UIElements.key.getElementsByClassName("vigenere-key__val")[0].innerHTML = key_string;
    UIElements.key.style.display = "block";
  };

  var clear = function(){
    UIElements.frequencies.innerHTML = "";
    UIElements.coincidences.innerHTML = "";
  };

  var decipher = function(c){
    clear();

    cipher = c;
    cipher = cipher.replace(/ /g,"").replace(/\r?\n|\r/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    cipher = cipher.toUpperCase();
    console.log(cipher);
    setFrequencies();
    getKeyLength(); //index of coincidence
    getKey();
  };

  var init = function(){
    getAlphabet();
  };

  return {
    init: init,
    decipher: decipher
  };

})();

UIElements.decipherBtn.onclick = function(){
  var cipher = UIElements.cipher.value;
  Vigenere.decipher(cipher);
};

document.addEventListener('DOMContentLoaded', function(){
  Vigenere.init();
}, false);
