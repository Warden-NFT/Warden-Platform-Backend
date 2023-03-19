import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ROLE } from '../../common/roles';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class CustomerGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();
    const payload = context.switchToHttp().getRequest().user;
    if (payload.role !== ROLE.CUSTOMER) throw new ForbiddenException();
    const user = await this.userService.findById(payload.uid);
    if (user == null) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class EventOrganizerGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();
    const payload = context.switchToHttp().getRequest().user;
    if (payload.role !== ROLE.EVENT_ORGANIZER) throw new ForbiddenException();
    const user = await this.userService.findById(payload.uid);
    if (user == null) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const valid = await super.canActivate(context);
    if (!valid) throw new UnauthorizedException();
    const payload = context.switchToHttp().getRequest().user;
    if (payload.role !== ROLE.ADMIN) throw new ForbiddenException();
    const user = await this.userService.findById(payload.uid);
    if (user == null) throw new UnauthorizedException();
    return true;
  }
}
