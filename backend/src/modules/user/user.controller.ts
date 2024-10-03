import {
  Body,
  Controller, Get,
  Post, Res,
  UsePipes, ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import {ApiTags} from "@nestjs/swagger";
import {AuthLoginDto, AuthRegisterDto} from "./user.dto";
import * as archiver from 'archiver';

@ApiTags("User Authentication")
@Controller({
  path: "user",
  version: "1"
})
export class UserController
{
  constructor(protected userService: UserService) {}


  @Get("gen-key")

  async genKeyPair(
      @Res() res,
  ) {
    const {publicKey, privateKey} = await this.userService.genKeyPair();
    // Create a zip file
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set the response headers for downloading a zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=keys.zip');

    // Pipe the zip stream to the response
    archive.pipe(res);

    // Add the public and private keys to the zip
    archive.append(publicKey, { name: 'public.pem' });
    archive.append(privateKey, { name: 'private.pem' });

    // Finalize the zip file
    archive.finalize();
  }
  @Post("register")
  @UsePipes(ValidationPipe)
  async register(
      @Body() authRegisterUserDto: AuthRegisterDto
  ): Promise<{}> {
    const data = await this.userService.register(authRegisterUserDto);
    return {
      data
    }
  }

  @Post("login")
  async login(
      @Body() login: AuthLoginDto,
      @Res() res
  ): Promise<any> {
    const user = await this.userService.login(login);

    res.send({
      isLoginSuccess: !!user,
      userId: user?.id,
      userName: user?.userName,
    })
  }
}
