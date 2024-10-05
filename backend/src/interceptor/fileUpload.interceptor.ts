import { UseInterceptors, applyDecorators } from "@nestjs/common";
import {FileInterceptor, FilesInterceptor} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FileCleanupInterceptor } from "./fileCleanup.interceptor";

export function MultiFileUploadInterceptor() {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor("files", 2,{
        storage: diskStorage({
          destination: './tmp',
          filename: (req, file, cb) => {
            console.log(file.originalname)
            cb(null, file.originalname);
          },
        }),
      }),
      FileCleanupInterceptor
    )
  );
}
export function SingleFileUploadInterceptor() {
  return applyDecorators(
      UseInterceptors(
          FileInterceptor("file",{
            storage: diskStorage({
              destination: './tmp',
              filename: (req, file, cb) => {
                console.log(file.originalname)
                cb(null, file.originalname);
              },
            }),
          }),
          FileCleanupInterceptor
      )
  );
}