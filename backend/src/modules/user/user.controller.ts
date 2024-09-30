import {
  Body,
  Controller,
  Post,
 UsePipes, ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import {ApiTags} from "@nestjs/swagger";
import {AuthRegisterDto} from "./user.dto";

@ApiTags("User Authentication")
@Controller({
  path: "user",
  version: "1"
})
export class UserController
{
  constructor(protected userService: UserService) {}

  @Post("register")
  @UsePipes(ValidationPipe)
  async register(
      @Body() authRegisterUserDto: AuthRegisterDto
  ): Promise<{}> {
    const id = await this.userService.register(authRegisterUserDto);
    return {
      id
    }
  }

  @Post("login")
  async login(
      @Body() login: AuthRegisterDto
  ): Promise<{
    isLoginSuccess: boolean

  }> {
    const isLoginSuccess = await this.userService.login(login);

    return {
      isLoginSuccess
    }
  }
}
