// src/models/CardModel.js

export default class CardModel {
  constructor({
    cardNumber,
    expiryMonth,
    expiryYear,
    cvv,
    balance = 0
  }) {
    this.cardNumber   = cardNumber;    
    this.expiryMonth  = expiryMonth;   
    this.expiryYear   = expiryYear;    
    this.cvv          = cvv;          
    this.balance      = balance;    
  }
}
