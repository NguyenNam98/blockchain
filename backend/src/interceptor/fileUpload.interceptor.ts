import { UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FileCleanupInterceptor } from "./fileCleanup.interceptor";

export function FileUploadInterceptor() {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor("file", {
        storage: diskStorage({
          destination: '/tmp',
          filename: (req, file, cb) => {
            cb(null, file.originalname);
          },
        }),
      }),
      FileCleanupInterceptor
    )
  );
}
