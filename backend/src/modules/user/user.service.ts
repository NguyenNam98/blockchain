import { Injectable } from "@nestjs/common";
import {ProfileKeyService} from "../../services/profileKey.service";
import {InjectDataSource} from "@nestjs/typeorm";
import {DatabaseModule} from "../../database.module";
import {DATABASE_NAMES} from "../../app.constant";
import {DataSource} from "typeorm";
import {AuthLoginDto, AuthRegisterDto} from "./user.dto";
import {User} from "../../entities/user.entity";
import {BusinessException} from "../../app.exception";

@Injectable()
export class UserService {

  constructor(
      private profileKey : ProfileKeyService,
      @InjectDataSource(DatabaseModule.getConnectionName(DATABASE_NAMES.MASTER))
      private masterConnection: DataSource
  ) {}
  async register(data: AuthRegisterDto): Promise<{
    id: string;
  }> {
    const userByEmail = await this.masterConnection.getRepository(User).findOne({
      where: {
        email: data.email
      }
    });
    if (userByEmail) {
      throw new BusinessException("Email already exists");
    }
    const id =  await this.masterConnection.getRepository(User).insert({
      email: data.email,
      password: data.password,
      userName: data.userName,
    });
    return {
      id: id.identifiers[0].id,
    }
  }

  async genKeyPair(): Promise<{
      publicKey: string;
      privateKey: string

  }> {

    const newKeyPair = await this.profileKey.generateKeyPair();

    return {
      ...newKeyPair
    }
  }
  async login(data: AuthLoginDto): Promise<User> {
    const userByEmail = await this.masterConnection.getRepository(User).findOne({
      where: {
        email: data.email,
        password: data.password
      }
    });
    return userByEmail;
  }
}
