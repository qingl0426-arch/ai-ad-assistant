import { AlipaySdk } from "alipay-sdk";
import crypto from "crypto";

let _alipay: AlipaySdk | null = null;

export function getAlipay(): AlipaySdk {
  if (!_alipay) {
    _alipay = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: process.env.ALIPAY_GATEWAY || "https://openapi.alipay.com/gateway.do",
      charset: "utf-8",
      version: "1.0",
      signType: "RSA2",
    });
  }
  return _alipay;
}

export function generateOutTradeNo(): string {
  return `${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
}
