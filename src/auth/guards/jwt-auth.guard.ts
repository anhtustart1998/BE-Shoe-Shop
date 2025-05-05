import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// This guard uses the JWT strategy to authenticate users based on the JWT token provided in the request headers.
// It will automatically validate the token and attach the user information to the request object if the token is valid.
