import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Creamos un enrutador de archivos para nuestra aplicación
export const ourFileRouter = {
  // Definimos una ruta para subir imágenes de productos
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Middleware: Se ejecuta antes de subir el archivo
    .middleware(async ({ req }) => {
      // Podríamos verificar aquí la cookie de admin_session
      // Pero como Next.js 16 ya tiene nuestro proxy interceptor en /admin, 
      // esto es doblemente seguro si el upload component se renderiza en /admin
      return { uploadedBy: "admin" };
    })
    // onUploadComplete: Se ejecuta después de subir el archivo
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Subida completada por:", metadata.uploadedBy);
      
      // Usamos ufsUrl que es el nuevo estándar de v7+
      const finalUrl = (file as any).ufsUrl || file.url;
      console.log("URL del archivo:", finalUrl);
      return { url: finalUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
