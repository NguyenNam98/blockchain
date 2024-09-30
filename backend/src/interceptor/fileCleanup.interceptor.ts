import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { promisify } from 'util';
import * as fs from 'fs';

// Promisify the fs.unlink method to use async/await
const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class FileCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    return next.handle().pipe(
        tap(async () => {
          if (file) {
            try {
              await unlinkAsync(file.path);
              console.log(`File ${file.path} deleted successfully.`);
            } catch (err) {
              console.error(`Failed to delete file ${file.path}:`, err);
            }
          }
        }),
    );
  }
}
