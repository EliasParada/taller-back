import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
  constructor(
    private readonly authService: AuthService
  ){
    super({
      usernameField: 'email',
    })
  }

  async validate(email: string, password: string){
    console.log('>>> LocalStrategy.validate()', { email, password });

    const user = await this.authService.verifyUser(email, password);

    console.log('>>> LocalStrategy.validate() user result:', user);
    return this.authService.verifyUser(email, password);
  }
}