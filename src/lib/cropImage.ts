 import type { Area } from "react-easy-crop";
 
 const createImage = (url: string): Promise<HTMLImageElement> =>
   new Promise((resolve, reject) => {
     const image = new Image();
     image.addEventListener("load", () => resolve(image));
     image.addEventListener("error", (error) => reject(error));
     image.setAttribute("crossOrigin", "anonymous");
     image.src = url;
   });
 
 /**
  * Crops an image based on the provided pixel crop area and returns a Blob.
  * Output is a 400x400 JPEG at 90% quality.
  */
 export async function getCroppedImg(
   imageSrc: string,
   pixelCrop: Area,
   outputSize = 400
 ): Promise<Blob> {
   const image = await createImage(imageSrc);
   const canvas = document.createElement("canvas");
   const ctx = canvas.getContext("2d");
 
   if (!ctx) {
     throw new Error("No 2d context");
   }
 
   canvas.width = outputSize;
   canvas.height = outputSize;
 
   ctx.drawImage(
     image,
     pixelCrop.x,
     pixelCrop.y,
     pixelCrop.width,
     pixelCrop.height,
     0,
     0,
     outputSize,
     outputSize
   );
 
   return new Promise((resolve, reject) => {
     canvas.toBlob(
       (blob) => {
         if (blob) {
           resolve(blob);
         } else {
           reject(new Error("Canvas is empty"));
         }
       },
       "image/jpeg",
       0.9
     );
   });
 }