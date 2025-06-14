import JsBarcode from 'jsbarcode';

export const generateBarcodeDataURL = (value: string, options?: any): string => {
  const canvas = document.createElement('canvas');
  
  try {
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      textAlign: 'center',
      textPosition: 'bottom',
      ...options
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    return '';
  }
};

export const printBarcode = (value: string, productName: string, price: number) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const barcodeDataURL = generateBarcodeDataURL(value);
  
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Barcode Label</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .label {
          border: 2px solid #000;
          padding: 15px;
          text-align: center;
          width: 250px;
          background: white;
        }
        .shop-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .product-name {
          font-size: 12px;
          margin-bottom: 8px;
          word-wrap: break-word;
        }
        .price {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .barcode-img {
          margin: 8px 0;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .label { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="shop-name">CLOTHING STORE</div>
        <div class="product-name">${productName}</div>
        <div class="price">₹${price.toLocaleString()}</div>
        <img src="${barcodeDataURL}" alt="Barcode" class="barcode-img" />
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};