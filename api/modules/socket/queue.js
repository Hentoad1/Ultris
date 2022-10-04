class Queue{
  constructor(){
    this.values = [];
    this.held = null;
    this.bagSalt = null;
    this.bags = 1;
  }

  reset(salt){
    this.values = [];
    this.held = null;
    this.bagSalt = salt;
    this.bags = 1;

    this.generate();
  }

  hold(){
    if (this.held){
      let swap = this.held;
      this.held = this.values[0];
      this.values[0] = swap;
    }else{
      this.held = this.values.shift();
      this.generate();
    }
  }

  next(){
    let value = this.values.shift();
    this.generate();
    return value;
  }

  getCurrent(){
    return this.values[0];
  }

  getHeld(){
    return this.held;
  }

  getAll(){
    return this.values;
  }

  generate(){
    if (this.values.length > 7){
      return;
    }

    this.values = this.values.concat(this.newBag());
    this.generate();
  }

  newBag(){
    const pieceChars = ['T','J','I','Z','L','S','O'];
    
    this.bags++;
    let salt = this.bagSalt * (this.bags + this.bagSalt) / (this.bags - this.bagSalt) - (this.bags % this.bagSalt) % 1;
    
    salt *= 10;
    let round = Math.floor(salt) % 2 === 0;
    salt %= 1;
    
    
    let randomInts = [];
    for (let i = 0; i < 7; i++){	
      salt *= 10;
      randomInts.push(Math.floor(salt));
      salt %= 1;
    }
    
    let remaining = new Set([0,1,2,3,4,5,6]);
    let output = [];
    
    for (let i = 0; i < 7; i++){	
      let weighted = Math.floor(randomInts[i] * 12 / 9) / 2;
      if (weighted % 1 === 0.5){
        weighted += round ? 0.5 : -0.5;
      }
      while(!remaining.has(weighted)){
        weighted = (weighted + 1) % 7
      }
      remaining.delete(weighted);
      output.push(pieceChars[weighted]);
    }

    return output;
  }
}


module.exports = Queue;