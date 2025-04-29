import CryptoJS from 'crypto-js';

export class Encrypt {

  private generateStringFromAsciiValues(asciiValues: number[]): string {
    return asciiValues.map(asciiValue => String.fromCharCode(asciiValue)).join('');
  }

  private generateKey(): string {
    const asciiKeyValues = [65, 50, 68, 54, 55, 52, 51, 70, 49, 56, 55, 53, 52, 53, 67, 52];
    return this.generateStringFromAsciiValues(asciiKeyValues);
  }
  private generateIV(): string {
    const asciiIVValues = [66, 48, 67, 53, 65, 67, 52, 53,53, 68, 49, 53, 56, 66, 55, 48];
    return this.generateStringFromAsciiValues(asciiIVValues);
  }

  public encryptData(requestData: any) {

    const iv = this.generateIV();
    const key = this.generateKey();;
    const fkey = CryptoJS.enc.Utf8.parse(key);
    const fiv = CryptoJS.enc.Utf8.parse(iv);

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(requestData), fkey, {
      iv: fiv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const encryptedBase64 = encryptedData.ciphertext.toString(CryptoJS.enc.Base64);
    return encryptedBase64;
  }

  public decrypData(cipherText: any) {
    
    //console.log("text", JSON.stringify(cipherText))
    //console.log(cipherText)
    const iv = this.generateIV();
    const key = this.generateKey();;
    const fkey = CryptoJS.enc.Utf8.parse(key);
    const fiv = CryptoJS.enc.Utf8.parse(iv);
    const decrypted = CryptoJS.AES.decrypt(cipherText, fkey, {
      iv: fiv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8)
    //console.log("checkmate")
    //console.log(decryptedData)
    return decryptedData;
  }

}