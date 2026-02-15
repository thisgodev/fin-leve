
export const generatePixPayload = (amount: number, description: string) => {
  const pixKey = process.env.PIX_KEY || "seu-pix@email.com";
  const merchantName = "FINANCEIRO LEVE";
  const merchantCity = "SAO PAULO";
  
  // Simplificação de um payload PIX (BRCode)
  // Em produção, deve-se usar uma biblioteca robusta de geração de BRCode
  return `00020126330014BR.GOV.BCB.PIX0111${pixKey}520400005303986540${amount.toFixed(2)}5802BR5915${merchantName}6009${merchantCity}62070503***6304`;
};

export const getPixQrCodeUrl = (payload: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}`;
};
