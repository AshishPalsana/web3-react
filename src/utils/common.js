// Function to add commas to a number
export function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// Function to convert string to a substring with ellipsis
export const convertToSubString = (str, to) => {
  const newString = str?.substring(0, 20) + "..." + str?.substring(str.length - 10, str.length);
  return str.length > 25 ? newString : str;
};

// Function to shorten text with ellipsis
export const shortenText = (str, toLen) => {
  const newString = str?.substring(0, toLen) + "...";
  return str.length > toLen + 3 ? newString : str;
};

// Function to cut address with ellipsis
export const cutAddress = (account, len = 5) => {
  return account?.substring(0, len) + "...." + account?.substring(account.length - (len - 1));
};

// Function to copy text to clipboard
export const copyTextToClipboard = async (textToCopy) => {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(textToCopy);
  } else {
    return document.execCommand("copy", true, textToCopy);
  }
};

// Function to convert a string to slug format
export const convertToSlug = (str) => {
  return str.split(" ").join("-").toLowerCase();
};

// Crop Image Code
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  fileName,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  const base64 = canvas.toDataURL("image/jpeg");
  const blob = await fetch(base64).then((res) => res.blob());
  const file = new File([blob], fileName, { type: "image/png" });
  return file;

  // As a blob
  // return new Promise((resolve, reject) => {
  //   canvas.toBlob((file) => {
  //     resolve(URL.createObjectURL(file));
  //   }, "image/jpeg");
  // });
}

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export const delayTime = (ms) => new Promise((res) => setTimeout(res, ms));

// Function to convert a string to a slug
export const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Function to format a number with leading zero
export const numFormatter = (num) => {
  return num < 10 ? `0${num}` : num;
};

// Function to format a number with commas as thousand separators
export const currencyFormatter = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};
