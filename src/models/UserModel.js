// src/models/UserModel.js

export default class UserModel {
  constructor(uid, ad, soyad, email, birth, createdAt) {
    this.uid = uid;
    this.ad = ad;
    this.soyad = soyad;
    this.email = email;
    this.birth = birth;
    this.createdAt = createdAt || new Date().toISOString();
  }
}
