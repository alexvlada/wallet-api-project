import { APIRequestContext } from '@playwright/test';

export class AuthApi {
  constructor(
    private readonly request: APIRequestContext
  ) {}

  async login(
    username: string,
    password: string,
    serviceId: string
  ) {
    return this.request.post('/user/login', {
      headers: {
        'X-Service-Id': serviceId,
      },
      data: {
        username,
        password,
      },
    });
  }
}