
const generateBarcode = () => {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
};
export { generateBarcode };
  




// npm install react-barcode

// import Barcode from "react-barcode";
// <Barcode value="9823467123456" />;
